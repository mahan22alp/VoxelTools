type Props={value:string;options:string[];onChange:(value:string)=>void};
export default function VersionSelector({value,options,onChange}:Props){
  return <select value={value} onChange={e=>onChange(e.target.value)} aria-label="Minecraft version">{options.map(v=><option key={v}>{v}</option>)}</select>;
}
