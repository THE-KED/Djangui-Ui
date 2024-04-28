import { Injectable } from '@angular/core';
import {Tontine} from "../../Models/Abstracts/Tontine";
import {Cotisation} from "../../Models/Entitys/Cotisation";
import {Enregistrement} from "../../Models/Entitys/Enregistrement";

@Injectable({
  providedIn: 'root'
})
export class DataService {

  public actualTontine!:Tontine;
  public actualCotisation!: Cotisation;
  public selectedEnregistrement!: Enregistrement;
  public actualSeanceRang:number|null = null
  constructor() {
  }

}
