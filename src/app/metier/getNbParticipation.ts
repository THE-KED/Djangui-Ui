export function getNbParticipation(cotID:number,nbParts:number[][]){
    for(let part of nbParts ){

        if(part[0]==cotID){
            return part[1];
        }
    }
    return 0;
}