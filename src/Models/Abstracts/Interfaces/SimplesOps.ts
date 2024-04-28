import {TontinesOps} from "./TontinesOps";
import {Cotisation} from "../../Entitys/Cotisation";

export interface SimplesOps extends TontinesOps{

    getTodaySeance():Cotisation;

    getTotals(allCotisation:Cotisation[],
              allPart:number[][],
              allRetard:number[][],
              allEchecNonPaye:number[][],
              allEchecPaye:number[][]):Map<string,number>;
}