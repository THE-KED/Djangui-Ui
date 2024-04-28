import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  DestroyRef,
  DoCheck,
  inject,
  OnInit
} from '@angular/core';
import {Participation} from "../../../Models/Entitys/Participation";
import {Beneficiaire} from "../../../Models/Entitys/Beneficiaire";
import {Tontine} from "../../../Models/Abstracts/Tontine";
import {Cotisation} from "../../../Models/Entitys/Cotisation";
import {TontineServiceService} from "../../Services/tontine-service.service";
import {ActivatedRoute} from "@angular/router";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import {DataService} from "../../Services/data.service";
import {forkJoin, tap} from "rxjs";
import {takeUntilDestroyed} from "@angular/core/rxjs-interop";

@Component({
  selector: 'app-cotisation-detail',
  templateUrl: './cotisation-detail.component.html',
  styleUrls: ['./cotisation-detail.component.scss'],
  changeDetection:ChangeDetectionStrategy.OnPush,
})
export class CotisationDetailComponent implements OnInit,DoCheck{


  displayedColumns: string[] = ['position', 'name', 'weight', 'symbol', 'echec'];
  dataSource:Participation[]=[];
  hasBen:string[]=[];
  benefs:Map<number,Beneficiaire> = new Map<number, Beneficiaire>();
  idCot!:number;
  idTontine!:number;
  tontine:Tontine|undefined;
  cot!:Cotisation;
  isEnd:string="No";
  tauxTontine=0;
  tauxEchec=0;
  tauxRetard=0;
  total:number=0;
  totalExpet:number=0;
  totalEchec:number=0;
  totalRetard:number=0;
  nbE=0;
  nbR=0;
  type: boolean = false;
  destroyRef = inject(DestroyRef);


  constructor(private tontineService:TontineServiceService,
              private route:ActivatedRoute,private dataService:DataService,
              private cd:ChangeDetectorRef) {

  }
  ngOnInit() {

    this.idCot=this.route.snapshot.params["id"];
    this.idTontine=this.route.snapshot.params["idTon"];
    this.tontine=this.dataService.actualTontine;
    this.cot=this.dataService.actualCotisation;

    let participationCall=this.tontineService.getParticipation(this.idCot);
    let beneficiaireCall=this.tontineService.getAllLastbenef(this.idCot);

    forkJoin([participationCall,beneficiaireCall]).pipe(
        takeUntilDestroyed(this.destroyRef),
        tap(data =>{
              this.dataSource=data[0];
              for (let ben of data[1]){
                if(ben.enregistrement)
                  this.benefs.set(ben.enregistrement.id,ben);
              }
              this.loadHasBen();
            })
    ).subscribe(result=>this.cd.markForCheck());

  }

  ngDoCheck() {
        this.tontine?.actif? this.isEnd="No":this.isEnd="finish";
        this.tauxTontine=Number(this.tontine?.tauxTontine);
        this.tauxEchec=Number(this.tontine?.tauxEchec);
        this.tauxRetard=Number(this.tontine?.tauxRetard);


    this.setTotal();
    this.setType();
  }

  loadHasBen(){
    this.hasBen=[];
      for(let part of this.dataSource){
        if(this.benefs.has(part.enregistrement.id))
          this.hasBen.push("ben");
        else
          this.hasBen.push("nonBen");
      }
  }

  setTotal(){

    this.total=0;
    this.totalEchec=0;
    this.totalRetard=0;
    this.totalExpet=0;
    this.nbE=0;
    this.nbR=0;

    for(let data of this.dataSource ){
      if (data.tontine){
        this.total+=this.tauxTontine;
        if(data.retard){
          this.totalRetard+=(this.cot.tauxEchec+this.cot.tauxTontine);
          this.nbR++;
        }
      }
      else {
        this.totalEchec+=(this.cot.tauxEchec+this.cot.tauxTontine);
        this.nbE++;
      }
      this.totalExpet+=this.tauxTontine;
    }
  }

  setType(){
    if (this.tontine?.type.code==1)
      this.type= true;
    else
      this.type=false;
  }


  public openPDF(): void {

    var part=[];
    let i =0;
    for(let element of this.dataSource){
      i++;
      var tempObj = {"N.": String(i),
        "Nom":element.enregistrement.membre.nom,
        "Tontine":element.tontine?"OUI":"NON",
        "Retard":element.retard?"OUI":"NON",
        "Echec":element.echec?"OUI":"NON",
      };

      part.push(tempObj);
    }
    const options = {
      startY: 20, // Vertical position to start the table (in mm)
      startX:20,
    };
    const doc = new jsPDF();
    if (this.cot.createdAt)
      doc.text("Tontine : "+String(this.tontine?.nom).slice(16)+"       Le : "+this.cot.createdAt.toString(), 10, 7);
    if(this.tontine?.type.id==1)
      doc.text("Total de cotisation : "+this.total+"/"+this.totalExpet+" Fcfa    taux de vente:"+this.cot.tauxVente+" Fcfa", 10, 21);
    else
      doc.text("Total de cotisation : "+this.total+"/"+this.totalExpet+" Fcfa", 10, 21);

    doc.text("Beneficier : "+this.cot.beneficiaire?.enregistrement?.membre.nom+"        Montant : "+this.cot.beneficiaire?.tauxRemis+" Fcfa", 10,28);
    doc.text("Avalise : "+this.cot.beneficiaire?.avaliste?.membre.nom+"     Suplement : "+this.cot.supplement+" Fcfa", 10,35);
    doc.text("Echec : "+this.nbE+"   ("+this.totalEchec+" Fcfa)     "+"Retard : "+this.nbR+"   ("+this.totalRetard +" Fcfa)     ", 10,42);

    autoTable(doc,{html:'#htmlData',startY:49});


    doc.save('Cotisation '+this.cot.nom+'.pdf');
  }

}

