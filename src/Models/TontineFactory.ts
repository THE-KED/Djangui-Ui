import {TontinesOps} from "./Abstracts/Interfaces/TontinesOps";
import {TypeTontine} from "./Entitys/TypeTontine";

export interface TontineFactory{

    createTontine(    id: number,
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
                      taux_echec_b:number|null):TontinesOps;

}