export function getDimancheDates(d1:Date, nbDimaches:number){
    let dates:Date[]=[];
    let date  = d1;
    let i=0;
    if(date.getDay()!=0){
        while (date.getDay()!=0){
            date.setTime(date.getTime()+86400000);
        }
        dates.push(new Date(String(date.toString())));
        i++;
    }
    let date2 = date;
    while(i<nbDimaches){
        date2.setTime(date2.getTime()+604800000);
        dates.push(new Date(String(date2.toString())));
        i++;
    }
    return dates;
}