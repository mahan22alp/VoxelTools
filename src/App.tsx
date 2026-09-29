import {useEffect,useMemo,useState} from "react";
import {minecraftCommands} from "./data/commands";
import {versionOptions} from "./data/versions";
import {isCommandAvailable,syntaxFor} from "./engine/versionResolver";
import {naturalCommand} from "./engine/commandGenerator";
import {generateToolCommand} from "./engine/toolGenerator";

type Tool={id:string;name:string;icon:string;desc:string};
const tools:Tool[]=[
{id:"command",name:"Command Generator",icon:"⌘",desc:"Build common Minecraft commands"},
{id:"give",name:"Give Generator",icon:"◆",desc:"Create /give item commands"},
{id:"summon",name:"Summon Generator",icon:"✦",desc:"Create mob summon commands"},
{id:"enchant",name:"Enchant Generator",icon:"✧",desc:"Add enchantments to items"},
{id:"effect",name:"Effect Generator",icon:"◈",desc:"Apply potion effects"},
{id:"fill",name:"Fill Generator",icon:"▦",desc:"Generate fill commands"},
{id:"teleport",name:"Teleport Generator",icon:"➤",desc:"Create /tp commands"}
];

const mobs=["zombie","skeleton","creeper","spider","enderman","warden","iron_golem"];
const items=["diamond_sword","netherite_sword","diamond_pickaxe","netherite_pickaxe","diamond_helmet","netherite_chestplate","elytra","golden_apple"];
const enchants=["sharpness","protection","efficiency","unbreaking","fortune","mending","fire_aspect","looting"];
const effects=["speed","strength","haste","regeneration","resistance","fire_resistance","night_vision","jump_boost"];

