export function countNbDimanche(d1: Date, d2: Date): number{
    let count=0;
    if(d2>d1)
        for(let i:Date=d1;i<=d2;i.setDate(i.getDate()+1)){
            if(i.getDay()==0)
                count++;
        }
    return count;
}