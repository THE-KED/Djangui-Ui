import {ChangeDetectorRef, Component, CUSTOM_ELEMENTS_SCHEMA, OnInit} from '@angular/core';
import {MatCardModule} from "@angular/material/card";
import {MatButtonModule} from "@angular/material/button";
import {MatTableModule} from "@angular/material/table";
import {MatListModule} from "@angular/material/list";
import {MatFormFieldModule} from "@angular/material/form-field";
import {MatInputModule} from "@angular/material/input";
import {MatSelectModule} from "@angular/material/select";
import {MatTabsModule} from "@angular/material/tabs";
import {MatGridListModule} from "@angular/material/grid-list";
import {MembreServiceService} from "../../../Services/membre-service.service";
import {Membre} from "../../../../Models/Entitys/Membre";
import {DatePipe, NgForOf, NgIf} from "@angular/common";
import {MatAutocompleteModule} from "@angular/material/autocomplete";
import {FormBuilder, FormControl, FormsModule, ReactiveFormsModule} from "@angular/forms";
import {ActivatedRoute, RouterModule} from "@angular/router";
import {Epargne} from "../../../../Models/Entitys/Epargne";
import {EpargneService} from "../../../Services/epargne.service";
import {Epargnant} from "../../../../Models/Entitys/Epargnant";
import {Depot} from "../../../../Models/Entitys/Depot";
import {MatRadioModule} from "@angular/material/radio";
import {Tontine} from "../../../../Models/Abstracts/Tontine";
import {TontineServiceService} from "../../../Services/tontine-service.service";
import {Garrantie} from "../../../../Models/Entitys/Garrantie";
import {Pret} from "../../../../Models/Entitys/Pret";
import {TypeEpargne} from "../../../../Models/Entitys/TypeEpargne";
import {AuthService} from "../../../Services/auth.service";
import {countNbDimanche} from "../utils/countNbDimanche";
import {buildTableColums} from "../utils/buildTableColums";
import {getDimancheDates} from "../utils/getDimancheDates";


export interface gage{
  type:number;
  epargnantId:number|null;
  tontineId:number|null;
  autres:string;
}
export interface epar{
  epargnant:Epargnant|null;
  capital:number;
  dette:number;
}



@Component({
  selector: 'app-etat',
  templateUrl: './caisse-etat.component.html',
  styleUrls: ['./caisse-etat.component.scss'],
  standalone: true,

  imports: [
    MatCardModule,
    MatButtonModule,
    MatTableModule,
    MatListModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatTabsModule,
    MatGridListModule,
    NgForOf,
    MatAutocompleteModule,
    FormsModule,
    NgIf,
    ReactiveFormsModule,
    RouterModule,
    DatePipe,
    MatRadioModule,
  ],
  schemas:[CUSTOM_ELEMENTS_SCHEMA]
})
export class CaisseEtatComponent implements OnInit{
  displayedColumns: string[] = ['position', 'name', 'weight', 'symbol'];
  dataSource:Epargnant[] = [];
  associationMembers:Membre[]=[];
  dataS:Membre[]=[];
  epargne!:Epargne;
  table:Depot[][]=[]
  capitales:number[]=[];
  nbrowSpan=0;
  emprunteur!:Epargnant;
  emprunteurId!:number;
  montantPret:number=0;
  delais:number=0;
  tontinesGageble:Tontine[]=[];
  perts:Pret[]=[];
  epargnes:number[][]=[];
  dimanchesDates:Date[]=[];


  garranties:gage[]=[
    {type:2,epargnantId:null,tontineId:null,autres:""}
  ];
  capitaux:epar[]=[];
  daysColumns!:string[];
  nbDimanche!:number;


  formDep=this.formBuilder.group({
    membre:new FormControl(),
    montant:new FormControl<number>(0),
    montantPret:new FormControl<number>(0),
    delais:new FormControl<number>(0),
  })
  index:number =0;


  constructor(private memberService :MembreServiceService,
              private epargneServ:EpargneService,
              private formBuilder:FormBuilder,
              private activatedRoute: ActivatedRoute,
              private tontineService:TontineServiceService,
              public authService:AuthService,
              private cdr:ChangeDetectorRef) {
  }