function App(){
 const [tool,setTool]=useState("command"),[page,setPage]=useState<"home"|"generator">(()=>{try{return localStorage.getItem("voxeltools-page")==="generator"?"generator":"home"}catch{return "home"}}),[query,setQuery]=useState(""),[version,setVersion]=useState(()=>{try{const stored=localStorage.getItem("voxeltools-version");return stored&&versionOptions.includes(stored)?stored:"1.21.11"}catch{return "1.21.11"}});
 const [commandQuery,setCommandQuery]=useState(""),[category,setCategory]=useState("All");
 const [dark,setDark]=useState(()=>{try{return(localStorage.getItem("voxeltools-theme")||"light")==="dark"}catch{return false}}),[mobile,setMobile]=useState(false),[saved,setSaved]=useState<string[]>(()=>{try{const raw=localStorage.getItem("voxeltools-saved");const parsed=raw?JSON.parse(raw):[];return Array.isArray(parsed)?parsed.filter((x):x is string=>typeof x==="string").slice(0,20):[]}catch{return []}}),[scrollProgress,setScrollProgress]=useState(0),[copied,setCopied]=useState(false),[copyError,setCopyError]=useState(false);
 const [form,setForm]=useState<Record<string,string>>({player:"@p",item:"diamond_sword",count:"1",mob:"zombie",enchant:"sharpness",level:"4",effect:"speed",duration:"30",amplifier:"1",x:"~",y:"~",z:"~",x1:"~",y1:"~",z1:"~",x2:"~",y2:"~",z2:"~",block:"stone",components:""});
 const [naturalInput,setNaturalInput]=useState("set time to night"),[generated,setGenerated]=useState("/time set night");
 useEffect(()=>{localStorage.setItem("voxeltools-theme",dark?"dark":"light")},[dark]);
 useEffect(()=>{localStorage.setItem("voxeltools-version",version)},[version]);
 useEffect(()=>{setGenerated(naturalCommand(naturalInput,version))},[naturalInput,version]);
 useEffect(()=>{const onScroll=()=>{const max=document.documentElement.scrollHeight-window.innerHeight;setScrollProgress(max>0?Math.min(100,Math.max(0,window.scrollY/max*100)):0)};onScroll();window.addEventListener("scroll",onScroll,{passive:true});return()=>window.removeEventListener("scroll",onScroll)},[]);
 useEffect(()=>{const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting)entry.target.classList.add("in-view")}),{threshold:.12,rootMargin:"0px 0px -35px 0px"});document.querySelectorAll(".reveal").forEach(el=>observer.observe(el));return()=>observer.disconnect()},[]);
 const categories=useMemo(()=>["All",...Array.from(new Set(minecraftCommands.map(c=>c.category)))],[]);
 const allCommands=useMemo(()=>minecraftCommands.filter(c=>(category==="All"||c.category===category)&&isCommandAvailable(c,version)&&(c.name+" "+syntaxFor(c,version)+" "+c.desc).toLowerCase().includes(commandQuery.toLowerCase())),[category,commandQuery,version]);
 const set=(k:string,v:string)=>setForm(f=>({...f,[k]:v}));
 const command=useMemo(()=>tool==="command"?generated:generateToolCommand(tool,form,version),[tool,form,generated,version]);
 const copy=async()=>{try{if(!navigator.clipboard)throw new Error("Clipboard unavailable");await navigator.clipboard.writeText(command);setCopied(true);setCopyError(false)}catch{setCopied(false);setCopyError(true)}window.setTimeout(()=>{setCopied(false);setCopyError(false)},1400)};
 const save=()=>{const n=[...new Set([command,...saved])].slice(0,20);setSaved(n);localStorage.setItem("voxeltools-saved",JSON.stringify(n));};
 const removeSaved=(item:string)=>{const n=saved.filter(x=>x!==item);setSaved(n);localStorage.setItem("voxeltools-saved",JSON.stringify(n));};
 const field=(label:string,key:string,opts?:string[])=> <label className="field"><span>{label}</span>{opts?<select value={form[key]||opts[0]} onChange={e=>set(key,e.target.value)}>{opts.map(o=><option key={o}>{o}</option>)}</select>:<input value={form[key]||""} onChange={e=>set(key,e.target.value)} />}</label>;
 const editor=()=>{
  if(tool==="give")return <div className="grid">{field("Player","player")} {field("Item","item",items)} {field("Count","count")} <label className="field wide"><span>Components (1.20.5+)</span><input value={form.components||""} onChange={e=>set("components",e.target.value)} placeholder="damage=1,custom_data={...}" /></label></div>;
  if(tool==="summon")return <div className="grid">{field("Mob","mob",mobs)} {field("X","x")} {field("Y","y")} {field("Z","z")}</div>;
  if(tool==="enchant")return <div className="grid">{field("Player","player")} {field("Enchantment","enchant",enchants)} {field("Level","level")}</div>;
  if(tool==="effect")return <div className="grid">{field("Player","player")} {field("Effect","effect",effects)} {field("Duration","duration")} {field("Amplifier","amplifier")}</div>;
  if(tool==="fill")return <div className="grid">{field("From X","x1")} {field("From Y","y1")} {field("From Z","z1")} {field("To X","x2")} {field("To Y","y2")} {field("To Z","z2")} {field("Block","block")}</div>;
  if(tool==="teleport")return <div className="grid">{field("Player","player")} {field("X","x")} {field("Y","y")} {field("Z","z")}</div>;
  return <div className="natural-editor"><label className="field wide"><span>Describe what you want</span><input aria-label="Describe a command" value={naturalInput} onChange={e=>{setNaturalInput(e.target.value);setGenerated(naturalCommand(e.target.value,version))}} placeholder="e.g. set time to night"/></label><p className="hint">Live generation · offline · version selector stays global</p></div>;
 };
 const switchPage=(next:"home"|"generator")=>{setPage(next);localStorage.setItem("voxeltools-page",next);window.scrollTo({top:0,behavior:"smooth"});setMobile(false)};
 return <div className={dark?"app dark":"app"}>
  <header className="site-header"><div className="scroll-progress"><span style={{width:`${scrollProgress}%`}} /></div><div className="header-inner">
   <button className="mobile-menu" onClick={()=>setMobile(true)} aria-label="Open menu">☰</button>
   <button className="brand" onClick={()=>switchPage("home")}><span className="brand-mark">V</span><span>Voxel<span>Tools</span></span></button>
   <label className="header-search"><span>⌕</span><input aria-label="Global command search" placeholder="Search commands..." value={query} onChange={e=>{setQuery(e.target.value);setCommandQuery(e.target.value)}} onKeyDown={e=>{if(e.key==="Enter"){switchPage("home");window.requestAnimationFrame(()=>document.getElementById("commands")?.scrollIntoView({behavior:"smooth"}))}}}/></label>
   <nav className={mobile?"main-nav open":"main-nav"}><button className={page==="home"?"nav active":"nav"} onClick={()=>switchPage("home")}>Home</button><button className={page==="generator"?"nav active":"nav"} onClick={()=>switchPage("generator")}>Command Generator</button><button className="nav" onClick={()=>{switchPage("home");window.setTimeout(()=>document.getElementById("commands")?.scrollIntoView({behavior:"smooth"}),120)}}>Commands</button><button className="nav close-nav" onClick={()=>setMobile(false)}>Close</button></nav>
   <div className="header-actions"><span className="version-label">Minecraft Java</span><select value={version} onChange={e=>setVersion(e.target.value)}>{versionOptions.map(v=><option key={v}>{v}</option>)}</select><button className="theme-toggle" onClick={()=>setDark(!dark)} aria-label="Toggle theme">{dark?"☀":"◐"}</button></div>
  </div></header>

  <main>
   <section className="hero section-wrap reveal in-view">
    <div className="hero-copy"><div className="eyebrow"><span></span>MINECRAFT COMMAND TOOLS</div><h1>All Minecraft<br/><strong>commands.</strong></h1><p>Build, search and generate Java commands in one focused workspace.</p><div className="hero-actions"><button className="primary-action" onClick={()=>switchPage("generator")}>Open Generator <span>↗</span></button><button className="secondary-action" onClick={()=>document.getElementById("commands")?.scrollIntoView({behavior:"smooth"})}>Browse Commands</button></div><div className="hero-note"><span>01</span><div><b>Offline & fast</b><small>No account. No backend. Just useful tools.</small></div></div></div>
    <div className="hero-art" aria-hidden="true" onMouseMove={e=>{const r=e.currentTarget.getBoundingClientRect();const x=e.clientX-r.left-r.width/2;const y=e.clientY-r.top-r.height/2;e.currentTarget.style.setProperty("--px",`${x/18}px`);e.currentTarget.style.setProperty("--py",`${y/18}px`);}} onMouseLeave={e=>{e.currentTarget.style.setProperty("--px","0px");e.currentTarget.style.setProperty("--py","0px")}}><div className="art-grid"></div><div className="art-card"><span>JAVA</span><b>{version==="All versions"?"ALL":version}</b><small>VERSION READY</small></div><div className="art-orbit orbit-a"></div><div className="art-orbit orbit-b"></div><div className="art-block block-a"></div><div className="art-block block-b"></div></div>
   </section>

   {page==="home" ? <section className="page-view home-page">
    <section className="feature-strip section-wrap reveal"><div><small>01</small><b>Offline & Fast</b><span>Runs locally in your browser.</span></div><div><small>02</small><b>Complete Commands</b><span>Searchable Java command reference.</span></div><div><small>03</small><b>Version Support</b><span>Syntax changes follow the selector.</span></div><div><small>04</small><b>Simple & Clean</b><span>Swiss-inspired, distraction-free UI.</span></div></section>
    <section id="commands" className="command-index section-wrap reveal"><div className="section-kicker">COMMAND LIBRARY</div><div className="section-title-row"><div><h2>Every command.<br/><em>One clean reference.</em></h2><p>Search syntax, filter categories and copy exactly what you need.</p></div><span className="count-badge">{allCommands.length} MATCHES</span></div>
     <div className="command-controls"><label className="search-field"><span>⌕</span><input placeholder="Search commands, syntax or description..." value={commandQuery} onChange={e=>setCommandQuery(e.target.value)}/></label><select value={category} onChange={e=>setCategory(e.target.value)}>{categories.map(c=><option key={c}>{c}</option>)}</select></div>
     <div className="command-list">{allCommands.map(c=><article className="command-row" key={c.name}><div className="command-number">/{c.name}</div><div className="command-content"><code>{syntaxFor(c,version)}</code><p>{c.desc}</p></div><div className="command-meta"><span>{version==="All versions"?"ALL":version}</span><button onClick={()=>navigator.clipboard?.writeText(syntaxFor(c,version))}>Copy</button></div></article>)}{!allCommands.length&&<div className="empty">No commands match your search.</div>}</div>
    </section>
    <section className="tools-section section-wrap reveal"><div className="section-kicker">EXPLORE MORE</div><div className="tools-heading"><h2>Powerful tools<br/><em>for every player.</em></h2><div className="tools-grid">{tools.map(t=><button className="tool-tile" key={t.id} onClick={()=>{setTool(t.id);switchPage("generator")}}><span>{t.icon}</span><div><b>{t.name}</b><small>{t.desc}</small></div><i>↗</i></button>)}</div></div></section>
   </section> :
   <section key="generator" className="page-view generator-page section-wrap reveal in-view"><div className="generator-shell"><div className="section-kicker">COMMAND GENERATOR</div><div className="generator-title"><div><h2>Generate any<br/><em>Minecraft command.</em></h2><p>Describe what you want in normal English and get a command instantly.</p></div><span className="version-chip">{version}</span></div><div className="generator-layout"><div className="generator-left"><div className="natural-input"><span>✦</span><input aria-label="Command request" value={naturalInput} onChange={e=>{setNaturalInput(e.target.value);setGenerated(naturalCommand(e.target.value,version))}} placeholder="e.g. give me 10 diamonds, set time to night..."/></div><div className="example-row"><button onClick={()=>{setNaturalInput("set time to night");setGenerated(naturalCommand("set time to night",version))}}>set time to night</button><button onClick={()=>{setNaturalInput("weather rain");setGenerated(naturalCommand("weather rain",version))}}>weather rain</button><button onClick={()=>{setNaturalInput("tp @p 0 64 0");setGenerated(naturalCommand("tp @p 0 64 0",version))}}>tp @p 0 64 0</button></div><div className="generator-tools"><div className="tool-picker">{tools.slice(1).map(t=><button className={tool===t.id?"tool-chip active":"tool-chip"} key={t.id} onClick={()=>setTool(t.id)}>{t.icon}<span>{t.name.replace(" Generator","")}</span></button>)}</div><div className="form-card">{editor()}</div></div></div><div className="output-card"><div className="output-top"><span><i></i>GENERATED COMMAND</span><small>{version}</small></div><pre>{command}</pre><div className="output-actions"><button className={copied?"copy-btn copied":"copy-btn"} onClick={copy}>{copied?"Copied ✓":"Copy command"}</button><button className="save-btn" onClick={save}>＋ Save</button></div><div className="output-note">{copyError?"Clipboard access failed.":"Live preview updates as you type."}</div></div><div className="saved-panel"><div className="saved-header"><b>Saved commands</b><span>{saved.length}/20</span></div>{saved.length?<div className="saved-list">{saved.map(item=><div className="saved-item" key={item}><code>{item}</code><button onClick={()=>navigator.clipboard?.writeText(item)}>Copy</button><button onClick={()=>removeSaved(item)}>Remove</button></div>)}</div>:<p>No saved commands yet.</p>}</div></div></div></section>}
  </main>
  <footer className="site-footer"><div><b>Voxel<span>Tools</span></b><span> • Minecraft Java command utilities</span></div><div>Build better commands.</div></footer>
 </div>
}

export default App;
