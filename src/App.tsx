import {useEffect,useMemo,useState} from "react";

type Tool={id:string;name:string;icon:string;desc:string};
const tools:Tool[]=[
{id:"command",name:"Command Generator",icon:"⌘",desc:"Build common Minecraft commands"},
{id:"give",name:"Give Generator",icon:"◆",desc:"Create /give item commands"},
{id:"summon",name:"Summon Generator",icon:"✦",desc:"Create mob summon commands"},
{id:"enchant",name:"Enchant Generator",icon:"✧",desc:"Add enchantments to items"},
{id:"effect",name:"Effect Generator",icon:"◈",desc:"Apply potion effects"},
{id:"fill",name:"Fill Generator",icon:"▦",desc:"Generate fill commands"},
{id:"teleport",name:"Teleport Generator",icon:"➤",desc:"Create /tp commands"},
];
const mobs=["zombie","skeleton","creeper","spider","enderman","warden","iron_golem"];
const items=["diamond_sword","netherite_sword","diamond_pickaxe","netherite_pickaxe","diamond_helmet","netherite_chestplate","elytra","golden_apple"];
const enchants=["sharpness","protection","efficiency","unbreaking","fortune","mending","fire_aspect","looting"];
const effects=["speed","strength","haste","regeneration","resistance","fire_resistance","night_vision","jump_boost"];

