import {ChangeDetectionStrategy, ChangeDetectorRef, Component, DoCheck, OnInit} from '@angular/core';
import {AuthService} from "../../Services/auth.service";
import {MatDialog} from "@angular/material/dialog";
import {UserSaveComponent} from "../../dialogbox/user-save/user-save.component";
import {User} from "../../../Models/Entitys/User";
import {Membre} from "../../../Models/Entitys/Membre";
import {Observable, of} from "rxjs";

@Component({
  selector: 'app-profil',
  templateUrl: './profil.component.html',
  styleUrls: ['./profil.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProfilComponent implements DoCheck {

  profession="";
  membre:Membre|undefined;
  username="";
  password="";
  user:User|undefined;

  memberObs$!:Observable<Membre>;

  constructor(public authService:AuthService, private dialogBox:MatDialog,
              private cd:ChangeDetectorRef) {
  }

  ngDoCheck() {
    this.loadData();
  }


  loadData(){
    if (this.authService.appUser){
      this.user=this.authService.appUser;
      let membre =this.authService.appUser.membre;
      this.memberObs$ = of(membre).pipe();

      this.cd.markForCheck();

    }
  }
  openDialogBox(){
    console.log(this.membre);
    this.dialogBox.open(UserSaveComponent,{
      // width:'60%',
      panelClass:'save--form',
      data:this.membre,
    })
  }
}
