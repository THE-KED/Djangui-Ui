import {ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit} from '@angular/core';
import {Participation} from "../../../Models/Entitys/Participation";
import {TontineServiceService} from "../../Services/tontine-service.service";
import {Tontine} from "../../../Models/Abstracts/Tontine";


@Component({
  selector: 'app-buy-echec',
  templateUrl: './buy-echec.component.html',
  styleUrls: ['./buy-echec.component.scss'],
  changeDetection:ChangeDetectionStrategy.OnPush
})
export class BuyEchecComponent implements OnInit{


  tontine!:Tontine
  hasBen:boolean=false;
constructor(public data:Participation,private tontineServ:TontineServiceService,private cd:ChangeDetectorRef) {
}

ngOnInit() {
  this.tontine = <Tontine>this.data.enregistrement.tontine;
  this.hasBen = this.tontineServ.participentHasben;
}

  buy(){
    this.cd.markForCheck();
}

  getTauxEchec(){
  if(this.tontine.type?.code==1)
    return this.data.cotisation.tauxEchec;

  if(this.tontine.type?.code==2 && this.hasBen)
    return Number(this.tontine.tauxEchecB);

  return this.tontine.tauxEchec;
}
}