  ngOnInit() {
    var  snapshot = this.activatedRoute.snapshot;
    this.epargne = JSON.parse(snapshot.params["ep"]);
    console.log("ep",this.epargne);
    this.capitaux=[];
    this.nbDimanche = countNbDimanche(new Date(String(this.epargne.dateCreation?.toString())),new Date(String(this.epargne.dateCassation?.toString())));
    this.displayedColumns = buildTableColums(this.nbDimanche);
    this.daysColumns = this.displayedColumns.slice(2,this.displayedColumns.length-2);
    this.dimanchesDates=getDimancheDates(new Date(String(this.epargne.dateCreation?.toString())),this.nbDimanche);
    this.memberService.LoadMembres().subscribe(
      data=>{
        this.associationMembers = data;
        this.dataS=data;
      }
    );
    let prets:Pret[]=[];
    if (this.epargne.id){
      this.epargneServ.getAllDepoByEpargnes(this.epargne.id).subscribe(
        data=>{

          this.epargneServ.getAllEmpruntByEpargnes(Number(this.epargne.id)).subscribe(
            dataP=>{
              prets=dataP;
              this.perts=dataP;
              let isAdd=false;
              let tabLength=0,tabJLength=0;

// Construction d'un tableau a deux dimention groupant les depot chaque dimanche d'un meme epargnant sur une meme ligne
              for (let i=0;i<data.length;i++){
                for (let j=0;j<this.table.length;j++){
                  tabJLength=this.table[j].length;
                  for (let k=0;k<tabJLength;k++){
                    if(data[i].epargnant && data[i].epargnant?.id == this.table[j][k].epargnant?.id){
                      if(!this.table[j])
                        this.table[j]=[];
                      this.table[j].push(data[i]);
                      isAdd=true;
                    }
                  }
                }
                if(!isAdd){
                  this.table.push([data[i]]);
                }
                isAdd=false;
              }

              for (let deps of this.table){
                let depsByDimanche:number[]=[];
                console.log("DEPS",deps);
                let i=0, j=0, k=0, montant=0;
                for (let dimanche of this.dimanchesDates){
                  if(k<deps.length){
                    if((dimanche.getTime()-Number(new Date(String(deps[k].dateDepot?.toString())).getTime()))<604800000
                    && (dimanche.getTime()-Number(new Date(String(deps[k].dateDepot?.toString())).getTime()))>=0){
                      while (k<deps.length
                          && (dimanche.getTime()-Number(new Date(String(deps[k].dateDepot?.toString())).getTime()))<604800000
                          && (dimanche.getTime()-Number(new Date(String(deps[k].dateDepot?.toString())).getTime()))>=0){
                        montant+=Number(deps[k].montant);
                        console.log(dimanche.getTime(),Number(new Date(String(deps[k].dateDepot?.toString())).getTime()),(dimanche.getTime()-Number(new Date(String(deps[k].dateDepot?.toString())).getTime())),604800000);
                        k++;
                        console.log("Montant",montant);
                      }
                      depsByDimanche.push(montant);
                      montant=0;
                    }else{
                      depsByDimanche.push(0);
                    }
                  }
                  else{
                    depsByDimanche.push(0);
                  }
                  i++;
                }
                j++;
                this.epargnes.push(depsByDimanche);
              }

              console.log("$$$$$$$$$$$$$$$$$$$$$",this.epargnes);

              let montant=0;
              let k=0,n=1,m=0;
              // for(let i=0 ;i<200;i++)
              for (let tab of this.table){
                k++;
                this.dataSource.push(<Epargnant>tab[0].epargnant);
                for (let dep of tab){
                  montant+=Number(dep.montant);
                }
                this.capitales.push(montant);
                this.capitaux.push({epargnant:<Epargnant>tab[0].epargnant,capital:montant,dette:0})
                montant=0;
                if (k==10){
                  k=0;
                  n++;
                  n%5==0?m++:m+=0;
                }
              }

              for(let prt of prets){
                for (let i=0;i<this.capitaux.length;i++){
                  if(prt.epargnant?.id==this.capitaux[i].epargnant?.id){
                    console.log("ep",prt);
                    this.capitaux[i].dette+=(Number(prt.montant)*this.epargne.tauxInteretPret/100)+Number(prt.montant);
                  }
                }
              }


              console.log("dataSource:",this.dataSource);


              console.log("tab:",this.table);
              console.log("cap:",this.capitaux);



              this.nbrowSpan = this.dataSource.length+(7*n)-(7*m);


              this.cdr.markForCheck();
            }
          );

          this.cdr.markForCheck();
        }
      );


    }


  }


  isHavePret(id:number,d:Date){
    for (let prt of this.perts){
      if(prt.epargnant?.id==id && (new Date(String(prt.datePret?.toString())).getTime())- d.getTime() < 0
          && (new Date(String(prt.datePret?.toString())).getTime())- d.getTime() > -604800000){
        console.log("###########",prt.datePret)
        return Number(prt.montant);
      }
    }
    return 0;
  }

