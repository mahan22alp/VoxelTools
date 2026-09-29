import {useEffect,useMemo,useRef,useState} from "react";
import {minecraftCommands} from "./data/commands";
import {versionOptions} from "./data/versions";
import {isCommandAvailable,syntaxFor} from "./engine/versionResolver";
import {naturalCommand} from "./engine/commandGenerator";
import {generateToolCommand} from "./engine/toolGenerator";
import GlobalSearch from "./components/GlobalSearch";
import SavedCommands from "./components/SavedCommands";
import VersionSelector from "./components/VersionSelector";

type Page="home"|"generator";
type Tool={id:string;name:string;icon:string;desc:string};

const tools:Tool[]=[
 {id:"command",name:"Smart command",icon:"⌘",desc:"Describe a command in plain English."},
 {id:"give",name:"Give builder",icon:"◇",desc:"Build clean /give syntax visually."},
 {id:"summon",name:"Summon builder",icon:"✦",desc:"Configure an entity and its position."},
 {id:"enchant",name:"Enchant builder",icon:"✧",desc:"Generate enchantment commands quickly."},
 {id:"effect",name:"Effect builder",icon:"◈",desc:"Tune duration and amplifier values."},
 {id:"fill",name:"Fill builder",icon:"▦",desc:"Create precise region fill commands."},
 {id:"teleport",name:"Teleport builder",icon:"↗",desc:"Build movement commands with coordinates."}
];

const mobs=["zombie","skeleton","creeper","spider","enderman","warden","iron_golem"];
const items=["diamond_sword","netherite_sword","diamond_pickaxe","netherite_pickaxe","diamond_helmet","netherite_chestplate","elytra","golden_apple"];
const enchants=["sharpness","protection","efficiency","unbreaking","fortune","mending","fire_aspect","looting"];
const effects=["speed","strength","haste","regeneration","resistance","fire_resistance","night_vision","jump_boost"];

function safeRead(key:string,fallback:string){try{return localStorage.getItem(key)||fallback}catch{return fallback}}

