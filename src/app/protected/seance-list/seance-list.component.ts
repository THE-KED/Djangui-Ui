import {ChangeDetectionStrategy, ChangeDetectorRef, Component, DestroyRef, inject, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from "@angular/router";
import {TontineServiceService} from "../../Services/tontine-service.service";
import {Cotisation} from "../../../Models/Entitys/Cotisation";
import {Tontine} from "../../../Models/Abstracts/Tontine";
import {DataService} from "../../Services/data.service";
import {takeUntilDestroyed} from "@angular/core/rxjs-interop";
import {tap} from "rxjs";

@Component({
  selector: 'app-seance-list',
  templateUrl: './seance-list.component.html',
  styleUrls: ['./seance-list.component.scss'],
  changeDetection:ChangeDetectionStrategy.OnPush
})
export class SeanceListComponent implements OnInit{

  displayedColumns: string[] = ['intitule', 'seance', 'tontine'];
  dataSource : Cotisation[] = [];
  idTontine!:number;
  nextRoute:string ="/public/tontine/affiche/";
  tontine!:Tontine;
  destroyRef = inject(DestroyRef);



  constructor(private router:ActivatedRoute,
              private route:Router,
              private tontineService:TontineServiceService,
              private dataService:DataService,
              private cd:ChangeDetectorRef) {
  }
  ngOnInit() {
    this.tontine=this.dataService.actualTontine;
    if(this.route.url.slice(0,22)=="/public/echec/seances/"){
      this.nextRoute="/public/echec/seances/";
    }
    this.idTontine=this.router.snapshot.params["id"];
    this.router.snapshot.params
        this.tontineService.getCotisation(this.idTontine).pipe(
            takeUntilDestroyed(this.destroyRef),
            tap(
                data =>{
                  this.dataSource = data;
                  this.dataSource.sort((a, b) => {
                    if (a.rang>b.rang)
                      return -1;
                    else if (a.rang<b.rang)
                      return 1;
                    else
                      return 0;
                  });
                }
            )
        ).subscribe(data=>this.cd.markForCheck());

  }

  endCotisation(cot:Cotisation){
    // cot.statut=3;
    // cot.tontine=this.tontine;
    // this.tontineService.saveCotisation(cot).subscribe(
    //   data =>{
    //     console.log("end",data);
    //   }
    // );

    this.dataService.actualSeanceRang = cot.rang;
  }

  selectCotisation(cot:Cotisation){
    this.dataService.actualCotisation = cot;
  }

}
