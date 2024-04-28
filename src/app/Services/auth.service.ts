import {Injectable, OnInit} from '@angular/core';
import {HttpClient, HttpHeaders, HttpParams} from "@angular/common/http";
import {AUTH_URL, CHANGE_PASS, CHANGE_USERNAME, MEMBER_URL, RESET} from "../../Conf/Http";
import jwtDecode from "jwt-decode";
import {User} from "../../Models/Entitys/User";
import {Router} from "@angular/router";
import {Membre} from "../../Models/Entitys/Membre";
import {Subject} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class AuthService implements OnInit{


  isAuth:boolean =false;
  role:string="";
  user:string="";
  accessToken:string="";
  appUser:User|undefined;
  userSubject= new Subject<User>();

  public emit(){
    this.userSubject.next(<User>this.appUser);
  }

  constructor(private http:HttpClient,private router:Router) {
  }

  ngOnInit() {
    let json = localStorage.getItem("appUser");
    if(json!=null){
      this.loadProfile(JSON.parse(json));
      this.router.navigateByUrl("/members");
    }
  }

  public Login(username:string, pass:string){
    let hd = {
      headers: new HttpHeaders().set('content-type','application/x-www-form-urlencoded')
    };
    let params = new HttpParams()
      .set("username",username).set("password",pass);

    return this.http.post(AUTH_URL,params,hd);
  }

  public logout(){
    this.isAuth = false;
    this.user = "";
    this.role = "";
    localStorage.removeItem("appUser");
  }

   public async loadProfile(data: any){

    let jwtToken = data["access-token"];
    this.accessToken=jwtToken;
    this.isAuth=true;
    let decodetJwt:any=jwtDecode(this.accessToken);
    this.user=decodetJwt.sub;
    this.role=decodetJwt.scope;
    console.log("user",this.user,"role",this.role);

    let params = new HttpParams().set("username",this.user);

    this.http.post<User>(MEMBER_URL+"/user",params).subscribe(data=>{
      this.appUser = data;
    });

  }

  public changePass(username:string,pass:string){

    let hd = {
      headers: new HttpHeaders().set('content-type','application/x-www-form-urlencoded')
    };
    let params = new HttpParams()
      .set("username",username).set("password",pass);

    return this.http.post(CHANGE_PASS,params,hd);

  }
  public changeName(last:string,username:string){

    let hd = {
      headers: new HttpHeaders().set('content-type','application/x-www-form-urlencoded')
    };
    let params = new HttpParams()
      .set("last",last).set("username",username);

    return this.http.post(CHANGE_USERNAME,params,hd);

  }

  public reset(element: Membre) {


    let hd = {
      headers: new HttpHeaders().set('content-type','application/x-www-form-urlencoded')
    };
    let params = new HttpParams()
      .set("username",element.nom);

    return this.http.post(RESET,params,hd);

  }
}
