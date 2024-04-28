import {Epargnant} from "./Epargnant";
import {Garrantie} from "./Garrantie";

export class Pret{

  id:number|null = null;
  epargnant:Epargnant|null = null;
  montant:number|null = null;
  datePret:Date|null = null;
  echeanche:number|null = null;
  motif:string="";
  garrantie:Garrantie|null = null;


  constructor() {
  }

}
