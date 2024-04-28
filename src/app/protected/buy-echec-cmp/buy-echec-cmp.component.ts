import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  DestroyRef,
  DoCheck,
  inject,
  Inject,
  OnInit
} from '@angular/core';
import {TontineServiceService} from "../../Services/tontine-service.service";
import {ActivatedRoute} from "@angular/router";
import {Participation} from "../../../Models/Entitys/Participation";
import {Tontine} from "../../../Models/Abstracts/Tontine";
import {Cotisation} from "../../../Models/Entitys/Cotisation";
import {ParticipationEchec} from "../../../Models/ParticipationEchec";
import {MAT_DIALOG_DATA, MatDialog, MatDialogModule, MatDialogRef} from "@angular/material/dialog";
import {MatButtonModule} from "@angular/material/button";
import {BuyEchecComponent} from "../../dialogbox/buy-echec/buy-echec.component";
import {DataService} from "../../Services/data.service";
import {Beneficiaire} from "../../../Models/Entitys/Beneficiaire";
import {forkJoin, tap} from "rxjs";
import {takeUntilDestroyed} from "@angular/core/rxjs-interop";


@Component({
  selector: 'app-buy-echec-cmp',
  templateUrl: './buy-echec-cmp.component.html',
  styleUrls: ['./buy-echec-cmp.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BuyEchecCmpComponent implements OnInit, DoCheck{

  displayedColumns: string[] = ['position', 'name', 'cotisation', 'retard', 'echec'];

  dataSource:Participation[]=[];
  idCot!:number;
  idTontine!:number;
  tontine:Tontine|undefined;
  cot:Cotisation;
  Echecs:ParticipationEchec|undefined;
  benefs:Map<number,Beneficiaire> = new Map<number, Beneficiaire>();
  private destroyRef = inject(DestroyRef);



  constructor(private tontineService:TontineServiceService, private cd: ChangeDetectorRef,
        private route:ActivatedRoute,public dialog: MatDialog,private dataService:DataService) {
    // @ts-ignore
    this.cot=null;
  }

  ngDoCheck() {
    this.cd.markForCheck();
  }


  ngOnInit() {

    this.idCot = this.route.snapshot.params["id"];
    this.idTontine = this.route.snapshot.params["idTon"];
    this.cot=this.dataService.actualCotisation;
    this.tontine=this.dataService.actualTontine;
    let echecsCall =this.tontineService.getechecBeforeCot(this.idCot);
    let benefCall = this.tontineService.getAllLastbenef(this.idCot);

    forkJoin([echecsCall,benefCall]).pipe(
        takeUntilDestroyed(this.destroyRef),
        tap(
            data => {
              this.dataSource=data[0];
              for (let ben of data[1]){
                if(ben.enregistrement)
                  this.benefs.set(ben.enregistrement.id,ben);
              }
            }
        )
    ).subscribe(
        data=>{
          this.cd.markForCheck();
        }
    );
  }

  getclass(id:number):string{
    if(this.cot.beneficiaire?.enregistrement)
      if(this.benefs.has(id) && this.cot.beneficiaire?.enregistrement.id!=id)
        return "ben";
    return "nonBen";
  }

  checkBuy(part:Participation){
    if(!(part.tontine == part.echec)){
      return true;
    }
    return false;
  }


  openDialog(enterAnimationDuration: string, exitAnimationDuration: string, echec:Participation): void {
    if(this.getclass(Number(echec.enregistrement.id))=="ben")
      this.tontineService.participentHasben=true;
    else
      this.tontineService.participentHasben=false;
    this.dialog.open(BuyDialog, {
      width: '250px',
      enterAnimationDuration,
      exitAnimationDuration,
      data:echec,
    }).afterClosed().pipe(
        takeUntilDestroyed(this.destroyRef),
    ).subscribe(
        data =>
        this.cd.markForCheck()
    );
  }
}

@Component({
  selector: 'app-buy-echec',
  templateUrl: '../../dialogbox/buy-echec/buy-echec.component.html',
  changeDetection:ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [MatDialogModule, MatButtonModule],
})
export class BuyDialog implements OnInit {

  tontine!:Tontine
  hasBen:boolean=false;
  destroyRef = inject(DestroyRef);
  constructor(public dialogRef: MatDialogRef<BuyEchecComponent>,
              @Inject(MAT_DIALOG_DATA)
               public data:Participation,private tontineServ:TontineServiceService,
              private cd:ChangeDetectorRef) {}

  ngOnInit() {

    this.tontine = <Tontine>this.data.enregistrement.tontine;
    this.hasBen = this.tontineServ.participentHasben;
  }

  buy(){
    this.data.echec=false;
    this.data.updatedAt=new Date;
    console.log("data",this.data);
    this.tontineServ.saveParticipation(this.data).pipe(
        takeUntilDestroyed(this.destroyRef)
    ).subscribe(
      data =>{
        console.log("finish",data);
        this.cd.markForCheck();
      }
    );
  }

  getTauxEchec(){

    if(this.tontine.type?.code==1)
      return this.data.cotisation.tauxEchec;

    if(this.tontine.type?.code==2 && this.hasBen)
      return Number(this.tontine.tauxEchecB);

    return this.tontine.tauxEchec;
  }
}
