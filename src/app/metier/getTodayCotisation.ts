import {TontineServiceService} from "../Services/tontine-service.service";
import {Cotisation} from "../../Models/Entitys/Cotisation";

export class GetTodayCotisation {

    last!:Cotisation;
    private cotisation!: Cotisation;

    constructor(private tontineService:TontineServiceService,private idTontine:number) {
    }

    get(data:Cotisation){

        this.last=data;
        if(data.createdAt){
            let creatat= new Date(data.createdAt).getTime();
            let actualDate = new Date().getTime();
            if((actualDate-creatat)>=86400000){
                console.log("###### new Cotisation #####")
                this.cotisation = new Cotisation(null,data.nom,data.rang+1,0,data.tauxEchec,0,0,data.tauxTontine,
                    0,data.tontine,null,new Date(),new Date(),0);
                if (this.cotisation.rang==1){
                    this.cotisation.nom = new Date().toLocaleString().slice(0,10)+" "+this.cotisation.nom;
                }else {
                    this.cotisation.nom = new Date().toLocaleString().slice(0,10)+" "+this.cotisation.nom.slice(10);
                }
            }
            else {
                this.cotisation=data;
            }
        }
        return this.cotisation;
    }

}