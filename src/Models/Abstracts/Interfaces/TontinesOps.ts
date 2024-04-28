import {Cotisation} from "../../Entitys/Cotisation";
import {TypeTontine} from "../../Entitys/TypeTontine";

export interface TontinesOps{

    id: number;
    actif: boolean;
    nom: string;
    type:TypeTontine;
    tauxTontine: number ;
    tauxEchec: number;
    tauxRetard: number;
    frequence: number;
    createdAt: Date | null;
    updatedAt: Date | null;
    nbSeances: number;
    tauxEchecB: number|null;
    boisson:number|null;

    getTodaySeance():Cotisation;

    getTotals(allCotisation:Cotisation[],
              allPart:number[][],
              allRetard:number[][],
              allEchecNonPaye:number[][],
              allEchecPaye:number[][]):Map<string,number>;
}