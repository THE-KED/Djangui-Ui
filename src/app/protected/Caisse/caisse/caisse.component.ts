import {Component, Input, OnInit} from '@angular/core';
import {Epargne} from "../../../../Models/Entitys/Epargne";
import {Router} from "@angular/router";

@Component({
  selector: 'app-caisse',
  templateUrl: './caisse.component.html',
  styleUrls: ['./caisse.component.scss']
})
export class CaisseComponent implements OnInit{

  @Input("epargne")
  epargne!:Epargne;

  passdata: string="";
  nextRoutes="../etat";

  constructor(private roteur:Router) {
  }

  ngOnInit() {

    if(this.roteur.url.includes("buy")){
      this.nextRoutes="op";
    }
    this.passdata=JSON.stringify(this.epargne);
  }
}