function App(){
 const searchRef=useRef<HTMLInputElement|null>(null);
 const [tool,setTool]=useState("command");
 const [page,setPage]=useState<Page>(()=>safeRead("voxeltools-page","home")==="generator"?"generator":"home");
 const [query,setQuery]=useState("");
 const [version,setVersion]=useState(()=>{const stored=safeRead("voxeltools-version","1.21.11");return versionOptions.includes(stored)?stored:"1.21.11"});
 const [commandQuery,setCommandQuery]=useState("");
 const [category,setCategory]=useState("All");
 const [dark,setDark]=useState(()=>safeRead("voxeltools-theme","light")==="dark");
 const [mobile,setMobile]=useState(false);
 const [saved,setSaved]=useState<string[]>(()=>{try{const raw=localStorage.getItem("voxeltools-saved");const parsed=raw?JSON.parse(raw):[];return Array.isArray(parsed)?parsed.filter((x):x is string=>typeof x==="string").slice(0,20):[]}catch{return []}});
 const [copied,setCopied]=useState("");
 const [copyError,setCopyError]=useState(false);
 const [generating,setGenerating]=useState(false);
 const [scrollProgress,setScrollProgress]=useState(0);
 const [form,setForm]=useState<Record<string,string>>({
  player:"@p",item:"diamond_sword",count:"1",mob:"zombie",enchant:"sharpness",level:"4",
  effect:"speed",duration:"30",amplifier:"1",x:"~",y:"~",z:"~",x1:"~",y1:"~",z1:"~",
  x2:"~",y2:"~",z2:"~",block:"stone",components:""
 });
 const [naturalInput,setNaturalInput]=useState("set time to night");
 const [generated,setGenerated]=useState("/time set night");

 useEffect(()=>{localStorage.setItem("voxeltools-theme",dark?"dark":"light")},[dark]);
 useEffect(()=>{localStorage.setItem("voxeltools-version",version)},[version]);
 useEffect(()=>{localStorage.setItem("voxeltools-page",page)},[page]);
 useEffect(()=>{
   setGenerating(true);
   const timer=window.setTimeout(()=>{setGenerated(naturalCommand(naturalInput,version));setGenerating(false)},140);
   return()=>window.clearTimeout(timer);
 },[naturalInput,version]);
 useEffect(()=>{
   const onScroll=()=>{const max=document.documentElement.scrollHeight-window.innerHeight;setScrollProgress(max>0?Math.min(100,Math.max(0,(window.scrollY/max)*100)):0)};
   onScroll();window.addEventListener("scroll",onScroll,{passive:true});return()=>window.removeEventListener("scroll",onScroll);
 },[]);
 useEffect(()=>{
   const onKey=(event:KeyboardEvent)=>{
     if(event.key==="/" && !["INPUT","TEXTAREA","SELECT"].includes((event.target as HTMLElement)?.tagName||"")){event.preventDefault();searchRef.current?.focus()}
     if(event.key==="Escape")setMobile(false);
   };
   window.addEventListener("keydown",onKey);return()=>window.removeEventListener("keydown",onKey);
 },[]);

 const categories=useMemo(()=>["All",...Array.from(new Set(minecraftCommands.map(c=>c.category)))],[ ]);
 const allCommands=useMemo(()=>minecraftCommands.filter(c=>{
   const hay=(c.name+" "+syntaxFor(c,version)+" "+c.desc).toLowerCase();
   return (category==="All"||c.category===category)&&isCommandAvailable(c,version)&&hay.includes(commandQuery.toLowerCase());
 }),[category,commandQuery,version]);

 const set=(key:string,value:string)=>setForm(prev=>({...prev,[key]:value}));
 const command=useMemo(()=>tool==="command"?generated:generateToolCommand(tool,form,version),[tool,form,generated,version]);

 const switchPage=(next:Page)=>{setPage(next);setMobile(false);window.scrollTo({top:0,behavior:"smooth"})};
 const openCommands=()=>{switchPage("home");window.setTimeout(()=>document.getElementById("commands")?.scrollIntoView({behavior:"smooth",block:"start"}),120)};

 const copyText=async(value:string,key:string)=>{
   try{
     if(!navigator.clipboard)throw new Error("Clipboard unavailable");
     await navigator.clipboard.writeText(value);
     setCopied(key);setCopyError(false);
     window.setTimeout(()=>setCopied(""),1500);
   }catch{setCopyError(true);setCopied("");window.setTimeout(()=>setCopyError(false),1700)}
 };
 const save=()=>{const next=[...new Set([command,...saved])].slice(0,20);setSaved(next);localStorage.setItem("voxeltools-saved",JSON.stringify(next));};
 const removeSaved=(item:string)=>{const next=saved.filter(x=>x!==item);setSaved(next);localStorage.setItem("voxeltools-saved",JSON.stringify(next));};

 const field=(label:string,key:string,opts?:string[])=>(
   <label className="field">
     <span>{label}</span>
     {opts?<select value={form[key]||opts[0]} onChange={e=>set(key,e.target.value)}>{opts.map(o=><option key={o}>{o}</option>)}</select>:
     <input value={form[key]||""} onChange={e=>set(key,e.target.value)} />}
   </label>
 );

 const editor=()=>{
   if(tool==="give")return <div className="field-grid">{field("Player","player")}{field("Item","item",items)}{field("Count","count")}<label className="field wide"><span>Components</span><input value={form.components||""} onChange={e=>set("components",e.target.value)} placeholder="optional item components" /></label></div>;
   if(tool==="summon")return <div className="field-grid">{field("Mob","mob",mobs)}{field("X","x")}{field("Y","y")}{field("Z","z")}</div>;
   if(tool==="enchant")return <div className="field-grid">{field("Player","player")}{field("Enchantment","enchant",enchants)}{field("Level","level")}</div>;
   if(tool==="effect")return <div className="field-grid">{field("Player","player")}{field("Effect","effect",effects)}{field("Duration","duration")}{field("Amplifier","amplifier")}</div>;
   if(tool==="fill")return <div className="field-grid">{field("From X","x1")}{field("From Y","y1")}{field("From Z","z1")}{field("To X","x2")}{field("To Y","y2")}{field("To Z","z2")}{field("Block","block")}</div>;
   if(tool==="teleport")return <div className="field-grid">{field("Player","player")}{field("X","x")}{field("Y","y")}{field("Z","z")}</div>;
   return <div className="natural-editor"><span className="input-caption">Describe what you want</span><div className="natural-line"><span>✦</span><input aria-label="Command request" value={naturalInput} onChange={e=>setNaturalInput(e.target.value)} placeholder="Try: set time to night" /><kbd>LIVE</kbd></div><p className="hint">Offline generation • selected version: {version}</p></div>;
 };

 return <div className={dark?"app dark":"app"}>
   <div className="ambient ambient-one"></div><div className="ambient ambient-two"></div>
   <header className="site-header">
     <div className="scroll-progress"><span style={{width:`${scrollProgress}%`}} /></div>
     <div className="header-inner">
       <button className="mobile-menu" onClick={()=>setMobile(true)} aria-label="Open navigation">☰</button>
       <button className="brand" onClick={()=>switchPage("home")} aria-label="VoxelTools home"><span className="brand-mark">V</span><span className="brand-word">Voxel<span>Tools</span></span></button>
       <GlobalSearch value={query} onChange={value=>{setQuery(value);setCommandQuery(value)}} onEnter={openCommands} />
       <input ref={searchRef} className="sr-search-ref" aria-hidden="true" tabIndex={-1} />
       <nav className={mobile?"main-nav open":"main-nav"} aria-label="Primary navigation">
         <button className={page==="home"?"nav active":"nav"} onClick={()=>switchPage("home")}>Home</button>
         <button className={page==="generator"?"nav active":"nav"} onClick={()=>switchPage("generator")}>Generator</button>
         <button className="nav" onClick={openCommands}>Commands</button>
         <button className="nav close-nav" onClick={()=>setMobile(false)}>Close</button>
       </nav>
       <div className="header-actions">
         <span className="shortcut">Press /</span>
         <VersionSelector value={version} options={versionOptions} onChange={setVersion} />
         <button className="theme-toggle" onClick={()=>setDark(value=>!value)} aria-label="Toggle theme">{dark?"☀":"◐"}</button>
       </div>
     </div>
   </header>

   <main>
    {page==="home"?<>
      <section className="hero section-wrap">
        <div className="hero-copy">
          <div className="eyebrow"><span className="eyebrow-dot"></span> MINECRAFT JAVA WORKSPACE <i>LOCAL-FIRST</i></div>
          <h1>Build commands<br/><span>without the clutter.</span></h1>
          <p>Search exact syntax, generate commands visually, and keep your favorites close. A calmer command workspace designed for speed.</p>
          <div className="hero-actions">
            <button className="primary-action" onClick={()=>switchPage("generator")}>Open generator <span>↗</span></button>
            <button className="secondary-action" onClick={openCommands}>Browse library</button>
          </div>
          <div className="hero-trust"><span className="trust-icon">✓</span><div><b>No account required</b><small>Everything stays in your browser.</small></div><span className="trust-divider"></span><div><b>Version aware</b><small>{version==="All versions"?"All releases":version} selected.</small></div></div>
        </div>
        <div className="hero-visual" onMouseMove={e=>{const r=e.currentTarget.getBoundingClientRect();const x=e.clientX-r.left-r.width/2;const y=e.clientY-r.top-r.height/2;e.currentTarget.style.setProperty("--mx",`${x/20}px`);e.currentTarget.style.setProperty("--my",`${y/20}px`)}} onMouseLeave={e=>{e.currentTarget.style.setProperty("--mx","0px");e.currentTarget.style.setProperty("--my","0px")}}>
          <div className="visual-glow"></div><div className="orb-shadow"></div><div className="orb"></div><div className="orb-shine"></div>
          <div className="visual-ring ring-a"></div><div className="visual-ring ring-b"></div>
          <div className="floating-card command-float"><small>GENERATED</small><b>{generated}</b><span>{version==="All versions"?"Multiple versions":version}</span></div>
          <div className="floating-card status-float"><span className="live-dot"></span><div><b>Workspace ready</b><small>Local • responsive • fast</small></div></div>
          <div className="visual-grid"></div>
        </div>
      </section>

      <section className="stats-strip section-wrap">
        <div><span>01</span><b>Local-first</b><small>No runtime backend.</small></div>
        <div><span>02</span><b>Version-aware</b><small>Syntax follows your release.</small></div>
        <div><span>03</span><b>Searchable</b><small>Find commands in seconds.</small></div>
        <div><span>04</span><b>Saved</b><small>Keep your go-to commands.</small></div>
      </section>

      <section id="commands" className="library section-wrap reveal">
        <div className="section-head">
          <div><span className="section-eyebrow">01 — COMMAND LIBRARY</span><h2>A cleaner way to<br/><em>find syntax.</em></h2><p>Choose a Minecraft version, search by name or description, and copy the exact syntax you need.</p></div>
          <div className="library-summary"><strong>{allCommands.length}</strong><span>MATCHES</span><small>{version==="All versions"?"All versions":version}</small></div>
        </div>
        <div className="library-panel">
          <div className="library-toolbar">
            <label className="search-field"><span>⌕</span><input value={commandQuery} onChange={e=>setCommandQuery(e.target.value)} placeholder="Search commands, syntax or descriptions" aria-label="Search command library" /><kbd>/</kbd></label>
            <select value={category} onChange={e=>setCategory(e.target.value)} aria-label="Command category">{categories.map(c=><option key={c}>{c}</option>)}</select>
          </div>
          <div className="library-header"><span>COMMAND</span><span>SYNTAX</span><span>CATEGORY</span><span>ACTION</span></div>
          <div className="command-list">
            {allCommands.slice(0,80).map((c,index)=>{
              const rowKey=`row-${c.name}`;
              return <article className="command-row" key={c.name}>
                <div className="command-name"><span>{String(index+1).padStart(2,"0")}</span><b>/{c.name}</b></div>
                <div className="command-syntax"><code>{syntaxFor(c,version)}</code><small>{c.desc}</small></div>
                <div className="command-category"><span>{c.category}</span></div>
                <div className="command-action"><button onClick={()=>copyText(syntaxFor(c,version),rowKey)}>{copied===rowKey?"Copied":"Copy"}</button></div>
              </article>
            })}
            {!allCommands.length&&<div className="empty-state"><span>⌕</span><b>No matching commands</b><small>Try another search or category.</small></div>}
          </div>
          {allCommands.length>80&&<div className="library-footer">Showing 80 of {allCommands.length} matches. Refine your search for a shorter list.</div>}
        </div>
      </section>

      <section className="tool-suite section-wrap reveal">
        <div className="section-head compact"><div><span className="section-eyebrow">02 — TOOL SUITE</span><h2>Designed around<br/><em>real tasks.</em></h2></div><p>Choose a focused builder when you want more control than a single text prompt.</p></div>
        <div className="tool-grid">
          {tools.map((item,index)=><button className="tool-card" key={item.id} onClick={()=>{setTool(item.id);switchPage("generator")}}><span className="tool-index">{String(index+1).padStart(2,"0")}</span><span className="tool-icon">{item.icon}</span><div><b>{item.name}</b><small>{item.desc}</small></div><i>↗</i></button>)}
        </div>
      </section>

      <section className="process section-wrap reveal">
        <div className="section-head compact"><div><span className="section-eyebrow">03 — THE FLOW</span><h2>From thought to<br/><em>command.</em></h2></div></div>
        <div className="process-grid">
          <div><span>01</span><b>Describe</b><p>Write what you want in plain English or choose a focused builder.</p></div>
          <div><span>02</span><b>Review</b><p>See the live syntax with your selected Minecraft version beside it.</p></div>
          <div><span>03</span><b>Copy & save</b><p>Copy once, save for later, and keep working without leaving the page.</p></div>
        </div>
      </section>

      <section className="cta section-wrap reveal">
        <div><div><span className="section-eyebrow light">READY WHEN YOU ARE</span><h2>Make the next command<br/><em>the easy part.</em></h2></div><button onClick={()=>switchPage("generator")}>Open generator <span>↗</span></button></div>
      </section>
    </>:<>
      <section className="generator-page section-wrap">
        <div className="generator-intro"><div><span className="section-eyebrow">COMMAND GENERATOR</span><h2>Build it. <em>See it.</em> Use it.</h2><p>Live generation, version-aware syntax, and saved commands in a single focused workspace.</p></div><div className="generator-meta"><span className="meta-badge"><i></i> LOCAL</span><VersionSelector value={version} options={versionOptions} onChange={setVersion} /></div></div>
        <div className="generator-workspace">
          <div className="generator-panel">
            <div className="workspace-top"><div><span>REQUEST</span><b>Describe the result you need.</b></div><kbd>⌘K</kbd></div>
            <div className="natural-input"><span>✦</span><input aria-label="Command request" value={naturalInput} onChange={e=>setNaturalInput(e.target.value)} placeholder="e.g. set time to night" /><span className="live-label">LIVE</span></div>
            <div className="example-row"><span>Try:</span><button onClick={()=>setNaturalInput("set time to night")}>set time to night</button><button onClick={()=>setNaturalInput("weather rain")}>weather rain</button><button onClick={()=>setNaturalInput("tp @p 0 64 0")}>tp @p 0 64 0</button></div>
            <div className="builder-zone"><div className="builder-tabs"><span>FOCUSED BUILDERS</span><div>{tools.slice(1).map(item=><button className={tool===item.id?"tool-chip active":"tool-chip"} key={item.id} onClick={()=>setTool(item.id)}>{item.icon}<span>{item.name.replace(" builder","")}</span></button>)}</div></div><div className="form-card">{editor()}</div></div>
          </div>
          <aside className="output-panel">
            <div className="output-header"><div><span>OUTPUT</span><b>Ready to use</b></div><span className="output-version">{version}</span></div>
            <div className="output-code">{generating?<div className="shimmer"><span></span><span></span></div>:<pre>{command}</pre>}</div>
            <div className="output-actions"><button className="copy-btn" onClick={()=>copyText(command,"generator")}>{copied==="generator"?"Copied ✓":"Copy command"}</button><button className="save-btn" onClick={save}>＋ Save</button></div>
            <div className="output-state"><span className={copyError?"state-dot error":"state-dot"}></span>{copyError?"Clipboard access failed.":copied==="generator"?"Copied to clipboard.":"Live preview • no network request"}</div>
          </aside>
        </div>
        <div className="generator-lower"><SavedCommands items={saved} onRemove={removeSaved} onCopy={item=>copyText(item,`saved-${item}`)}/><div className="tip-card"><span>TIP</span><b>Switching versions never loses your input.</b><small>VoxelTools keeps the workspace context while you explore different command syntax.</small></div></div>
      </section>
    </>}
   </main>

   <footer className="site-footer"><div><b>Voxel<span>Tools</span></b><span> • Minecraft Java command workspace</span></div><div><span>Local-first.</span><span> Built for focus.</span></div></footer>
 </div>
}

export default App;
