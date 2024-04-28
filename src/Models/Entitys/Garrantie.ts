import {Tontine} from "../Abstracts/Tontine";
import {Epargnant} from "./Epargnant";

export class Garrantie{

  id:number|null=null;
  tontines:Tontine[]=[];
  epargnants:Epargnant[]=[];
  autres:string="";

  constructor() {
  }

}
