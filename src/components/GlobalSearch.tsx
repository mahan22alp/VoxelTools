type Props={value:string;onChange:(value:string)=>void;onEnter:()=>void};
export default function GlobalSearch({value,onChange,onEnter}:Props){
  return <label className="header-search"><span>⌕</span><input aria-label="Global command search" placeholder="Search commands..." value={value} onChange={e=>onChange(e.target.value)} onKeyDown={e=>{if(e.key==="Enter")onEnter()}}/></label>;
}
