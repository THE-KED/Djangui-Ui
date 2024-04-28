import {ChangeDetectionStrategy, ChangeDetectorRef, Component, DestroyRef, inject, Inject} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import {Participation} from "../../../Models/Entitys/Participation";
import {TontineServiceService} from "../../Services/tontine-service.service";
import {takeUntilDestroyed} from "@angular/core/rxjs-interop";
import {switchMap, tap} from "rxjs";

@Component({
  selector: 'app-cotisation-db',
  templateUrl: './cotisation-db.component.html',
  styleUrls: ['./cotisation-db.component.scss'],
    changeDetection:ChangeDetectionStrategy.OnPush
})
export class CotisationDBComponent {


  destroyRef = inject(DestroyRef);

  constructor(public dialogRef:MatDialogRef<CotisationDBComponent>,
              @Inject(MAT_DIALOG_DATA) public participation:Participation,
              private tontineService:TontineServiceService,
              private cd:ChangeDetectorRef) {

  }

  cotiser(){
    if(this.participation.cotisation.statut==0){
      this.participation.echec=false;
      this.participation.tontine=true;
    }else if(this.participation.cotisation.statut==1){
      this.participation.echec=false;
      this.participation.tontine=true;
      this.participation.retard=true;
    }
    if(this.participation.cotisation.id==null){
      this.tontineService.saveCotisation(this.participation.cotisation).pipe(
          takeUntilDestroyed(this.destroyRef),
          switchMap(data =>{
              console.log("saveCotisation:",data);
              this.participation.cotisation=data;

              return this.tontineService.saveParticipation(this.participation);
          })
      ).subscribe(
        data =>{
          console.log("save part",data);
          this.cd.markForCheck();
          this.dialogRef.close({ data: this.participation });
        }
      );

    }else {
      this.tontineService.saveParticipation(this.participation).pipe(
          takeUntilDestroyed(this.destroyRef),
          tap(data =>{
              console.log("save part",data);
              this.dialogRef.close({ data: this.participation });
          })

      ).subscribe(
        data=>{
            this.cd.markForCheck();
        }
      );
    }
  }
}
