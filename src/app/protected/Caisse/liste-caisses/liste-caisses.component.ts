import {ChangeDetectorRef, Component, OnInit} from '@angular/core';
import {Epargne} from "../../../../Models/Entitys/Epargne";
import {EpargneService} from "../../../Services/epargne.service";

@Component({
  selector: 'app-liste-caisses',
  templateUrl: './liste-caisses.component.html',
  styleUrls: ['./liste-caisses.component.scss']
})
export class ListeCaissesComponent implements OnInit{

  dataSources:Epargne[][]=[];
  constructor(private eparngeServe:EpargneService,private cdr:ChangeDetectorRef) {
  }

  ngOnInit() {
    this.eparngeServe.getAllEpargnes().subscribe(data=>{
      console.log(data);
      for (let i=0;i<data.length;i++){
        this.dataSources[i]=[];
      }
      for (let ep of data){
        if(ep.type && ep.type.code==2)
          this.dataSources[0].push(ep);
        else
          this.dataSources[1].push(ep);
      }

      this.cdr.markForCheck();
    })
  }


}
