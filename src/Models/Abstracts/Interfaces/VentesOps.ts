import {TontinesOps} from "./TontinesOps";
import {Cotisation} from "../../Entitys/Cotisation";
import {TypeTontine} from "../../Entitys/TypeTontine";

export interface VentesOps extends TontinesOps{

   getTodaySeance():Cotisation;

   getTotals(allCotisation:Cotisation[],
             allPart:number[][],
             allRetard:number[][],
             allEchecNonPaye:number[][],
             allEchecPaye:number[][]):Map<string,number>;
}