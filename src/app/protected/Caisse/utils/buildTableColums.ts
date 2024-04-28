
export function buildTableColums(nbDimanche:number){
    let cols:string[]=["no","epargnants"];
    for(let i=0;i<nbDimanche;i++){
      cols.push("D"+(i+1));
    }
    cols.push("total");
    cols.push("interert");
    return cols;

}