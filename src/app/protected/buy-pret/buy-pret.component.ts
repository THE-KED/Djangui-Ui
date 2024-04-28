import {ChangeDetectorRef, Component, OnInit} from '@angular/core';
import {EpargneService} from "../../Services/epargne.service";
import {Epargne} from "../../../Models/Entitys/Epargne";
import {ActivatedRoute} from "@angular/router";
import {Pret} from "../../../Models/Entitys/Pret";
import {getDetteMontant} from "../../metier/getDetteMontant";
import {MatDialog} from "@angular/material/dialog";
import {BuyPretDialogComponent} from "../../dialogbox/buy-pret-dialog/buy-pret-dialog.component";
import {Versement} from "../../../Models/Entitys/Versement";
import {forkJoin, tap} from "rxjs";

@Component({
  selector: 'app-buy-pret',
  templateUrl: './buy-pret.component.html',
  styleUrls: ['./buy-pret.component.scss']
})
export class BuyPretComponent implements  OnInit {

  displayedColumns: string[] = ['position', 'name', 'montant','pret','datePret','rembourse', 'verser', 'action'];
  dataSource:Pret[]=[];
  epargne!: Epargne;
  dataVerse: Map<number,Versement[]> = new Map<number,Versement[]>();
  dejaVerse: number[] = [];
  restes:number[] = [];



    constructor(private epargneService:EpargneService,
              private activatedRoute:ActivatedRoute,
              private dialogBox:MatDialog,
                private cdr:ChangeDetectorRef
              ) {
  }

  ngOnInit() {

    let snapshot = this.activatedRoute.snapshot;
    let tempVerse : Versement[] = [];
    this.epargne = JSON.parse(snapshot.params["ep"]);
    let pretCall = this.epargneService.getDetteByEpargnes(Number(this.epargne.id));
    let verseCall = this.epargneService.getAllVerseByEpargnes(Number(this.epargne.id));

    forkJoin([pretCall,verseCall]).pipe(
        tap(
        data =>{
            this.dataSource = data[0];
            console.log("########## is done ##########",data[0],data[1]);
            for (let verse of data[1]){
                if(verse.pret?.id){
                    if(this.dataVerse.has(verse.pret?.id)){
                        tempVerse = <Versement[]> this.dataVerse.get(verse.pret.id);
                        tempVerse.push(verse);
                        this.dataVerse.set(verse.pret.id,tempVerse);
                    }
                    else {
                        tempVerse = [];
                        tempVerse.push(verse);
                        this.dataVerse.set(verse.pret.id,tempVerse);
                    }
                }
            }
            console.log("dataverse : ",this.dataVerse);

            let i = 0;
            for (let pret of this.dataSource){
                if(!this.dataVerse.has(Number(pret.id))){
                    this.dejaVerse.push(0);
                    this.restes.push(this.getPretvalue(i));
                }
                else {
                    let somme = 0;
                    // if(this.dataVerse.get(Number(pret.id)))
                    for (let verse of <Versement[]> this.dataVerse.get(Number(pret.id))){
                        somme += Number(verse.montant);
                    }
                    this.dejaVerse.push(somme);
                    this.restes.push(this.getPretvalue(i)-somme);
                }
                i++;
            }

        }
    ),).subscribe(
        ()=>{
            this.cdr.markForCheck();
        }
    );
  }

    checkBuy(element:any) {
        return false;
    }

    getPretvalue(index:number){
        let versements:Versement[] = this.dataVerse.get(Number(this.dataSource[index].id))? <Versement[]> this.dataVerse.get(Number(this.dataSource[index].id)):[];
      return  getDetteMontant(this.dataSource[index],versements);
    }

    isDone(index:number){
        return this.restes[index] <= 0? false:true;
    }

    lastVersementDate(index:number){

        let lastVersementDate;

        for (let verse of <Versement[]> this.dataVerse.get(index)){
            if (verse.dateVersement)
                if(!lastVersementDate){
                    lastVersementDate = new Date(verse.dateVersement.toString());
                }else if (new Date(lastVersementDate.toString()).getTime()<new Date(verse.dateVersement.toString()).getTime()){
                    lastVersementDate = new Date(verse.dateVersement.toString());
                }
        }
        return lastVersementDate;
    }

  openDialogBox(enterDuration:number,exitDuration:number,pret:Pret,index:number){
    console.log(pret);
    this.dialogBox.open(BuyPretDialogComponent,{
      width:'400px',
      enterAnimationDuration:enterDuration,
      exitAnimationDuration:exitDuration,
      data:pret,
    }).afterClosed().subscribe(
        data =>{
          if (data && data.data) {
            console.log("close",data.data);
              let tempVerse : Versement[] = [];
              if(this.dataVerse.has(data.data.pret?.id)){
                  tempVerse = <Versement[]> this.dataVerse.get(data.data.pret?.id);
                  tempVerse.push(data.data);
                  this.dataVerse.set(data.data.pret?.id,tempVerse);
              }
              else {
                  tempVerse = [];
                  tempVerse.push(data.data);
                  this.dataVerse.set(data.data.pret?.id,tempVerse);
              }

              this.dejaVerse[index] += Number(data.data.montant);
              this.restes[index] -= Number(data.data.montant);

          }
            this.cdr.markForCheck();
        }
    );

  }
}