  colorDept(montant:number){
    if(montant>0)
      return "green";
    return "none"
  }

  colorpret(montant:number){
    if(montant>0)
      return "orange";
    return "none"
  }

  deposit(){

    if(this.index==1){
      let epargnant = new Epargnant();
      let depo = new Depot();
      let Membre:string
      epargnant.dateEnregistrement=new Date();
      epargnant.epargne=this.epargne;
      Membre=String(this.formDep.value.membre);

      console.log("membre",Membre);
      for (let membre of this.dataS){
        if(membre.nom==Membre)
          epargnant.membre=membre;
      }
      for(let ep of this.dataSource){
        if(Membre==ep.membre?.nom){
          epargnant=ep;
        }
      }

      depo.epargnant=epargnant;
      depo.montant=Number(this.formDep.value.montant);
      depo.dateDepot=new Date();

      console.log("depot",depo);

      this.epargneServ.Deposit(depo).subscribe(
        data=>{
          console.log("save",data);

          this.dataSource = [];
          this.associationMembers=[];
          this.dataS=[];
          this.table=[]
          this.capitales=[];
          this.nbrowSpan=0;

          this.ngOnInit();
        }
      )

    }
    // save emprunt
    else{
      let garrantie:Garrantie = new Garrantie();
      let tontines:Tontine[]=[];
      console.log("gage", this.garranties);
      this.tontineService.LoadTontine().subscribe(data=>{
        tontines = data;

        for(let gage of this.garranties){
          if(gage.epargnantId)
             garrantie.epargnants.push(this.emprunteur);
          if(gage.tontineId)
            for (let ton of tontines)
              if(ton.id==gage.tontineId)
                garrantie.tontines.push(ton);
          if(gage.autres!="")
            garrantie.autres+="/new/"+gage.autres;
        }
        let emprunt:Pret = new Pret();

        emprunt.garrantie=garrantie;
        emprunt.montant=Number(this.formDep.value.montantPret);
        let type =<TypeEpargne>this.epargne.type;
        emprunt.echeanche=type.code==2?Number(this.formDep.value.delais):Number(this.epargne.delaisRemboursement);
        emprunt.datePret=new Date();
        emprunt.motif="";
        emprunt.epargnant=this.emprunteur;


        this.epargneServ.Emprunt(emprunt).subscribe(data=>{
          console.log("emprunt",data);

          this.ngOnInit();

        });

      });


    }

  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    console.log(filterValue.trim().toLowerCase());
    this.dataS=this.associationMembers;
    this.dataS = this.dataS.filter((obj)=>{

      if(filterValue.trim().toLowerCase().length==0)
        return obj.nom.length!=0;
      return obj.nom.toLowerCase().includes(filterValue.trim().toLowerCase());
    })
  }


  getCaisseMontant(){
    let total=0;
    for(let montant of this.capitales){
      total+=montant;
    }
    return total-this.getPretMontant();
  }
  getPretMontant(){
    let total=0;
    for(let montant of this.capitaux){
      total+=montant.dette;
    }
    return total;
  }

  addGage(){
    this.garranties.push({type:2,epargnantId:null,tontineId:null,autres:""});
  }


  btnIsDiable(){
    if(this.index==0){
      let i=0,j=0;
      for (i=0;i<this.capitaux.length;i++){
        if(<Epargnant>this.capitaux[i].epargnant==this.emprunteur)
          j=i;
      }
      if(this.emprunteur && Number(this.formDep.value.montantPret)<=(this.epargne.coefPret*this.capitaux[j].capital) && Number(this.formDep.value.montantPret)<=this.getCaisseMontant()){
        if(this.garranties[0].tontineId||this.garranties[0].epargnantId||this.garranties[0].autres!="")
          return true;
      }
      return false;
    }else {
      if (this.formDep.value.membre && this.formDep.value.montant && this.formDep.value.montant>0)
        return true;

      return false;
    }
  }


  checkTontine(){
    this.garranties=[
      {type:2,epargnantId:null,tontineId:null,autres:""}
    ];
    if(this.emprunteurId){
      for (let ep of this.dataSource){
        if(this.emprunteurId==ep.id)
          this.emprunteur=ep;
      }
      console.log(this.emprunteur);
      if(this.emprunteur.membre)
      this.tontineService.MyTontine(this.emprunteur.membre.id).subscribe(data=>{
        this.tontinesGageble=data;
      });
    }
  }
}
