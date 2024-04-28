import {Pret} from "./Pret";

export class Versement{

  id:number|null = null;
  montant:number|null = null;
  dateVersement: Date|null = null;
  pret:Pret|null = null;

  constructor() {
  }

}
