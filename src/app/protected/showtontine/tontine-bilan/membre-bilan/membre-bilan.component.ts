import {ChangeDetectorRef, Component, DestroyRef, inject, OnInit} from '@angular/core';
import {ActivatedRoute} from "@angular/router";
import {TontineServiceService} from "../../../../Services/tontine-service.service";
import {DataService} from "../../../../Services/data.service";
import {TontinesOps} from "../../../../../Models/Abstracts/Interfaces/TontinesOps";
import {Enregistrement} from "../../../../../Models/Entitys/Enregistrement";
import {Poste} from "../../../../../Models/Entitys/Poste";
import {Participation} from "../../../../../Models/Entitys/Participation";
import {switchMap, tap} from "rxjs";
import {takeUntilDestroyed} from "@angular/core/rxjs-interop";
import {Cotisation} from "../../../../../Models/Entitys/Cotisation";

@Component({
  selector: 'app-membre-bilan',
  templateUrl: './membre-bilan.component.html',
  styleUrls: ['./membre-bilan.component.scss']
})
export class MembreBilanComponent implements OnInit{

  displayedColumns: string[] = ['position', 'cotise', 'retard', 'echec', 'afficher'];
  enrg!:Enregistrement ;
  enrgId!:number;
  tontine!:TontinesOps;
  poste!:Poste;
  dataSource:Participation[] = [];
  cssClass:string[][]=[[],[],[],[],[]];
  destroyref = inject(DestroyRef);

  constructor(private router:ActivatedRoute,private tontineService:TontineServiceService,
              private dataService:DataService,private cdr:ChangeDetectorRef) {
  }

  ngOnInit() {
    this.enrgId=this.router.snapshot.params['id'];
    this.tontine = this.dataService.actualTontine;
    this.enrg=this.dataService.selectedEnregistrement;
    if (this.enrg.membre.postes)
      this.poste=this.enrg.membre.postes[0];

    this.tontineService.getMyPartsByTontine(this.tontine.id,this.enrg.id).pipe(
        takeUntilDestroyed(this.destroyref),
        tap(data =>{
          this.dataSource = data;
          for (let part of data){
            if(part.tontine){
              this.cssClass[0].push("tontine");
              this.cssClass[3].push("none")
            }else
              this.cssClass[0].push("rejecter");
            part.retard?this.cssClass[1].push("retard"):this.cssClass[1].push("none");
            if (part.echec){
              this.cssClass[2].push("echec");
              this.cssClass[3].push("red");
            }else if (part.tontine!){
              this.cssClass[2].push("payer");
            }else {
              this.cssClass[2].push("none");
              this.cssClass[3].push("none");

            }


            if(part.cotisation.beneficiaire && Number(part.cotisation.beneficiaire.enregistrement?.id)==this.enrg.id)
              this.cssClass[4].push("ben");
            else
              this.cssClass[4].push("none");

          }

        })
    ).subscribe(data =>{
      console.log("Data:",this.dataSource,this.cssClass);
      this.cdr.markForCheck();
    })
  }

  selectCot(cotisation:Cotisation) {
    this.dataService.actualCotisation = cotisation;
  }
}
