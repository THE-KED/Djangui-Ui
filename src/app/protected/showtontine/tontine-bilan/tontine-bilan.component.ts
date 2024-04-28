import {ChangeDetectionStrategy, ChangeDetectorRef, Component, DestroyRef, inject, OnInit} from '@angular/core';
import {Cotisation} from "../../../../Models/Entitys/Cotisation";
import {ActivatedRoute} from "@angular/router";
import {TontineServiceService} from "../../../Services/tontine-service.service";
import {BilanServiceService} from "../../../Services/bilan-service.service";
import {forkJoin, tap} from "rxjs";
import {AuthService} from "../../../Services/auth.service";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import {DataService} from "../../../Services/data.service";
import {Vente} from "../../../../Models/Entitys/Vente";
import {TontinesOps} from "../../../../Models/Abstracts/Interfaces/TontinesOps";
import {Simple} from "../../../../Models/Entitys/Simple";
import {takeUntilDestroyed} from "@angular/core/rxjs-interop";


@Component({
  selector: 'app-tontine-bilan',
  templateUrl: './tontine-bilan.component.html',
  styleUrls: ['./tontine-bilan.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TontineBilanComponent implements OnInit{

  displayedColumns: string[] = ['S','Date','Cot.','T.V.','Comp.','Supl.','Boi.','Ret.','E.P.','E.N.P.','bt'];
  displayedSimpleColumns: string[] = ['S','Date','Cot.','Comp.','Ret.','E.P.','E.N.P.','bt'];
  dataSource : Cotisation[] = [];
  nbParts:number[][]=[];
  nbRetards:number[][]=[]
  nbPaidEchec:number[][]=[];
  // paidEchec!:Observable<number[]>;
  nbNonPaidEchec:number[][]=[];
  idTontine!:number;
  nom:string="";
  nbToureGratuit:number=0;
  displayedFooterColumns= ['label','total','totalComplement','totalSuplement','boisson','totalRt','totalE.P','totalE.N.P','space'];
  displayedFooterSimpleColumns= ['label','total','totalComplement','totalRt','totalE.P','totalE.N.P','space'];
  tontine!:TontinesOps;
  type="Vente";
  lableColspan=3;
  role="";
  tontineOperable!:TontinesOps;
  result!:Map<string,number>
  private destroyRef = inject(DestroyRef);


  constructor(
    private router:ActivatedRoute,private tontineService:TontineServiceService,
    private bilanServ:BilanServiceService,private authserv:AuthService,
    private dataService:DataService,private cd: ChangeDetectorRef) {
  }
  ngOnInit() {

    this.idTontine=this.router.snapshot.params["id"];
    this.role=this.authserv.role;
    this.tontine=this.dataService.actualTontine;

    let cotsCall=this.tontineService.getCotisation(this.idTontine);
    let nbCotsCall = this.bilanServ.getNbCotisation(this.idTontine);
    let nbRetardCall = this.bilanServ.getNbRetard(this.idTontine);
    let nbPaidCall = this.bilanServ.getNbPaidEchec(this.idTontine);
    let nbNonPaidsCall = this.bilanServ.getNbNonPaidEchec(this.idTontine);

    forkJoin([cotsCall,nbCotsCall,nbRetardCall,nbPaidCall,nbNonPaidsCall]).pipe(
        takeUntilDestroyed(this.destroyRef),
        tap(
            data=>{
              this.dataSource = data[0];
              this.dataSource = this.dataSource.sort((a, b) => {
                return a.rang>b.rang?1:-1;
              });

              if(this.dataSource.length>0)
                this.nom=data[0][0].nom;
              for (let cot of data[0]){
                if(cot.gratuit)
                  this.nbToureGratuit++;
              }
              this.nbParts = data[1];
              this.nbRetards = data[2];
              this.nbPaidEchec =data[3];
              this.nbNonPaidEchec =data[4];
              console.log("nbRetards: " ,this.nbRetards);
              this.type=this.tontine.type.nom;
              if(this.type=="Vente"){
                this.lableColspan=3;
                this.tontineOperable = new Vente(this.tontine.id,this.tontine.actif,this.tontine.nom,
                    this.tontine.type,this.tontine.tauxTontine,this.tontine.tauxEchec,
                    this.tontine.tauxRetard,this.tontine.frequence,this.tontine.createdAt,
                    this.tontine.updatedAt,this.tontine.nbSeances,this.tontine.tauxEchecB);

              }
              if (this.type=="Simple"){
                this.lableColspan=2;
                this.tontineOperable = new Simple(this.tontine.id,this.tontine.actif,this.tontine.nom,
                    this.tontine.type,this.tontine.tauxTontine, this.tontine.tauxEchec,
                    Number(this.tontine.tauxEchecB), this.tontine.tauxRetard,this.tontine.frequence,
                    this.tontine.createdAt,this.tontine.updatedAt,this.tontine.nbSeances,this.tontine.boisson);
              }

            }
        ),
    ).subscribe(
        data => {
          this.result = this.tontineOperable.getTotals(this.dataSource,this.nbParts,this.nbRetards,this.nbNonPaidEchec,this.nbPaidEchec);
          console.log("Result:",this.result);
          this.cd.markForCheck();
        }
    );
  }

  getTableHeader(){
    if (this.type=="Vente")
      return this.displayedColumns;
    else
      return this.displayedSimpleColumns;
  }
  getTableFooter(){
    if (this.type=="Vente")
      return this.displayedFooterColumns;
    else
      return this.displayedFooterSimpleColumns;
  }

  // renvoi le nombre de participation qu'il y'a eu a une cotisation
  nbPart(idCot:number,rang:number){
    let cot =this.dataSource[rang-1];
    for(let part of this.nbParts ){

      if(part[0]==idCot){
        return part[1];
      }
    }
    return 0;
  }

  nbPaid(idCot:number,rang:number){
    let cot =this.dataSource[rang-1];
    for(let echec of this.nbPaidEchec ){

      if(echec[0]==idCot){
        return echec[2]*(cot.tauxEchec>=500?cot.tauxEchec:500);
      }
    }
    return 0;
  }

  // renvoi le suplement a une cotisation
  getSupl(id:number){

    let dif=0;
    for (let nbPart of this.nbParts){
      if(nbPart[0]==id)
        dif = nbPart[1] - this.tontine.nbSeances;
    }
    if (dif<=0)
      return 0;

    return dif*this.tontine.tauxTontine;

  }
  nbNonPaid(idCot:number,rang:number){
    let cot :Cotisation= this.dataSource[rang-1];
    for(let ct of this.dataSource){
      if(ct.id==idCot)
        cot=ct;
    }
    // console.log(rang);
    for(let echec of this.nbNonPaidEchec ){

      if(echec[0]==idCot){
        // console.log("echec",idCot,echec[1],echec[1]*cot.tauxEchec);
        return echec[1]*cot.tauxEchec;

      }
    }
    // console.log(0);
    return 0;

  }

  nbRetard(idCot:number,rang:number){
    let cot =this.dataSource[rang-1];
    for(let retar of this.nbRetards ){

      if(retar[0]==idCot){
        if(this.type=="Vente")
          return retar[1]*cot.tauxEchec;
        if(this.type=="Simple"){

          return retar[1]*this.tontine.tauxRetard;

        }
      }
    }
    return 0;
  }


  getClass(elm:Cotisation){
    if(elm.gratuit)
      return "gratuit";
    return "nonGratuit";
  }

  openOrClose() {
    this.tontine.actif= (!this.tontine.actif);
    this.tontineService.saveTontine(this.tontine).subscribe(
      data =>{
        console.log(data);
      }
    )
  }


  public openPDF(): void {

    var part=[];
    let i =0;
    const options = {
      startY: 20, // Vertical position to start the table (in mm)
      startX:20,
    };
    const doc = new jsPDF();
      doc.text("Bilan de la Tontine : "+String(this.tontine?.nom).slice(16), 10, 7);

    autoTable(doc,{html:'#htmlData',startY:21});


    doc.save('Tontine '+this.tontine?.nom+'.pdf');
  }

  selectCot(element:Cotisation) {
    this.dataService.actualCotisation=element;
  }
}
