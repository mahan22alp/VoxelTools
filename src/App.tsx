import {useEffect,useMemo,useRef,useState} from "react";
import type {CSSProperties} from "react";
import {minecraftCommands} from "./data/commands";
import {versionOptions} from "./data/versions";
import {isCommandAvailable,syntaxFor} from "./engine/versionResolver";
import {naturalCommand} from "./engine/commandGenerator";
import GlobalSearch from "./components/GlobalSearch";
import AICommandAgent from "./components/AICommandAgent";
import VersionSelector from "./components/VersionSelector";

type Page="home"|"agent";

type Theme="light"|"dark";
type Tool={id:string;name:string;icon:string;desc:string;seed:string};

const tools:Tool[]=[
 {id:"command",name:"Smart command",icon:"⌘",desc:"Describe the result you need and get syntax instantly.",seed:"set time to night"},
 {id:"give",name:"Give builder",icon:"＋",desc:"Build a clean item command with guided fields.",seed:"give me 3 golden apple"},
 {id:"summon",name:"Summon builder",icon:"✦",desc:"Configure an entity and its position.",seed:"summon iron_golem"},
 {id:"enchant",name:"Enchant builder",icon:"◇",desc:"Tune an enchantment with clear controls.",seed:"enchant @p sharpness 4"},
 {id:"effect",name:"Effect builder",icon:"◌",desc:"Set effect, duration, and amplifier values.",seed:"effect @p speed 30 1"},
 {id:"fill",name:"Fill builder",icon:"▦",desc:"Create precise region fill commands.",seed:"fill 0 60 0 10 64 10 stone"},
 {id:"teleport",name:"Teleport builder",icon:"↗",desc:"Build coordinate-based movement commands.",seed:"tp @p 100 64 200"}
];

function safeRead(key:string,fallback:string){try{return localStorage.getItem(key)||fallback}catch{return fallback}}
function getInitialTheme():Theme{
 const stored=safeRead("voxeltools-theme","light");
 return stored==="dark"||stored==="light"?stored:"light";
}
function Icon({name}:{name:"search"|"arrow"|"copy"|"check"|"spark"|"grid"|"clock"|"bookmark"|"sun"|"moon"}) {
 const paths:Record<string,string>={
  search:"M11 4a7 7 0 1 0 0 14 7 7 0 0 0 0-14Zm5.2 12.2L21 21",
  arrow:"M5 12h13M13 6l6 6-6 6",
  copy:"M9 9h10v10H9z M5 5h10v4",
  check:"m5 12 4 4L19 6",
  spark:"m12 2 1.7 6.3L20 10l-6.3 1.7L12 18l-1.7-6.3L4 10l6.3-1.7L12 2Z",
  grid:"M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h6v6h-6z",
  clock:"M12 7v5l3 2M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z",
  bookmark:"M6 4h12v17l-6-3-6 3V4Z",
  sun:"M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6l1.4 1.4M17 17l1.4 1.4M18.4 5.6 17 7M7 17l-1.4 1.4M16 12a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z",
  moon:"M20 15.2A8.5 8.5 0 0 1 8.8 4a8.5 8.5 0 1 0 11.2 11.2Z"
 };
 return <svg viewBox="0 0 24 24" aria-hidden="true" className="icon"><path d={paths[name]} fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/></svg>;
}

