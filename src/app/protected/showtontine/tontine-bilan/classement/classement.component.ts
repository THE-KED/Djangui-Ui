import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  DestroyRef,
  inject,
  OnDestroy,
  OnInit
} from '@angular/core';
import {Participation} from "../../../../../Models/Entitys/Participation";
import {BilanServiceService} from "../../../../Services/bilan-service.service";
import {ActivatedRoute} from "@angular/router";
import {Enregistrement} from "../../../../../Models/Entitys/Enregistrement";
import {Subscription, tap} from "rxjs";
import {DataService} from "../../../../Services/data.service";
import {takeUntilDestroyed} from "@angular/core/rxjs-interop";
import {AuthService} from "../../../../Services/auth.service";

@Component({
  selector: 'app-classement',
  templateUrl: './classement.component.html',
  styleUrls: ['./classement.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class ClassementComponent implements OnInit,OnDestroy{

  parts:Participation[]=[];
  displayedColumns: string[] = ['position', 'name', 'E.N.P', 'echecs','affiche'];
  dataSource:Enregistrement[]=[];
  tab:Array<Enregistrement[]>=[];
  map:Map<number,Participation[]>= new Map<number, Participation[]>();
  idTontine=0;
  keys:number[]=[];
  index=0;
  PartsCall:Subscription = new Subscription();
  liste:number[][]=[];
  private destroyRef = inject(DestroyRef);
  constructor(private bilanService:BilanServiceService,private dataService:DataService,
              private router:ActivatedRoute,private cd: ChangeDetectorRef,
              private authService:AuthService) {
  }

  ngOnInit() {
    this.idTontine=Number(this.router.snapshot.params["id"]);
    console.log("id",this.idTontine);

    this.PartsCall=this.bilanService.getParts(this.idTontine).pipe(
        takeUntilDestroyed(this.destroyRef),
        tap(
            data=>{
              this.parts=data;

              let key:number;

              for(let part of this.parts){
                key=part.enregistrement.id
                if(!this.map.has(key)){
                  this.map.set(key,[part]);
                }
                else {
                  let parts= this.map.get(key);
                  if(parts){
                    parts.push(part);
                    this.map.set(key,parts);
                  }
                }
              }
              this.dispatchData();
            }
        )
    ).subscribe(
        data =>{
          this.cd.markForCheck();
        }
    );

  }
ngOnDestroy() {
    this.PartsCall.unsubscribe();
}

  canAfficheBtn(Enrg:Enregistrement){
    if(this.authService.role.includes("BUREAU"))
      return true;
    else
    if(this.authService.appUser)
      if (this.authService.appUser.membre.id==Enrg.membre.id)
        return true;
    return false;
  }

  dispatchData(){

    let nbEchecs=0;
    let nbRetard=0;
    let nbEchecsPaid=0;
    let dette:number =0;

    for (let key of this.map.keys()){


      let parts=this.map.get(key);
      if(parts){
        nbEchecs=0;
        nbEchecsPaid=0;
        nbRetard=0;
        dette=0;

        for (let part of parts){
          let cotDate=part.cotisation.createdAt;
          let enrgDate =part.enregistrement.createdAt;
          if(cotDate && enrgDate){
            if(!part.tontine){
              nbEchecs++;
            }
            if (!part.tontine && !part.echec && enrgDate<cotDate){
              nbEchecsPaid++;
            }
            if (part.retard){
              nbRetard++;
            }

          }
        }
        dette = nbEchecs-nbEchecsPaid;

        this.liste.push([key,nbEchecs,dette]);

      }

    }

    this.liste.sort((a,b)=>{
      if (a[2] !== b[2]) {
        return a[2] - b[2]; // Tri par dette croissante
      } else {
        return a[1] - b[1]; // Si les dettes sont égales, trie par nbEchecs croissants
      }
    });
    let alphaList:Enregistrement[]=[];
    let nonAlphaList:Enregistrement[]=[];
    for (let det of this.liste){
      let enrg=this.map.get(det[0])
      if(enrg){
        if (det[2]==0)
          alphaList.push(enrg[0].enregistrement);
        else
        nonAlphaList.push(enrg[0].enregistrement);
      }

    }

    this.dataSource=(alphaList.sort()).concat(nonAlphaList);
  }

  selectEnrg(enrg:Enregistrement) {
    this.dataService.selectedEnregistrement = enrg;
  }
}
