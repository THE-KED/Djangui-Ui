import {ChangeDetectionStrategy, Component, Input, OnInit} from '@angular/core';
import {Tontine} from "../../../../Models/Abstracts/Tontine";
import {Router} from "@angular/router";
import {DataService} from "../../../Services/data.service";

@Component({
  selector: 'app-tontine',
  templateUrl: './tontine.component.html',
  styleUrls: ['./tontine.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TontineComponent implements OnInit{

  @Input("tontine")
  tontine!:Tontine;

  name="Tontine vente";
  classeName="Btn"
  nextRoute="./seances"

  constructor(private route:Router,private dataService:DataService) {

  }

  ngOnInit() {

    if (this.tontine.actif)
      this.classeName="encour";

    if(this.route.url=="/public/start")
      this.nextRoute="./check"
  }

  SelectTontine() {
    this.dataService.actualTontine=this.tontine;
  }

}
