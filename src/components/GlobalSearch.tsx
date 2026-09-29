import {forwardRef} from "react";

type Props={value:string;onChange:(value:string)=>void;onEnter:()=>void};

const GlobalSearch=forwardRef<HTMLInputElement,Props>(function GlobalSearch({value,onChange,onEnter},ref){
  return <label className="header-search"><span aria-hidden="true">⌕</span><input ref={ref} aria-label="Global command search" placeholder="Search commands..." value={value} onChange={e=>onChange(e.target.value)} onKeyDown={e=>{if(e.key==="Enter")onEnter()}}/><kbd>/</kbd></label>;
});

export default GlobalSearch;
