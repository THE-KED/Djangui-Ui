import {Tontine} from "../Abstracts/Tontine";
import {TypeTontine} from "./TypeTontine";
import {VentesOps} from "../Abstracts/Interfaces/VentesOps";
import {Cotisation} from "./Cotisation";
import {GetTotalTontine} from "../../app/metier/getTotalTontine";

export class Vente extends Tontine implements VentesOps{

  override nbSeances:number;
  constructor(
    id: number,
    actif: boolean,
    nom: string,
    type:TypeTontine,
    taux_tontine: number,
    taux_echec: number,
    taux_retard: number,
    frequence: number,
    created_at: Date | null,
    updated_at: Date | null,
    max:number,
    taux_echec_b:number|null

  ) {
    super(id,actif,nom,type,taux_tontine,taux_echec,taux_retard,
      frequence,created_at,updated_at,max,taux_echec_b,null);

    this.nbSeances=max;
  }

  getTodaySeance(): Cotisation {
    return new Cotisation(null,this.nom,0,0,this.tauxEchec,0,0,this.tauxTontine,
        0,this,null,new Date(),new Date(),0);
  }

  getTotals(allCotisation:Cotisation[],
                     allPart:number[][],
                     allRetard:number[][],
                     allEchecNonPaye:number[][],
                     allEchecPaye:number[][]): Map<string, number> {

    return new GetTotalTontine().getTotalTontineVente(allCotisation,allPart,allRetard,allEchecNonPaye,allEchecPaye,this);
  }
}
