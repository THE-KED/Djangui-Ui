import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import {FormBuilder, FormControl} from "@angular/forms";
import {Membre} from "../../../Models/Entitys/Membre";
import {MembreServiceService} from "../../Services/membre-service.service";
import {AuthService} from "../../Services/auth.service";

@Component({
  selector: 'app-user-save',
  templateUrl: './user-save.component.html',
  styleUrls: ['./user-save.component.scss']
})
export class UserSaveComponent implements OnInit{

  name=this.authService.appUser?.name;
  form=this.fb.group({
    nom:new FormControl(this.member.nom),
    born:new FormControl(this.member.ddn),
    residance:new FormControl(this.member.adresse),
    profession:new FormControl(this.member.profession),
    contact:new FormControl(this.member.tel),
    sexe:new FormControl(this.getSexe()),
    CNI:new FormControl(this.member.cni),
    delivre:new FormControl(this.member.dcni),
    pass:new FormControl(""),
    user:new FormControl(this.name)
  });
  membre:Membre|undefined;

  ngOnInit() {
  }

  constructor(public dialogRef:MatDialogRef<UserSaveComponent>,
              private fb:FormBuilder,
              @Inject(MAT_DIALOG_DATA)
              public member:Membre,
              private memberService:MembreServiceService,
              private authService:AuthService
    ) {
  }

  getSexe(){
    if(this.member.sexe==="Homme")
      return "1";
    return  "2";
  }

  saveUser(){
    let membre= this.member;
    let pass= String(this.form.controls.pass.value);
    membre.nom=String(this.form.controls.nom.value);
    membre.ddn=new Date(String(this.form.controls.born.value));
    membre.cni=String(this.form.controls.CNI.value);
    membre.adresse=String(this.form.controls.residance.value);
    membre.profession=String(this.form.controls.profession.value);
    membre.sexe=String(this.form.controls.sexe.value)=="1"?"Homme":"Femme";
    membre.tel=String(this.form.controls.contact.value);
    membre.dcni=String(this.form.controls.delivre.value);
    membre.updatedAt=new Date();
    let user = String(this.form.controls.user.value);
    console.log("userSer",this.authService.user,"user",user)


    console.log(membre);

    this.save(membre).then(data=>{
      this.dialogRef.close();

      if(pass.length>0 && this.authService.appUser?.name==user){
        this.changePassword(membre,pass);
      }
      if(this.authService.appUser?.name!=user && pass.length==0){
        console.log("yoooo",)
        this.changeName(user);
      }
      if(this.authService.appUser?.name!=user && pass.length>0){
        this.changeNameAndPassword(membre,pass,user);
      }
    });
  }

  public async save(mem:Membre){
    this.memberService.save(mem);
  }

  public changePassword(membre:Membre,pass:string){
    this.authService.changePass(String(this.authService.appUser?.name),pass).subscribe(
        data=>{
          localStorage.setItem("appUser",JSON.stringify(data));
          this.authService.loadProfile(data).then(
              data=>{
                console.log("##LOAD##",data);
              }
          );
        }
    );
  }
  public changeName(user:string){
    this.authService.changeName(String(this.authService.appUser?.name),user).subscribe(
        data=>{
          console.log("##CHANGE##",data)
        }
    );
  }
  public changeNameAndPassword(membre:Membre, pass:string, user:string){
    this.authService.changePass(String(this.authService.appUser?.name),pass).subscribe(
        data1=>{
          localStorage.setItem("appUser",JSON.stringify(data1));
            console.log("appUser",data1);

          this.authService.loadProfile(data1).then(
              data=>{
                console.log("##LOAD##",data1);
              }
          );

          this.authService.changeName(String(this.authService.appUser?.name),user).subscribe(
              data=>{
                console.log("##CHANGE##",data)
                console.log("appUser1",data);

              }
          );

        }
    );

  }
}
