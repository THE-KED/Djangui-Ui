import {ChangeDetectionStrategy, Component, DestroyRef, inject, OnInit} from '@angular/core';
import {TontineServiceService} from "../../Services/tontine-service.service";
import {Participation} from "../../../Models/Entitys/Participation";
import {AuthService} from "../../Services/auth.service";
import {Beneficiaire} from "../../../Models/Entitys/Beneficiaire";
import {Tontine} from "../../../Models/Abstracts/Tontine";
import {takeUntilDestroyed} from "@angular/core/rxjs-interop";
import {forkJoin, tap} from "rxjs";

@Component({
  selector: 'app-etat',
  templateUrl: './etat.component.html',
  styleUrls: ['./etat.component.scss'],
})
export class EtatComponent implements OnInit{

  displayedColumns: string[] = ['No', 'Tontine', 'Seance' ,"Etat","Montant"];
  dataSource:Participation[]=[];
  echecs:Participation[]=[];
  retards:Participation[]=[];
  montants:number[]=[];
  ben:Beneficiaire[]=[];
  tontines:Tontine[]=[];
  tontid:number[]=[];
  id:number=0;
  destroyRef = inject(DestroyRef);

  constructor(private tontineService:TontineServiceService,private authService:AuthService) {
  }
  ngOnInit() {
    this.id=Number(this.authService.appUser?.membre.id);
    console.log("id",this.id);
    let myEchecsCall =this.tontineService.getMyEchecs(this.id);
    let myRetardsCall =this.tontineService.getMyRetards(this.id);
    let benCall=this.tontineService.getben(this.id);

    forkJoin([myEchecsCall,myRetardsCall,benCall]).pipe(
        takeUntilDestroyed(this.destroyRef),
        tap(
            data =>{
                //chargements de mes echecs
                this.echecs=data[0];
                for(let echec of data[0]){
                    this.dataSource.push(echec);
                }
                //chargements de mes retards
                this.retards=data[1];
                for(let retard of data[1]){
                    this.dataSource.push(retard);
                }
                //chargements des beneficiers
                this.ben=data[2];
                for (let benef of data[2]){
                    if(benef.enregistrement?.tontine){
                        this.tontines.push(benef.enregistrement.tontine);
                        this.tontid.push(benef.enregistrement.tontine.id);
                    }
                }
            }
        )

    ).subscribe(
      data=>{
          console.log("Echecs",data[0]);
          console.log("Retard",data[1]);
          console.log("ben" ,data[2]);
      }
    );
  }

  checkMontant(part:Participation) {
    let ton = part.enregistrement.tontine
    if (ton)
      return ton.tauxTontine + part.cotisation.tauxEchec;
    return 0;
  }

  getClass(part:Participation){
    if(part.echec)
      return "echec";
    if (part.retard)
      return "retard";

    return "echecP"
  };
}
