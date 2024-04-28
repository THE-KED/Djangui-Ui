import {Component, Inject} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogModule, MatDialogRef} from "@angular/material/dialog";
import {MatButtonModule} from "@angular/material/button";
import {MatInputModule} from "@angular/material/input";
import {FormBuilder, FormControl, ReactiveFormsModule} from "@angular/forms";
import {MatFormFieldModule} from "@angular/material/form-field";
import {EpargneService} from "../../Services/epargne.service";
import {Versement} from "../../../Models/Entitys/Versement";
import {Pret} from "../../../Models/Entitys/Pret";

@Component({
  selector: 'app-buy-pret-dialog',
  templateUrl: './buy-pret-dialog.component.html',
  standalone: true,
  imports: [
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    ReactiveFormsModule
  ],
  styleUrls: ['./buy-pret-dialog.component.scss']
})
export class BuyPretDialogComponent {
  form =this.fb.group({
    montant:new FormControl(0)
  })


  constructor(private fb:FormBuilder, private dialogRef:MatDialogRef<BuyPretDialogComponent>,
              private epService:EpargneService,
              @Inject(MAT_DIALOG_DATA)
              private pret:Pret) {
  }

  buyPret(){
    let verse = new Versement();
    verse.dateVersement = new Date();
    verse.montant = Number(this.form.controls.montant.value);
    verse.pret = this.pret;

    this.epService.verse(verse).subscribe(
        data =>{
          console.log("Verse",data);
          this.dialogRef.close( {data: data});
        }
    );
  }

}
