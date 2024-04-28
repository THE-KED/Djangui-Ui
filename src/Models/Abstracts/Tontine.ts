import {TypeTontine} from "../Entitys/TypeTontine";
// import {Simple} from "../Entitys/Simple";
import {TontinesOps} from "./Interfaces/TontinesOps";
import {Cotisation} from "../Entitys/Cotisation";

export abstract class Tontine implements TontinesOps{

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

  constructor(id:number, actif: boolean, nom: string, type:TypeTontine, taux_tontine: number, taux_echec: number, taux_retard: number, frequence: number, created_at: Date | null, updated_at: Date | null , max: number,tauxEchecb:number|null,boisson:number|null) {
    this.id=id;
    this.actif = actif;
    this.nom = nom;
    this.type=type;
    this.tauxTontine = taux_tontine;
    this.tauxEchec = taux_echec;
    this.tauxRetard = taux_retard;
    this.frequence = frequence;
    this.createdAt = created_at;
    this.updatedAt = updated_at;
    this.nbSeances = max;
    this.tauxEchecB = tauxEchecb;
    this.boisson=boisson;
  }

 // public buildVente():Vente{
 //    // return new Vente(this.id,this.actif,this.nom,this.type,this.tauxTontine,this.tauxEchec,this.tauxRetard,this.frequence,this.createdAt,this.updatedAt,this.nbSeances,this.tauxEchecB);
 //
 //  }
 //  public buildSimple():Simple{
 //    return new Simple(this.id,this.actif,this.nom,this.type,this.tauxTontine,this.tauxEchec,Number(this.tauxEchecB),this.tauxRetard,this.frequence,this.createdAt,this.updatedAt,this.nbSeances);
 //
 //  }

  abstract getTodaySeance(): Cotisation;
  abstract getTotals(allCotisation: Cotisation[], allPart: number[][], allRetard: number[][], allEchecNonPaye: number[][], allEchecPaye: number[][]): Map<string, number>;
}
