import {ChangeDetectionStrategy, ChangeDetectorRef, Component, DestroyRef, inject, OnInit} from '@angular/core';
import {TontineServiceService} from "../../Services/tontine-service.service";
import {Tontine} from "../../../Models/Abstracts/Tontine";
import {TypeTontine} from "../../../Models/Entitys/TypeTontine";
import {Router} from "@angular/router";
import {takeUntilDestroyed} from "@angular/core/rxjs-interop";
import {switchMap} from "rxjs";
import {DataService} from "../../Services/data.service";


@Component({
  selector: 'app-tontine-list',
  templateUrl: './tontine-list.component.html',
  styleUrls: ['./tontine-list.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})

export class TontineListComponent implements OnInit{

  types:TypeTontine[]=[];
  tontines:Tontine[][]=[];
  destroyRef = inject(DestroyRef);

  constructor(private tontineService:TontineServiceService,private route :Router,
              private cd:ChangeDetectorRef,private dataService:DataService) {
  }
  ngOnInit() {
    this.dataService.actualSeanceRang = null;
    this.tontineService.getTypes().pipe(
        takeUntilDestroyed(this.destroyRef),
        switchMap(types => {
            this.types=types
            for (let type of this.types){
                this.tontines.push([]);
            }
            return this.tontineService.LoadTontine()
        }),
    ).subscribe(
      data=>{
        if(this.route.url.includes("/start") || this.route.url.includes("/echec")){
          for(let i=0 ;i<data.length ;i++){
            for(let j=0;j<this.types.length;j++){
              if(data[i].type.id==this.types[j].id){
                if(data[i].actif)
                this.tontines[j].push(data[i]);
              }
            }
          }
        }else {
          for(let i=0 ;i<data.length ;i++){
            for(let j=0;j<this.types.length;j++){
              if(data[i].type.id==this.types[j].id){
                this.tontines[j].push(data[i]);
              }
            }
          }
            for(let i = 0; i < this.types.length; i++) {
                this.tontines[i].sort((a:Tontine , b:Tontine)=>{
                    if(a.actif && !b.actif)
                        return -1;
                    else if(!a.actif && b.actif)
                        return 1;

                    return 0;
                });
            }

        }

        this.cd.markForCheck();
      }
    );
  }

}
