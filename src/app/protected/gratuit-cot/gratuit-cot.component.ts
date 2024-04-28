import {Component, OnInit} from '@angular/core';
import {Participation} from "../../../Models/Entitys/Participation";
import {Beneficiaire} from "../../../Models/Entitys/Beneficiaire";
import {Tontine} from "../../../Models/Abstracts/Tontine";
import {Cotisation} from "../../../Models/Entitys/Cotisation";
import {Enregistrement} from "../../../Models/Entitys/Enregistrement";
import {TontineServiceService} from "../../Services/tontine-service.service";
import {ActivatedRoute} from "@angular/router";
import {MatDialog} from "@angular/material/dialog";
import {FormBuilder, FormControl} from "@angular/forms";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import {switchMap} from "rxjs";

@Component({
  selector: 'app-gratuit-cot',
  templateUrl: './gratuit-cot.component.html',
  styleUrls: ['./gratuit-cot.component.scss']
})
export class GratuitCotComponent implements OnInit{

  displayedColumns: string[] = ['position', 'name', 'weight', 'symbol', 'echec'];
  dataSource:Participation[]=[];
  benefs:Map<number,Beneficiaire> = new Map<number, Beneficiaire>();
  echecs:number[][]= [];
  idCot!:number;
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


  benefForm=this.formBuilder.group({
    benef:Enregistrement,
    aval:Enregistrement,
    TV:0
  });

  compleForm=this.formBuilder.group({
    compl:0,
    supl: new FormControl(this.supl)
  });

  constructor(private tontineService:TontineServiceService,
              private route:ActivatedRoute,
              private dialogBox:MatDialog,
              private formBuilder:FormBuilder) {

  }

  ngOnInit() {

    this.idTontine=this.route.snapshot.params["id"];
    this.tontineService.getLastCot(this.idTontine).subscribe(
      data=>{
        console.log(data);
        this.last=data;

        if(data.createdAt){
          let creatat= new Date(data.createdAt).getTime();
          let actualDate = new Date().getTime();
          console.log(actualDate-creatat);
            console.log("###### new Cot #####")
            this.cotisation = new Cotisation(null,data.nom,data.rang+1,0,data.tauxEchec,0,0,data.tauxTontine,
              1,data.tontine,null,new Date(),new Date(),0);
          if (this.last.gratuit && this.last.statut<2)
              this.cotisation=this.last;
            if(data.id)
              this.idCot=data.id;
          this.cotStatu=this.cotisation.statut;
        }

        this.tontineService.getActualParticipation(this.idTontine,this.cotisation).pipe(

            switchMap(data =>{

              console.log("data :",data);
              this.dataSource = data.slice();

              let parts :Participation[]=[];

              for (let part of this.dataSource){

                part.echec=false;
                part.tontine=true;
                part.retard=false;

                parts.push(part);

              }
              this.dataSource=parts;
              this.tontine=data[0].enregistrement.tontine;

              return this.tontineService.getParticipation(Number(this.cotisation?.id))
            })

        ).subscribe(
          data=>{


            for(let part of data ){
              for (let i=0;i<this.dataSource.length;i++){
                if(this.dataSource[i].enregistrement.id == part.enregistrement.id){
                    this.dataSource[i].tontine=part.tontine;
                    this.dataSource[i].echec=part.echec;
                    this.dataSource[i].retard=part.retard;
                }
              }
            }

            this.cot=this.cotisation;
            this.benefForm.controls.TV.setValue(Number(this.tontine?.tauxTontine));
            if(this.cot){
              if(this.cot.beneficiaire?.id!=null){
                this.hadBen=true;
              }
              if (this.cot.supplement>0)
                this.compleForm.controls.compl.disable({onlySelf:true,emitEvent:true});
            }

            if (this.cotisation)
              if(this.cotisation.rang!=1){

                this.tontineService.checkEchecsCot(this.idTontine,this.idCot).subscribe(
                  data =>{

                    let isadd=false;
                    for(let elm of this.dataSource){
                      isadd=false;
                      for (let echec of data){
                        if(echec[0]==elm.enregistrement.id){
                          let ech =echec;
                          ech[1]=echec[1]++;
                          this.echecs.push(ech);
                          isadd=true;
                        }
                      }
                      if(!isadd){
                        this.echecs.push([0,1]);
                      }
                    }

                    this.tontineService.AllLastbenef(this.idTontine).subscribe(
                      data=>{
                        console.log("last benef:",data);
                        for (let ben of data){
                          if(ben.enregistrement)
                            this.benefs.set(ben.enregistrement.id,ben);
                        }

                        for (let part of this.dataSource){
                          this.membres.push(part.enregistrement);
                          this.nonBenef.push(part.enregistrement);
                        }
                      });

                  });


              }else {
                for (let echec of data){
                  this.echecs.push([0,1]);
                }

                for (let part of this.dataSource){
                  this.membres.push(part.enregistrement);
                  this.nonBenef.push(part.enregistrement);
                }

              }

          }
        );


      });

  }


