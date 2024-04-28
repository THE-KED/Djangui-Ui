import { Injectable } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {AuthService} from "./auth.service";
import {Epargne} from "../../Models/Entitys/Epargne";
import {EPARGNE_URL} from "../../Conf/Http";
import {Depot} from "../../Models/Entitys/Depot";
import {Pret} from "../../Models/Entitys/Pret";
import {Versement} from "../../Models/Entitys/Versement";

@Injectable({
  providedIn: 'root'
})
export class EpargneService {

  constructor(private http:HttpClient, private authService:AuthService) { }

  public saveEpargne(epargne:Epargne){

     return this.http.post<Epargne>(EPARGNE_URL+'/save',epargne);
  }
  public Deposit(depot:Depot){

    return this.http.post<Depot>(EPARGNE_URL+'/Deposit',depot);
  }

  public Emprunt(emp:Pret){

    return this.http.post<Pret>(EPARGNE_URL+'/Emprunt',emp);
  }

  public getAllEpargnes(){

    return this.http.get<Epargne[]>(EPARGNE_URL+'/all');
  }

  public getAllDepoByEpargnes(idEp:number){

    return this.http.get<Depot[]>(EPARGNE_URL+'/Depot/all/'+idEp);
  }
  public getAllEmpruntByEpargnes(idEp:number){

    return this.http.get<Pret[]>(EPARGNE_URL+'/Emprunt/all/'+idEp);
  }

  public getDetteByEpargnes(idEp:number){

    return this.http.get<Pret[]>(EPARGNE_URL+'/prets/'+idEp);
  }

  public verse(verse: Versement) {

    return this.http.post<Versement>(EPARGNE_URL+'/Verse',verse);
  }

  public getAllVerseByEpargnes(number: number) {

    return this.http.get<Versement[]>(EPARGNE_URL+'/Verse/'+number);
  }
}
