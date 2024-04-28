import {ChangeDetectorRef, Component} from '@angular/core';
import {FormBuilder, FormControl} from "@angular/forms";
import {Epargne} from "../../../../Models/Entitys/Epargne";
import {MatSnackBar} from "@angular/material/snack-bar";
import {EpargneService} from "../../../Services/epargne.service";
import {TypeEpargne} from "../../../../Models/Entitys/TypeEpargne";
import {Router} from "@angular/router";

@Component({
  selector: 'app-create-caisse',
  templateUrl: './create-caisse.component.html',
  styleUrls: ['./create-caisse.component.scss']
})
export class CreateCaisseComponent {

  Form=this.formBuilder.group({
    intituler:"",
    type:"",
    dateCassation:new FormControl(new Date()),
    coefPret:new FormControl(0),
    tauxInteretPret:new FormControl(0),
    minDep:new FormControl(0),
    basePret:new FormControl(0),
    delaisRemboursement:new FormControl(0),
  });

  type:number|null = null;
  constructor(private formBuilder:FormBuilder,
              private snackBar: MatSnackBar,
              private epargneServ: EpargneService,
              private router:Router,
              private cdr:ChangeDetectorRef) {
  }


  openSnackBar(message: string, action: string) {
    this.snackBar.open(message, action ,{
      duration:3000
    });
  }

  creatEpargne(){
    let epargne:Epargne = new Epargne();

    epargne.nom=String(this.Form.value.intituler);
    epargne.dateCreation=new Date();
    epargne.coefPret=Number(this.Form.value.coefPret);
    epargne.dateCassation = this.Form.value.dateCassation?this.Form.value.dateCassation:null;
    epargne.delaisRemboursement=Number(this.Form.value.delaisRemboursement);
    epargne.minDep=Number(this.Form.value.minDep);
    epargne.tauxInteretPret=Number(this.Form.value.tauxInteretPret);

    let typeEpargne:TypeEpargne = this.type==1?new TypeEpargne(1,"Banque Scolaire",1):new TypeEpargne(2,"Emergence",2);
    epargne.type=typeEpargne;
    console.log("epargne",epargne);

    this.epargneServ.saveEpargne(epargne).subscribe(data=>{
      console.log(data);
      this.openSnackBar("'"+epargne?.nom?.toUpperCase()+"' Cree avec succes !" ,"Continuer");
      this.router.navigateByUrl("/public/Caisse/depot");
    });
  }
}
