export function today(timeZone=Intl.DateTimeFormat().resolvedOptions().timeZone):string {return new Intl.DateTimeFormat('en-CA',{timeZone,year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());}
export function addDays(date:string,n:number):string {const d=new Date(`${date}T12:00:00Z`);d.setUTCDate(d.getUTCDate()+n);return d.toISOString().slice(0,10);}
export function dateLabel(date:string,options:Intl.DateTimeFormatOptions={weekday:'short',day:'numeric',month:'short'}) {return new Date(`${date}T12:00:00`).toLocaleDateString('en-IN',options);}
