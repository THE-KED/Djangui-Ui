import {ChangeDetectionStrategy, ChangeDetectorRef, Component, DestroyRef, inject, OnInit} from '@angular/core';
import {TontineServiceService} from "../../Services/tontine-service.service";
import {Tontine} from "../../../Models/Abstracts/Tontine";
import {TypeTontine} from "../../../Models/Entitys/TypeTontine";
import {AuthService} from "../../Services/auth.service";
import {DataService} from "../../Services/data.service";
import {takeUntilDestroyed} from "@angular/core/rxjs-interop";
import {switchMap} from "rxjs";

@Component({
  selector: 'app-showtontine',
  templateUrl: './tontine-bilan-list.component.html',
  styleUrls: ['./tontine-bilan-list.component.scss'],
    changeDetection:ChangeDetectionStrategy.OnPush,
})
export class TontineBilanListComponent implements OnInit{
  displayedColumns: string[] = ['position', 'name', 'cotisation','type','retard', 'echec'];
  dataSource:Tontine[]=[];
  types:TypeTontine[]=[];
  tontines:Array<Tontine[]>=[];
  Roles="";
  destroyRef = inject(DestroyRef);
  constructor(private tontineService:TontineServiceService,private authSrv:AuthService,
              private dataService:DataService,private cd: ChangeDetectorRef) {

  }

  ngOnInit() {
    this.Roles=this.authSrv.role;
    this.tontineService.getTypes().pipe(
        takeUntilDestroyed(this.destroyRef),
        switchMap(types => {
            this.types=types;
            for (let type of this.types){
                this.tontines.push(new Array<Tontine>());
            }
            if(this.Roles.includes('BUREAU'))
                return this.tontineService.LoadTontine();
            return this.tontineService.LoadMyTontine();
        })
    ).subscribe(
          data=>{
            for(let i=0 ;i<data.length ;i++){
              for(let j=0;j<this.types.length;j++){
                if(data[i].type.id==this.types[j].id){
                  this.tontines[j].push(data[i]);
                }
              }
            }
            for (let i = 0; i < this.types.length; i++) {
                this.tontines[i].sort((a:Tontine , b:Tontine)=>{
                    if(a.actif && !b.actif)
                        return -1;
                    else if(!a.actif && b.actif)
                        return 1;

                    return 0;
                } );
            }

              this.cd.markForCheck();

          }
    );

  }

  getClass(tontine:Tontine ){
    return tontine.actif? "actif" : "inactif";
  }

  getTontine(j: number) {
    return this.tontines[j];
  }

    SelectTontine(element:Tontine) {
        this.dataService.actualTontine=element;
    }

    protected readonly JSON = JSON;
}
