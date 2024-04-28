import {Pret} from "../../Models/Entitys/Pret";
import {Versement} from "../../Models/Entitys/Versement";

export function getDetteMontant(pret: Pret, versements: Versement[]):number{

    let montant :number = Number(pret.montant);
    let lastVersementDate :Date|null = versements.length>0? versements[0].dateVersement : null;
    let sommeVerser :number = 0
    let delay :number = 0;

    //date du dernier versement et somme total deja verser
    for (let verse of versements){
        if (verse.dateVersement)
            if(!lastVersementDate){
                lastVersementDate = new Date(verse.dateVersement.toString());
            }else if (new Date(lastVersementDate.toString()).getTime()<new Date(verse.dateVersement.toString()).getTime()){
                lastVersementDate = new Date(verse.dateVersement.toString());
            }

        sommeVerser += Number(verse.montant);
    }


    //le delay ecouler depuis l'optention du pret
    if (pret.datePret){
        delay = new Date().getTime() - new Date(pret.datePret.toString()).getTime();
    }

    let accorded = Number(pret.epargnant?.epargne?.delaisRemboursement);
    let tauxInteret = Number(pret.epargnant?.epargne?.tauxInteretPret)/100;
    let verseDelay = 0;
    if (lastVersementDate && pret.datePret)
        verseDelay = new Date(lastVersementDate.toString()).getTime() - new Date(pret.datePret.toString()).getTime();

    montant += (Number(pret.montant) * tauxInteret);

    while ((delay - accorded)>2592000000){

        if(verseDelay >0) {
            if((delay <= verseDelay) && (sommeVerser)>=montant){
                break;
            }
        }

        montant += (montant * tauxInteret);

        delay -= 2592000000;
    }


    return Math.round(montant+1);
}