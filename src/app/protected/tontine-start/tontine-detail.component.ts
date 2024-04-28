import {ChangeDetectionStrategy, ChangeDetectorRef, Component, DestroyRef, inject, OnInit} from '@angular/core';
import {MatDialog} from "@angular/material/dialog";
import {CotisationDBComponent} from "../../dialogbox/cotisation-db/cotisation-db.component";
import {TontineServiceService} from "../../Services/tontine-service.service";
import {ActivatedRoute} from "@angular/router";
import {Participation} from "../../../Models/Entitys/Participation";
import {Beneficiaire} from "../../../Models/Entitys/Beneficiaire";
import {Tontine} from "../../../Models/Abstracts/Tontine";
import {Cotisation} from "../../../Models/Entitys/Cotisation";
import {Enregistrement} from "../../../Models/Entitys/Enregistrement";
import {FormBuilder, FormControl, Validators} from "@angular/forms";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import {takeUntilDestroyed} from "@angular/core/rxjs-interop";
import {switchMap, tap} from "rxjs";
import {DataService} from "../../Services/data.service";


@Component({
  selector: 'app-tontine-start',
  templateUrl: './tontine-detail.component.html',
  styleUrls: ['./tontine-detail.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TontineDetailComponent implements OnInit{

  destroyRef = inject(DestroyRef);
  displayedColumns: string[] = ['position', 'name', 'weight', 'symbol', 'echec'];
  dataSource:Participation[]=[];
  benefs:Map<number,Beneficiaire> = new Map<number, Beneficiaire>();
  echecs:number[][]= [];
  // idCot!:number;
  idTontine!:number;
  tontine:Tontine | null = null;
  cot:Cotisation|undefined;
  last:Cotisation|undefined;
  cotisation:Cotisation|undefined;
  beneficier: Enregistrement|undefined;
  avlise: Enregistrement|undefined;
  membres: Enregistrement[]=[];
  nonBenef: Enregistrement[]=[];
  complement: number = 0;
  hadBen:boolean=false;
  cotStatu:number=0;
  tv:number=0;
  supl=0;
  benefMontant=0;
  totalEchecs:number = 0;
  taux!:number;
  rang:number|null = null;
  canHaveCompl=true;

  benefForm=this.formBuilder.group({
    benef:Enregistrement,
    aval:Enregistrement,
    TV:new FormControl(Number(this.taux))
  });

  compleForm=this.formBuilder.group({
    compl: new FormControl({value:0,disabled:!this.canHaveCompl}),
    supl: new FormControl(this.supl)
  });

  constructor(private tontineService:TontineServiceService,
              private route:ActivatedRoute,
              private dialogBox:MatDialog,
              private formBuilder:FormBuilder,
              private cd:ChangeDetectorRef,
              private dataService:DataService){

  }

  ngOnInit() {

    this.idTontine=this.route.snapshot.params["id"];
    this.rang = this.dataService.actualSeanceRang;


    this.tontineService.startCotisation(this.idTontine,0,this.rang).pipe(
        takeUntilDestroyed(this.destroyRef),
        tap( data => {
          this.cotisation = data[0];
          this.dataSource = data[1].slice();

          this.beneficier = this.cotisation.beneficiaire?.enregistrement;
          this.avlise = this.cotisation.beneficiaire?.avaliste;
          this.cotStatu = this.cotisation.statut;

          this.cot = this.cotisation;
          this.tontine = this.dataSource[0].enregistrement.tontine;
          this.benefForm.controls.TV.setValue(Number(this.tontine?.tauxTontine));
          if (this.cot) {
            if (this.cot.supplement>0)
              this.compleForm.controls.compl.disable({onlySelf:true,emitEvent:true});
            if (this.cot.beneficiaire?.id != null) {
              this.hadBen = true;
            }
            if (data[2] && data[3]) {
              let isadd = false;
              for (let elm of this.dataSource) {
                isadd = false;
                for (let echec of data[2]) {
                  if (echec[0] == elm.enregistrement.id) {
                    let ech = [echec[0], echec[1] + 1];
                    this.echecs.push(ech);
                    isadd = true;
                  }
                }
                if (!isadd)
                  this.echecs.push([0, 1]);
              }


              for (let ben of data[3]) {
                if (ben.enregistrement)
                  this.benefs.set(ben.enregistrement.id, ben);
              }

              for (let part of this.dataSource) {
                this.membres.push(part.enregistrement);
                if (!(this.benefs.has(part.enregistrement.id))) {
                  this.nonBenef.push(part.enregistrement);
                }
              }


            }
          }
        })
    ).subscribe(
        data =>{
          console.log("Success :",data);
          this.cd.markForCheck();
        }
    );


  }


  getclass(id:number):string{

    if(this.benefs.has(id))
      return "ben";
    return "nonBen";
  }


  openDialogBox(enterDuration:number,exitDuration:number,part:Participation){
    console.log(part);
    if(this.cotisation && this.tontine){
      part.cotisation=this.cotisation;
      part.cotisation.tontine=this.tontine;

    }
    this.dialogBox.open(CotisationDBComponent,{
      width:'400px',
      enterAnimationDuration:enterDuration,
      exitAnimationDuration:exitDuration,
      data:part,
    }).afterClosed().subscribe(
      data =>{
        if (data && data.data) {
          console.log("close",data.data);
          this.cotisation=data.data.cotisation;
          this.tontineService.getActualParticipation(this.idTontine,this.cotisation).subscribe(data=>{
            console.log("getActualParticipation",data);
          });
        }
        this.cd.markForCheck();
      }
    );

  }
  getNbEchec(){
    let total=0;
    this.totalEchecs=0;
    for (let data of this.dataSource){
      if(data.echec){
        total++;

        if(this.tontine && this.cotisation){
          if(this.tontine.type.code==2){
            if (this.getclass(data.enregistrement.id)=="ben"){
              this.totalEchecs+=Number(this.tontine.tauxEchecB)+ this.tontine.tauxTontine;
            }else {
              this.totalEchecs+=Number(this.tontine.tauxEchec)+ this.tontine.tauxTontine;
            }
          }else if(this.tontine.type.code==1){
            this.totalEchecs+=Number(this.cotisation.tauxEchec+this.cotisation.tauxTontine);

          }
        }
      }
    }
    return total;
  }
  getTotal(){
    let total=0;
    for (let data of this.dataSource){
      if(data.tontine){
        total++;
      }
    }
    if(this.tontine){
      if(this.tontine.type.code==1){
        if(total>this.tontine.nbSeances){
          this.supl=(total-this.tontine.nbSeances)*this.tontine?.tauxTontine;
          this.benefMontant=this.tontine.nbSeances*this.tontine?.tauxTontine;
        }
        else {
          this.supl=0;
          this.benefMontant=total*this.tontine?.tauxTontine;
        }
      }else {
        this.supl=0;
        this.benefMontant=total*this.tontine?.tauxTontine;
      }

      this.compleForm.value.supl=this.supl;


      return total*this.tontine?.tauxTontine;

    }

    return total;
  }
  getMax(){
    if(this.tontine)
    return this.dataSource.length*(this.tontine?.tauxTontine);

    return 0;
  }

  valide(){
    if(this.cotisation){
      this.cotisation.statut=1;
      this.cotStatu=1;
      this.cotisation.supplement=this.supl;
      if (this.supl>0)
        this.compleForm.controls.compl.disable({onlySelf:true,emitEvent:true});
    }
    console.log(this.cotisation);

    // @ts-ignore
    this.beneficier=this.benefForm.value.benef;
    // @ts-ignore
    this.avlise=this.benefForm.value.aval;
    // @ts-ignore
    this.tv=Number(this.benefForm.value.TV);

    let ben = new Beneficiaire(null,this.benefMontant,this.benefMontant,
      this.benefMontant,0,this.beneficier,this.avlise,
      new Date(),new Date());


    if(this.tontine)
    if(this.cotisation){
      this.cotisation.beneficiaire=ben;
      this.cotisation.statut=1;
      this.cotisation.tontine=this.tontine;
      this.cotisation.tauxVente=this.tv;
      console.log(this.cotisation);
      // console.log(JSON.stringify(this.cotisation));
      this.tontineService.saveCotisation(this.cotisation).subscribe(
        data=>{
          console.log("save",data);
        }

      );
    }
    if(this.tontine && this.cotisation)
    if(this.tontine.type.nom=="Vente"){
      let tauxE=500;
      if(Math.round(this.tv/this.dataSource.length)>500){
        tauxE = Math.round(this.tv/this.dataSource.length);
      }
      this.cotisation.tauxEchec= tauxE;

    }


  }

  AddComplement(){
    console.log("####################addComplements###################");
    if(this.cotisation){
      this.cotisation.statut=2;
      this.cotStatu=2;
      this.cotisation.supplement=this.supl;
    }
    console.log(this.cotisation);
    // @ts-ignore
    this.complement=this.compleForm.value.compl;

    if(this.cotisation && this.tontine){
      this.cotisation.complement=this.complement;
      this.cotisation.tontine=this.tontine;
      let echecs:Participation[]=[];
      let ec:Participation;
      let ben = this.cotisation.beneficiaire;
      if(ben){
        ben.tauxCotise=this.benefMontant;
        ben.tauxRemis=this.benefMontant;
        ben.tauxDu=this.benefMontant;
        this.cotisation.beneficiaire=ben;
      }

      this.tontineService.saveCotisation(this.cotisation).pipe(
          takeUntilDestroyed(this.destroyRef),
          switchMap(data=>{
              this.cotisation=data;
              console.log(data);
              for (let i=0 ;i<this.dataSource.length;i++) {
                if (this.echecs[i][1] >= 1) {
                  ec = this.dataSource[i];
                  ec.cotisation = this.cotisation;
                  if (ec.echec)
                    echecs.push(ec);
                }
              }
                return this.tontineService.saveParticipationList(echecs);
          })
      ).subscribe(
        data=>{
          console.log("saveParticipationList",data);
          for(let i=0 ;i<this.dataSource.length;i++){
            for(let j=0 ;j<data.length;j++){
              if(data[j].enregistrement.id==this.dataSource[i].enregistrement.id){
                this.dataSource[i]=data[j];
              }
            }
          }
          console.log("dataSource",this.dataSource);
          this.cd.markForCheck();
        }
      );
    }
  }


  close(){
    if(this.nonBenef.length<=1){
      if (this.tontine){
        this.tontine.actif=false;
        this.tontineService.saveTontine(this.tontine).pipe(
            takeUntilDestroyed(this.destroyRef),
            tap( data => {
              console.log("saved Tontine",data);
              if (this.cotisation)
                this.cotisation.tontine=data;
              if (this.cot)
                this.cot.tontine=data;
              this.AddComplement();

            })
        ).subscribe(() =>{
            this.cd.markForCheck()
      });
      }
    }
  }

  public openPDF(): void {

    var part=[];
    let i =0;

    const options = {
      startY: 20, // Vertical position to start the table (in mm)
      startX:20,
    };
    const doc = new jsPDF();
    if (this.cot && this.cot.createdAt)
      doc.text("Tontine : "+String(this.tontine?.nom).slice(16)+"       Le : "+this.cot.createdAt.toString(), 10, 7);
    if(this.tontine?.type.id==1)
      doc.text("Total de cotisation : "+this.getTotal()+"/"+this.getMax()+" Fcfa    taux de vente:"+this.cot?.tauxVente+" Fcfa", 10, 21);
    else
      doc.text("Total de cotisation : "+this.getTotal()+"/"+this.getMax()+" Fcfa", 10, 21);

    doc.text("Beneficier : "+this.cot?.beneficiaire?.enregistrement?.membre.nom+"        Montant : "+this.cot?.beneficiaire?.tauxRemis+" Fcfa", 10,28);
    doc.text("Avalise : "+this.cot?.beneficiaire?.avaliste?.membre.nom+"     Suplement : "+this.cot?.supplement+" Fcfa", 10,35);
    doc.text("Echec : "+this.getNbEchec()+"   ("+this.totalEchecs+" Fcfa)", 10,42);

    autoTable(doc,{html:'#htmlData',startY:49});


    doc.save('Cotisation '+this.cot?.nom+'.pdf');
  }
}