function App(){
 const searchRef=useRef<HTMLInputElement|null>(null);
 const [page,setPage]=useState<Page>(()=>safeRead("voxeltools-page","home")==="agent"?"agent":"home");
 const [theme,setTheme]=useState<Theme>(getInitialTheme);
 const [query,setQuery]=useState("");
 const [version,setVersion]=useState(()=>{const stored=safeRead("voxeltools-version","1.21.11");return versionOptions.includes(stored)?stored:"1.21.11"});
 const [commandQuery,setCommandQuery]=useState("");
 const [category,setCategory]=useState("All");
 const [saved,setSaved]=useState<string[]>(()=>{try{const parsed=JSON.parse(localStorage.getItem("voxeltools-saved")||"[]");return Array.isArray(parsed)?parsed.filter((x):x is string=>typeof x==="string").slice(0,20):[]}catch{return []}});
 const [copied,setCopied]=useState("");
 const [copyError,setCopyError]=useState(false);
 const [scrollProgress,setScrollProgress]=useState(0);
 const [mouse,setMouse]=useState({x:50,y:40});
 const [agentSeed,setAgentSeed]=useState("");

 useEffect(()=>{localStorage.setItem("voxeltools-page",page)},[page]);
 useEffect(()=>{
   document.documentElement.dataset.theme=theme;
   localStorage.setItem("voxeltools-theme",theme);
 },[theme]);
 useEffect(()=>{localStorage.setItem("voxeltools-version",version)},[version]);
 useEffect(()=>{
   const onScroll=()=>{const max=document.documentElement.scrollHeight-window.innerHeight;setScrollProgress(max>0?(window.scrollY/max)*100:0)};
   onScroll();window.addEventListener("scroll",onScroll,{passive:true});return()=>window.removeEventListener("scroll",onScroll);
 },[]);
 useEffect(()=>{
   const onKey=(event:KeyboardEvent)=>{
     if(event.key==="/"&&["INPUT","TEXTAREA","SELECT"].indexOf((event.target as HTMLElement)?.tagName||"")<0){event.preventDefault();searchRef.current?.focus()}
     if(event.key==="Escape")setQuery("");
   };
   window.addEventListener("keydown",onKey);return()=>window.removeEventListener("keydown",onKey);
 },[]);
 useEffect(()=>{
   const nodes=document.querySelectorAll(".reveal");
   if(!("IntersectionObserver" in window)){nodes.forEach(node=>node.classList.add("in-view"));return}
   const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add("in-view");observer.unobserve(entry.target)}}),{threshold:.1,rootMargin:"0px 0px -50px 0px"});
   nodes.forEach(node=>observer.observe(node));return()=>observer.disconnect();
 },[page]);

 const categories=useMemo(()=>["All",...Array.from(new Set(minecraftCommands.map(c=>c.category)))],[]);
 const allCommands=useMemo(()=>minecraftCommands.filter(c=>{
   const hay=(c.name+" "+syntaxFor(c,version)+" "+c.desc).toLowerCase();
   return (category==="All"||c.category===category)&&isCommandAvailable(c,version)&&hay.includes(commandQuery.trim().toLowerCase());
 }),[category,commandQuery,version]);
 const heroPreview=useMemo(()=>naturalCommand(query.trim()===""?"set time to night":query,version),[query,version]);

 const switchPage=(next:Page)=>{setPage(next);window.scrollTo({top:0,behavior:"smooth"})};
 const openCommands=()=>{switchPage("home");window.setTimeout(()=>document.getElementById("commands")?.scrollIntoView({behavior:"smooth",block:"start"}),120)};
 const openAgent=(seed?:string)=>{if(seed!==undefined)setAgentSeed(seed);switchPage("agent")};
 const copyText=async(value:string,key:string)=>{
   try{if(!navigator.clipboard)throw new Error("Clipboard unavailable");await navigator.clipboard.writeText(value);setCopied(key);setCopyError(false);window.setTimeout(()=>setCopied(""),1500)}
   catch{setCopyError(true);setCopied("");window.setTimeout(()=>setCopyError(false),1600)}
 };
 const saveCommand=(value:string)=>{const next=[...new Set([value,...saved])].slice(0,20);setSaved(next);localStorage.setItem("voxeltools-saved",JSON.stringify(next));};
 const removeSaved=(item:string)=>{const next=saved.filter(x=>x!==item);setSaved(next);localStorage.setItem("voxeltools-saved",JSON.stringify(next));};

 return <div className={`app theme-${theme}`} data-theme={theme}>
   <div className="ambient ambient-one"></div><div className="ambient ambient-two"></div>
   <header className="site-header">
     <div className="scroll-progress"><span style={{width:`${Math.min(100,Math.max(0,scrollProgress))}%`}}/></div>
     <div className="header-inner">
       <button className="mobile-menu" onClick={()=>document.querySelector(".main-nav")?.classList.toggle("open")} aria-label="Open navigation">☰</button>
       <button className="brand" onClick={()=>switchPage("home")} aria-label="VoxelTools home"><span className="brand-mark">V</span><span className="brand-word">Voxel<span>Tools</span></span></button>
       <GlobalSearch ref={searchRef} value={query} onChange={value=>{setQuery(value);setCommandQuery(value)}} onEnter={openCommands}/>
       <nav className="main-nav" aria-label="Primary navigation">
         <button className={page==="home"?"nav active":"nav"} onClick={()=>switchPage("home")}>Home</button>
         <button className={page==="agent"?"nav active":"nav"} onClick={()=>switchPage("agent")}>AI Agent</button>
         <button className="nav" onClick={openCommands}>Commands</button>
       </nav>
       <div className="header-actions"><VersionSelector value={version} options={versionOptions} onChange={setVersion}/><button className="theme-toggle" onClick={()=>setTheme(theme==="light"?"dark":"light")} aria-label={`Switch to ${theme==="light"?"dark":"light"} mode`} title={`Switch to ${theme==="light"?"dark":"light"} mode`}><Icon name={theme==="light"?"moon":"sun"}/><span>{theme==="light"?"Dark":"Light"}</span></button></div>
     </div>
   </header>

   <main onMouseMove={e=>{const r=e.currentTarget.getBoundingClientRect();setMouse({x:((e.clientX-r.left)/r.width)*100,y:((e.clientY-r.top)/r.height)*100})}}>
   {page==="home"?<>
    <section className="hero section-wrap">
      <div className="hero-copy reveal in-view">
        <div className="eyebrow"><span></span>MINECRAFT JAVA COMMAND WORKSPACE <b>LOCAL-FIRST</b></div>
        <h1>Less searching.<br/><em>More building.</em></h1>
        <p>VoxelTools is a calm, version-aware command workspace for Minecraft Java. Describe what you need, let the agent compose it, and copy with confidence.</p>
        <div className="hero-actions"><button className="primary-action" onClick={()=>openAgent()}>Open AI agent <Icon name="arrow"/></button><button className="secondary-action" onClick={openCommands}>Browse library</button></div>
        <div className="hero-proof"><span><Icon name="check"/></span><div><b>Fast & local</b><small>No account. No backend dependency.</small></div><i></i><div><b>Version-aware</b><small>{version==="All versions"?"All releases":version} in context.</small></div></div>
      </div>
      <div className="hero-visual reveal in-view" style={{"--mx":`${mouse.x}%`,"--my":`${mouse.y}%`} as CSSProperties}>
        <div className="hero-surface"></div><div className="hero-halo"></div><div className="hero-orbit orbit-one"></div><div className="hero-orbit orbit-two"></div><div className="hero-core"></div><div className="hero-core-shine"></div>
        <div className="glass-command"><span>LIVE PREVIEW</span><b>{heroPreview}</b><small>{version==="All versions"?"Multiple releases":version}</small></div>
        <div className="glass-status"><span></span><div><b>Ready to use</b><small>Generated locally</small></div></div>
        <div className="hero-grid"></div>
      </div>
    </section>

    <section className="stats-strip section-wrap reveal">
      <div><span>01</span><b>Local-first</b><small>Your commands stay in the browser.</small></div>
      <div><span>02</span><b>Version-aware</b><small>Syntax adapts to your selected release.</small></div>
      <div><span>03</span><b>Searchable</b><small>Find by command, syntax, or description.</small></div>
      <div><span>04</span><b>Saved</b><small>Keep up to 20 favorites close at hand.</small></div>
    </section>

    <section id="commands" className="library section-wrap reveal">
      <div className="section-head"><div><span className="section-eyebrow">01 / LIBRARY</span><h2>The command library<br/><em>without the noise.</em></h2><p>One surface for names, syntax, category and quick copy. Your selected Minecraft version stays visible while you browse.</p></div><div className="library-total"><strong>{allCommands.length}</strong><span>MATCHES</span><small>{version==="All versions"?"ALL RELEASES":version}</small></div></div>
      <div className="library-panel">
        <div className="library-toolbar"><label className="search-field"><Icon name="search"/><input value={commandQuery} onChange={e=>setCommandQuery(e.target.value)} placeholder="Search commands..." aria-label="Search command library"/><kbd>/</kbd></label><select value={category} onChange={e=>setCategory(e.target.value)} aria-label="Command category">{categories.map(c=><option key={c}>{c}</option>)}</select></div>
        <div className="library-header"><span>COMMAND</span><span>SYNTAX</span><span>CATEGORY</span><span></span></div>
        <div className="command-list">
          {allCommands.slice(0,80).map((c,index)=>{const key=`row-${c.name}`;return <article className="command-row" key={c.name}><div className="command-name"><span>{String(index+1).padStart(2,"0")}</span><b>/{c.name}</b></div><div className="command-syntax"><code>{syntaxFor(c,version)}</code><small>{c.desc}</small></div><div className="command-category"><span>{c.category}</span></div><button className="command-copy" onClick={()=>copyText(syntaxFor(c,version),key)}>{copied===key?<Icon name="check"/>:<Icon name="copy"/>}<span>{copied===key?"Copied":"Copy"}</span></button></article>})}
          {!allCommands.length&&<div className="empty-state"><span><Icon name="search"/></span><b>No commands found</b><small>Try a different search or category.</small></div>}
        </div>
        {allCommands.length>80&&<div className="library-footer">Showing 80 of {allCommands.length} matches.</div>}
      </div>
    </section>

    <section className="showcase section-wrap reveal">
      <div className="section-head compact"><div><span className="section-eyebrow">02 / AGENT LAUNCHPAD</span><h2>Purpose-built for<br/><em>real tasks.</em></h2></div><p>Skip the blank page. Pick a starting point and the AI agent opens pre-filled with a working request.</p></div>
      <div className="tool-grid">{tools.map((item,index)=><button className="tool-card" key={item.id} onClick={()=>openAgent(item.seed)}><span className="tool-index">{String(index+1).padStart(2,"0")}</span><span className="tool-icon">{item.icon}</span><div><b>{item.name}</b><small>{item.desc}</small></div><span className="tool-arrow">↗</span></button>)}</div>
    </section>

    <section className="workflow section-wrap reveal">
      <div className="workflow-art"><div className="workflow-grid"></div><div className="workflow-card card-a"><span>01</span><b>Describe</b><small>Type what you want.</small></div><div className="workflow-card card-b"><span>02</span><b>Plan</b><small>Watch the agent plan it.</small></div><div className="workflow-card card-c"><span>03</span><b>Copy</b><small>Save it for later.</small></div><div className="workflow-core"><Icon name="spark"/></div></div>
      <div className="workflow-copy"><span className="section-eyebrow">03 / THE FLOW</span><h2>A better path from idea<br/><em>to command.</em></h2><p>The agent keeps context close: version, request, plan and output live together so you can move quickly without losing your place.</p><button className="text-link" onClick={()=>openAgent()}>Open the AI agent <Icon name="arrow"/></button></div>
    </section>

    <section className="cta section-wrap reveal"><div><div><span className="section-eyebrow light">READY WHEN YOU ARE</span><h2>Make the next command<br/><em>the easy part.</em></h2></div><button onClick={()=>openAgent()}>Open AI agent <Icon name="arrow"/></button></div></section>
   </>:<section className="generator-page section-wrap">
    <AICommandAgent key={agentSeed} seed={agentSeed} version={version} saved={saved} onCopy={copyText} onSave={saveCommand} onRemoveSaved={removeSaved}/>
   </section>}
   </main>
   <footer className="site-footer"><div><b>Voxel<span>Tools</span></b><span> • Minecraft Java command workspace</span></div><div><span>Local-first.</span><span> Focused.</span></div></footer>
 </div>
}

export default App;