  getclass(id:number):string{

    if(this.benefs.has(id))
      return "ben";
    return "nonBen";
  }

  getNbEchec(){
    let total=0;
    for (let data of this.dataSource){
      if(data.echec){
        total++;
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
      if(total>this.tontine.nbSeances){
        this.supl=(total-this.tontine.nbSeances)*this.tontine?.tauxTontine;
        this.benefMontant=this.tontine.nbSeances*this.tontine?.tauxTontine;
      }
      else {
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

    let ben = new Beneficiaire(null,this.getTotal(),this.getTotal(),
      0,0,this.beneficier,this.avlise,
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
            this.cotisation=data;

            let parts :Participation[]=[];

            for (let part of this.dataSource){

              part.echec=false;
              part.tontine=true;
              part.retard=false;
              part.cotisation=data;

              parts.push(part);

            }

            this.tontineService.saveParticipationList(parts).subscribe(
              datas=>{
              console.log("parts",datas);
            });
          }

        );
      }
    if(this.tontine && this.cotisation){
      let tauxE=500;
      if(Math.round(this.tv/this.dataSource.length)>500){
        tauxE = Math.round(this.tv/this.dataSource.length);
      }
      this.cotisation.tauxEchec= tauxE;

    }


  }

  AddComplement(){
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

      this.tontineService.saveCotisation(this.cotisation).subscribe(
        data=>{
          this.cotisation=data;
          console.log(data);
          // for (let i=0 ;i<this.dataSource.length;i++){
          //   if (this.echecs[i][1]>=1){
          //     ec = this.dataSource[i];
          //     ec.cotisation=this.cotisation;
          //     if(ec.echec)
          //       echecs.push(ec);
          //   }
          // }
          // this.tontineService.saveParticipationList(echecs).subscribe(
          //   data=>{
          //     console.log("saveParticipationList",data);
          //     for(let i=0 ;i<this.dataSource.length;i++){
          //       for(let j=0 ;j<data.length;j++){
          //         if(data[j].enregistrement.id==this.dataSource[i].enregistrement.id){
          //           this.dataSource[i]=data[j];
          //         }
          //       }
          //     }
          //     console.log("dataSource",this.dataSource);
          //   });
        }
      );

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
      doc.text("Tontine : "+String(this.tontine?.nom).slice(16)+"       Le : "+this.cot.createdAt.toString()+"     Tour gratuit", 10, 7);
    if(this.tontine?.type.id==1)
      doc.text("Total de cotisation : "+this.getTotal()+"/"+this.getMax()+" Fcfa    taux de vente:"+this.cot?.tauxVente+" Fcfa", 10, 21);
    else
      doc.text("Total de cotisation : "+this.getTotal()+"/"+this.getMax()+" Fcfa", 10, 21);

    doc.text("Beneficier : "+this.cot?.beneficiaire?.enregistrement?.membre.nom+"        Montant : "+this.cot?.beneficiaire?.tauxRemis+" Fcfa", 10,28);
    doc.text("Avalise : "+this.cot?.beneficiaire?.avaliste?.membre.nom+"     Suplement : "+this.cot?.supplement+" Fcfa", 10,35);
    doc.text("Echec : "+this.getNbEchec(), 10,42);

    autoTable(doc,{html:'#htmlData',startY:49});


    doc.save('Cotisation '+this.cot?.nom+'.pdf');
  }

}
