import {ChangeDetectionStrategy, ChangeDetectorRef, Component, DestroyRef, inject, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from "@angular/router";
import {TontineServiceService} from "../../Services/tontine-service.service";
import {BilanServiceService} from "../../Services/bilan-service.service";
import {Cotisation} from "../../../Models/Entitys/Cotisation";
import {Tontine} from "../../../Models/Abstracts/Tontine";
import {Enregistrement} from "../../../Models/Entitys/Enregistrement";
import {DataService} from "../../Services/data.service";
import {forkJoin, tap} from "rxjs";
import {Vente} from "../../../Models/Entitys/Vente";
import {TontinesOps} from "../../../Models/Abstracts/Interfaces/TontinesOps";
import {takeUntilDestroyed} from "@angular/core/rxjs-interop";

@Component({
  selector: 'app-checkgratuit',
  templateUrl: './checkgratuit.component.html',
  styleUrls: ['./checkgratuit.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CheckgratuitComponent implements OnInit{

  dataSource : Cotisation[] = [];
  nbParts:number[][]=[];
  nbRetards:number[][]=[]
  nbPaidEchec:number[][]=[];
  nbNonPaidEchec:number[][]=[];
  idTontine!:number;
  nom:string="";
  nbToureGratuit:number=0;
  total=0;
  supplement=0;
  tontine!:Tontine;
  type="Vente";
  membres:Enregistrement[]=[];
  visibility: string ="invisible";
  totalCaisse=0;
  tontineOperable!:TontinesOps;
  result!:Map<string,number>;
  destroyRef = inject(DestroyRef);

  constructor(
    private router:ActivatedRoute,private tontineService:TontineServiceService,
    private bilanServ:BilanServiceService,private route:Router,
    private dataServcice:DataService, private cd:ChangeDetectorRef) {
  }
  ngOnInit() {

    this.idTontine=this.router.snapshot.params["id"];
    this.tontine=this.dataServcice.actualTontine;

        this.type=this.tontine.type.nom;
        if(this.tontine.type.code!=1)
          this.route.navigateByUrl("public/start/seances/"+this.idTontine);

      let cotsCall=this.tontineService.getCotisation(this.idTontine);
      let nbCotsCall = this.bilanServ.getNbCotisation(this.idTontine);
      let nbRetardCall = this.bilanServ.getNbRetard(this.idTontine);
      let nbPaidCall = this.bilanServ.getNbPaidEchec(this.idTontine);
      let nbNonPaidsCall = this.bilanServ.getNbNonPaidEchec(this.idTontine);
      let membreCall = this.tontineService.loadMembre(this.idTontine);

      forkJoin([cotsCall,nbCotsCall,nbRetardCall,nbPaidCall,nbNonPaidsCall,membreCall]).pipe(
          takeUntilDestroyed(this.destroyRef),
          tap(
              data=>{
                  this.dataSource = data[0];
                  if(this.dataSource.length>0)
                      this.nom=data[0][0].nom;
                  for (let cot of data[0]){
                      if(cot.gratuit)
                          this.nbToureGratuit++;
                  }
                  this.nbParts = data[1];
                  this.nbRetards = data[2];
                  this.nbPaidEchec =data[3];
                  this.nbNonPaidEchec =data[4];
                  this.membres=data[5];
                  console.log("nbRetards: " ,this.nbRetards);
                  this.type=this.tontine.type.nom;
                      this.tontineOperable = new Vente(this.tontine.id,this.tontine.actif,this.tontine.nom,
                      this.tontine.type,this.tontine.tauxTontine,this.tontine.tauxEchec,
                      this.tontine.tauxRetard,this.tontine.frequence,this.tontine.createdAt,
                      this.tontine.updatedAt,this.tontine.nbSeances,this.tontine.tauxEchecB);

              }
          ),
      ).subscribe(
          data => {
              let seuil:number =this.membres.length*this.tontine.tauxTontine;
              this.result = this.tontineOperable.getTotals(this.dataSource,this.nbParts,this.nbRetards,this.nbNonPaidEchec,this.nbPaidEchec);
              console.log("Result:",this.result);
              this.totalCaisse=Number(this.result.get("total"));
              if(this.totalCaisse<seuil){
                  this.route.navigateByUrl("public/start/seances/"+this.idTontine);
              }
              this.visibility="visible";
              this.cd.markForCheck();
          }
      );

  }


}