function App(){
 const [tool,setTool]=useState("command"),[query,setQuery]=useState(""),[version,setVersion]=useState("1.21.11");
 const [dark,setDark]=useState(true),[mobile,setMobile]=useState(false),[saved,setSaved]=useState<string[]>([]);
 const [form,setForm]=useState<Record<string,string>>({item:"diamond_sword",count:"1",player:"@p",mob:"zombie",level:"4",enchant:"sharpness",effect:"speed",duration:"30",amplifier:"1",x:"0",y:"64",z:"0",x1:"0",y1:"64",z1:"0",x2:"10",y2:"70",z2:"10",block:"stone",command:"/time set day"});
 useEffect(()=>{const s=localStorage.getItem("voxeltools-saved"); if(s) setSaved(JSON.parse(s));},[]);
 const visible=useMemo(()=>tools.filter(t=>(t.name+" "+t.desc).toLowerCase().includes(query.toLowerCase())),[query]);
 const set=(k:string,v:string)=>setForm(f=>({...f,[k]:v}));
 const command=useMemo(()=>{
  const f=form,p=f.player||"@p";
  switch(tool){
   case"give":return `/give ${p} ${f.item||"diamond_sword"} ${f.count||"1"}`;
   case"summon":return `/summon ${f.mob||"zombie"} ${f.x||"~"} ${f.y||"~"} ${f.z||"~"}`;
   case"enchant":return `/enchant ${p} ${f.enchant||"sharpness"} ${f.level||"4"}`;
   case"effect":return `/effect give ${p} ${f.effect||"speed"} ${f.duration||"30"} ${f.amplifier||"1"}`;
   case"fill":return `/fill ${f.x1} ${f.y1} ${f.z1} ${f.x2} ${f.y2} ${f.z2} ${f.block||"stone"}`;
   case"teleport":return `/tp ${p} ${f.x||"0"} ${f.y||"64"} ${f.z||"0"}`;
   default:return f.command||"/time set day";
  }
 },[tool,form]);
 const copy=()=>navigator.clipboard?.writeText(command);
 const save=()=>{const n=[...new Set([command,...saved])].slice(0,20);setSaved(n);localStorage.setItem("voxeltools-saved",JSON.stringify(n));};
 const field=(label:string,key:string,opts?:string[])=> <label className="field"><span>{label}</span>{opts?<select value={form[key]||opts[0]} onChange={e=>set(key,e.target.value)}>{opts.map(o=><option key={o}>{o}</option>)}</select>:<input value={form[key]||""} onChange={e=>set(key,e.target.value)} />}</label>;
 const editor=()=>{
  if(tool==="give")return <div className="grid">{field("Player","player")} {field("Item","item",items)} {field("Count","count")}</div>;
  if(tool==="summon")return <div className="grid">{field("Mob","mob",mobs)} {field("X","x")} {field("Y","y")} {field("Z","z")}</div>;
  if(tool==="enchant")return <div className="grid">{field("Player","player")} {field("Enchantment","enchant",enchants)} {field("Level","level")}</div>;
  if(tool==="effect")return <div className="grid">{field("Player","player")} {field("Effect","effect",effects)} {field("Duration","duration")} {field("Amplifier","amplifier")}</div>;
  if(tool==="fill")return <div className="grid">{field("From X","x1")} {field("From Y","y1")} {field("From Z","z1")} {field("To X","x2")} {field("To Y","y2")} {field("To Z","z2")} {field("Block","block")}</div>;
  if(tool==="teleport")return <div className="grid">{field("Player","player")} {field("X","x")} {field("Y","y")} {field("Z","z")}</div>;
  return <label className="field wide"><span>Command</span><input value={form.command} onChange={e=>set("command",e.target.value)} placeholder="/time set day"/></label>;
 };
 return <div className={dark?"app":"app light"}>
  <aside className={mobile?"sidebar open":"sidebar"}><div className="brand"><div className="logo">V</div><div><b>Voxel<span>Tools</span></b><small>MINECRAFT UTILITIES</small></div><button className="close" onClick={()=>setMobile(false)}>×</button></div>
   <div className="side-title">TOOLS</div>{tools.map(t=><button key={t.id} className={tool===t.id?"nav active":"nav"} onClick={()=>{setTool(t.id);setMobile(false)}}><i>{t.icon}</i>{t.name}</button>)}
   <div className="side-title">LIBRARY</div><button className="nav" onClick={()=>document.getElementById("library")?.scrollIntoView({behavior:"smooth"})}><i>▤</i>Command Library</button>
   <div className="side-foot">VOID + CYAN<br/><span>v1.0.0</span></div>
  </aside>
  <main><header><button className="hamb" onClick={()=>setMobile(true)}>☰</button><div className="search">⌕<input placeholder="Search tools..." value={query} onChange={e=>setQuery(e.target.value)}/></div><div className="head-actions"><select value={version} onChange={e=>setVersion(e.target.value)}><option>1.21.11</option><option>1.21.8</option><option>1.21.4</option><option>1.20.6</option></select><button onClick={()=>setDark(!dark)}>{dark?"☀":"☾"}</button></div></header>
   <section className="hero"><div><p className="eyebrow">MINECRAFT COMMAND LAB</p><h1>Build commands.<br/><span>Play smarter.</span></h1><p className="sub">Fast, clean Minecraft command tools built for creators, servers and everyday gameplay.</p></div><div className="hero-orb"><div>VT</div></div></section>
   <section className="section-head"><div><h2>Tools</h2><p>Choose a generator to get started.</p></div><span className="badge">{visible.length} TOOLS</span></section>
   <div className="tool-grid">{visible.map(t=><button key={t.id} className={tool===t.id?"tool-card selected":"tool-card"} onClick={()=>setTool(t.id)}><div className="tool-icon">{t.icon}</div><div><h3>{t.name}</h3><p>{t.desc}</p></div><b>→</b></button>)}</div>
   <section className="workspace"><div className="section-head"><div><h2>{tools.find(t=>t.id===tool)?.name}</h2><p>Target version: {version}</p></div></div><div className="workspace-grid"><div className="panel editor">{editor()}</div><div className="panel console"><div className="console-head"><span><em></em> LIVE COMMAND</span><small>{version}</small></div><pre>{command}</pre><div className="console-actions"><button className="primary" onClick={copy}>COPY COMMAND</button><button onClick={save}>＋ SAVE</button></div></div></div></section>
   <section id="library" className="library"><div className="section-head"><div><h2>Command Library</h2><p>Your saved commands stay in this browser.</p></div><button onClick={()=>{setSaved([]);localStorage.removeItem("voxeltools-saved")}}>Clear</button></div>{saved.length?<div className="saved">{saved.map((c,i)=><div className="saved-row" key={i}><code>{c}</code><button onClick={()=>navigator.clipboard?.writeText(c)}>COPY</button></div>) : <div className="empty">No saved commands yet. Generate one and press SAVE.</div>}</section>
   <footer>VOXELTOOLS <span>•</span> Built for Minecraft creators</footer>
  </main>
 </div>
}
export default App;