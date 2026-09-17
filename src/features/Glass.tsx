import { useEffect, useRef, type ReactNode } from 'react';
import '../vendor/liquid-glass.js';
export function Glass({children,className='',disabled=false}:{children:ReactNode;className?:string;disabled?:boolean}) {
  const ref=useRef<HTMLDivElement>(null);
  useEffect(()=>{if(disabled||!ref.current)return;const g=window.liquidGlass(ref.current,{scale:-60,chroma:2,blur:12});return()=>g.destroy();},[disabled]);
  return <div ref={ref} className={`glass ${className}`}>{children}</div>;
}
