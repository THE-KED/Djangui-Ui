import {Cotisation} from "../../Models/Entitys/Cotisation";
import {getNbParticipation} from "./getNbParticipation";
import {TontinesOps} from "../../Models/Abstracts/Interfaces/TontinesOps";
export class GetTotalTontine{

    constructor() {
    }

    public getTotalTontineVente(allCotisation:Cotisation[],
                         allPart:number[][],
                         allRetard:number[][],
                         allEchecNonPaye:number[][],
                         allEchecPaye:number[][],tontine:TontinesOps) {

        let total=0;
        let totalTauxVentes = 0;
        let totalEchecPaid = 0;
        let totalRetrad =0;
        let totalComplement = 0;
        let totalBoisson=0;
        let totalGratuit=0;
        let totalEchecNonPaid=0;
        let totalSupplement=0;

        let nbPart =0;

        let result:Map<string,number> = new Map<string, number>();

        console.log("allPart",allPart,
            "allRetard",allRetard,
            "allEchecNonPaye",allEchecNonPaye,
            "allEchecPaye",allEchecPaye);

        for(let cot of allCotisation){


            nbPart=getNbParticipation(Number(cot.id),allPart);

            totalTauxVentes += cot.tauxVente;
            totalComplement += cot.complement;
            totalBoisson += cot.tauxTontine;
            totalSupplement += cot.supplement;
            if(cot.gratuit)
                totalGratuit += cot.tauxTontine*nbPart;
            // if(nbPart>tontine.nbSeances)
            //     totalSupplement += (nbPart-tontine.nbSeances)*cot.tauxTontine;

            for(let retar of allRetard ){
                if(retar[0]==cot.id)
                    totalRetrad += retar[1]*cot.tauxEchec;
            }
            for(let echec of allEchecPaye){
                if(echec[0]==cot.id)
                    totalEchecPaid += echec[2]*(cot.tauxEchec>=500?cot.tauxEchec:500)+(tontine.tauxTontine);
            }
            for(let echec of allEchecNonPaye ){
                if(echec[0]==cot.id)
                    totalEchecNonPaid += echec[1]*(cot.tauxEchec>=500?cot.tauxEchec:500)+tontine.tauxTontine;
            }

        }

        total=((totalTauxVentes + totalRetrad + totalEchecPaid + totalSupplement) - (totalComplement + totalBoisson + totalGratuit));

        result.set("total",total);
        result.set("ventes",totalTauxVentes);
        result.set("retard",totalRetrad);
        result.set("E.P",totalEchecPaid);
        result.set("E.N.P",totalEchecNonPaid);
        result.set("supl",totalSupplement);
        result.set("compl",totalComplement)
        result.set("gratuit",totalGratuit);
        result.set("boisson",totalBoisson);

        return result;
    }
    public getTotalTontineSimple(allCotisation:Cotisation[],
                                          allPart:number[][],
                                          allRetard:number[][],
                                          allEchecNonPaye:number[][],
                                          allEchecPaye:number[][],tontine:TontinesOps) {



        let total=0;
        let totalTaux = 0;
        let totalEchecPaid = 0;
        let totalRetrad =0;
        let totalComplement = 0;
        let totalEchecNonPaid=0;

        let nbPart =0;

        let result:Map<string,number> = new Map<string, number>();

        console.log("cot",allCotisation,"ret",allRetard,"ep",allEchecPaye,"enp",allEchecNonPaye);

        for(let cot of allCotisation){

            nbPart=getNbParticipation(Number(cot.id),allPart);

            totalTaux += tontine.tauxTontine;
            totalComplement += cot.complement;

            for(let retar of allRetard ){
                if(retar[0]==cot.id)
                    totalRetrad += retar[1]*tontine.tauxEchec;
            }
            for(let echec of allEchecPaye){
                if(echec[0]==cot.id)
                    totalEchecPaid += (echec[2]*(tontine.tauxEchec));
            }
            for(let echec of allEchecNonPaye ){
                if(echec[0]==cot.id)
                    totalEchecNonPaid += echec[1]*(tontine.tauxEchec);
            }

        }

        total=((totalRetrad + totalEchecPaid) - (totalComplement));

        result.set("total",total);
        result.set("taux",totalTaux);
        result.set("retard",totalRetrad);
        result.set("E.P",totalEchecPaid);
        result.set("E.N.P",totalEchecNonPaid);
        result.set("compl",totalComplement)

        return result;

    }

}

