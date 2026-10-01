import {useEffect,useMemo,useRef,useState} from "react";
import type {CSSProperties} from "react";
import {minecraftCommands} from "./data/commands";
import {versionOptions} from "./data/versions";
import {isCommandAvailable,syntaxFor} from "./engine/versionResolver";
import {naturalCommand} from "./engine/commandGenerator";
import GlobalSearch from "./components/GlobalSearch";
import AICommandAgent from "./components/AICommandAgent";
import VersionSelector from "./components/VersionSelector";
import LanguageToggle from "./components/LanguageToggle";
import {LangProvider,useLang} from "./components/LangContext";
import type {Lang} from "./i18n";

type Page="home"|"agent";
type Theme="light"|"dark";
type Tool={id:string;icon:string;seed:string};

const tools:Tool[]=[
 {id:"command",icon:"⌘",seed:"set time to night"},
 {id:"give",icon:"＋",seed:"give me 3 golden apple"},
 {id:"summon",icon:"✦",seed:"summon iron_golem"},
 {id:"enchant",icon:"◇",seed:"enchant @p sharpness 4"},
 {id:"effect",icon:"◌",seed:"effect @p speed 30 1"},
 {id:"fill",icon:"▦",seed:"fill 0 60 0 10 64 10 stone"},
 {id:"teleport",icon:"↗",seed:"tp @p 100 64 200"}
];

function safeRead(key:string,fallback:string){try{return localStorage.getItem(key)||fallback}catch{return fallback}}
function getInitialTheme():Theme{
 const stored=safeRead("voxeltools-theme","light");
 return stored==="dark"||stored==="light"?stored:"light";
}
function getInitialLang():Lang{return safeRead("voxeltools-lang","en")==="fa"?"fa":"en"}
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
 const [lang,setLang]=useState<Lang>(getInitialLang);
 useEffect(()=>{
   document.documentElement.lang=lang==="fa"?"fa":"en";
   document.documentElement.dir=lang==="fa"?"rtl":"ltr";
   try{localStorage.setItem("voxeltools-lang",lang)}catch{}
 },[lang]);
 return <LangProvider lang={lang}><AppShell lang={lang} onToggleLang={()=>setLang(l=>l==="en"?"fa":"en")}/></LangProvider>;
}

function AppShell({lang,onToggleLang}:{lang:Lang;onToggleLang:()=>void}){
 const {t}=useLang();
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

 const num=(n:number)=>lang==="fa"?String(n).replace(/\d/g,d=>"۰۱۲۳۴۵۶۷۸۹"[Number(d)]):String(n);
 const versionLabel=version==="All versions"?t("hero.allReleases"):(lang==="fa"?"جاوا ":"Java ")+version;
 const versionBadge=version==="All versions"?t("hero.allReleases"):(lang==="fa"?"جاوا ":"JAVA ")+version;
 const nextTheme=t("theme."+(theme==="light"?"toDark":"toLight"));

 const switchPage=(next:Page)=>{setPage(next);window.scrollTo({top:0,behavior:"smooth"})};
 const openCommands=()=>{switchPage("home");window.setTimeout(()=>document.getElementById("commands")?.scrollIntoView({behavior:"smooth",block:"start"}),120)};
 const openAgent=(seed?:string)=>{if(seed!==undefined)setAgentSeed(seed);switchPage("agent")};
 const copyText=async(value:string,key:string)=>{
   try{if(!navigator.clipboard)throw new Error("Clipboard unavailable");await navigator.clipboard.writeText(value);setCopied(key);setCopyError(false);window.setTimeout(()=>setCopied(""),1500)}
   catch{setCopyError(true);setCopied("");window.setTimeout(()=>setCopyError(false),1600)}
 };
 const saveCommand=(value:string)=>{const next=[...new Set([value,...saved])].slice(0,20);setSaved(next);localStorage.setItem("voxeltools-saved",JSON.stringify(next));};
 const removeSaved=(item:string)=>{const next=saved.filter(x=>x!==item);setSaved(next);localStorage.setItem("voxeltools-saved",JSON.stringify(next));};

 return <div className={`app theme-${theme}${lang==="fa"?" lang-fa":""}`} data-theme={theme}>
   <div className="ambient ambient-one"></div><div className="ambient ambient-two"></div>
   <header className="site-header">
     <div className="scroll-progress"><span style={{width:`${Math.min(100,Math.max(0,scrollProgress))}%`}}/></div>
     <div className="header-inner">
       <button className="mobile-menu" onClick={()=>document.querySelector(".main-nav")?.classList.toggle("open")} aria-label="Open navigation">☰</button>
       <button className="brand" onClick={()=>switchPage("home")} aria-label="VoxelTools home"><span className="brand-mark">V</span><span className="brand-word">Voxel<span>Tools</span></span></button>
       <GlobalSearch ref={searchRef} value={query} onChange={value=>{setQuery(value);setCommandQuery(value)}} onEnter={openCommands}/>
       <nav className="main-nav" aria-label="Primary navigation">
         <button className={page==="home"?"nav active":"nav"} onClick={()=>switchPage("home")}>{t("nav.home")}</button>
         <button className={page==="agent"?"nav active":"nav"} onClick={()=>switchPage("agent")}>{t("nav.agent")}</button>
         <button className="nav" onClick={openCommands}>{t("nav.commands")}</button>
       </nav>
       <div className="header-actions">
         <VersionSelector value={version} options={versionOptions} onChange={setVersion}/>
         <LanguageToggle lang={lang} onToggle={onToggleLang}/>
         <button className="theme-toggle" onClick={()=>setTheme(theme==="light"?"dark":"light")} aria-label={t("theme.aria",{to:nextTheme})} title={t("theme.title",{to:nextTheme})}><Icon name={theme==="light"?"moon":"sun"}/><span>{nextTheme}</span></button>
       </div>
     </div>
   </header>

   <main onMouseMove={e=>{const r=e.currentTarget.getBoundingClientRect();setMouse({x:((e.clientX-r.left)/r.width)*100,y:((e.clientY-r.top)/r.height)*100})}}>
   {page==="home"?<>
    <section className="hero section-wrap">
      <div className="hero-copy reveal in-view">
        <div className="eyebrow"><span></span>{t("hero.eyebrow")} <b>{t("hero.eyebrowTag")}</b></div>
        <h1>{t("hero.title1")}<br/><em>{t("hero.title2")}</em></h1>
        <p>{t("hero.sub")}</p>
        <div className="hero-actions"><button className="primary-action" onClick={()=>openAgent()}>{t("hero.cta1")} <Icon name="arrow"/></button><button className="secondary-action" onClick={openCommands}>{t("hero.cta2")}</button></div>
        <div className="hero-proof"><span><Icon name="check"/></span><div><b>{t("hero.proof1Title")}</b><small>{t("hero.proof1Sub")}</small></div><i></i><div><b>{t("hero.proof2Title")}</b><small>{versionLabel==="All versions"||version==="All versions"?t("hero.allReleases"):versionLabel} {t("hero.proof2Sub")}</small></div></div>
      </div>
      <div className="hero-visual reveal in-view" style={{"--mx":`${mouse.x}%`,"--my":`${mouse.y}%`} as CSSProperties}>
        <div className="hero-surface"></div><div className="hero-halo"></div><div className="hero-orbit orbit-one"></div><div className="hero-orbit orbit-two"></div><div className="hero-core"></div><div className="hero-core-shine"></div>
        <div className="glass-command"><span>{t("hero.preview")}</span><b dir="ltr">{heroPreview}</b><small>{version==="All versions"?t("hero.multiple"):version}</small></div>
        <div className="glass-status"><span></span><div><b>{t("hero.ready")}</b><small>{t("hero.generated")}</small></div></div>
        <div className="hero-grid"></div>
      </div>
    </section>

    <section className="stats-strip section-wrap reveal">
      <div><span>01</span><b>{t("stats.01")}</b><small>{t("stats.01Sub")}</small></div>
      <div><span>02</span><b>{t("stats.02")}</b><small>{t("stats.02Sub")}</small></div>
      <div><span>03</span><b>{t("stats.03")}</b><small>{t("stats.03Sub")}</small></div>
      <div><span>04</span><b>{t("stats.04")}</b><small>{t("stats.04Sub")}</small></div>
    </section>

    <section id="commands" className="library section-wrap reveal">
      <div className="section-head"><div><span className="section-eyebrow">{t("library.eyebrow")}</span><h2>{t("library.title1")}<br/><em>{t("library.title2")}</em></h2><p>{t("library.sub")}</p></div><div className="library-total"><strong>{num(allCommands.length)}</strong><span>{t("library.matches")}</span><small>{version==="All versions"?t("library.allReleases"):version}</small></div></div>
      <div className="library-panel">
        <div className="library-toolbar"><label className="search-field"><Icon name="search"/><input value={commandQuery} onChange={e=>setCommandQuery(e.target.value)} placeholder={t("search.placeholder")} aria-label={t("library.searchAria")}/><kbd>/</kbd></label><select value={category} onChange={e=>setCategory(e.target.value)} aria-label={t("library.categoryAria")}>{categories.map(c=><option key={c}>{c}</option>)}</select></div>
        <div className="library-header"><span>{t("library.thCommand")}</span><span>{t("library.thSyntax")}</span><span>{t("library.thCategory")}</span><span></span></div>
        <div className="command-list">
          {allCommands.slice(0,80).map((c,index)=>{const key=`row-${c.name}`;return <article className="command-row" key={c.name}><div className="command-name"><span dir="ltr">{String(index+1).padStart(2,"0")}</span><b dir="ltr">/{c.name}</b></div><div className="command-syntax"><code dir="ltr">{syntaxFor(c,version)}</code><small>{c.desc}</small></div><div className="command-category"><span>{c.category}</span></div><button className="command-copy" onClick={()=>copyText(syntaxFor(c,version),key)}>{copied===key?<Icon name="check"/>:<Icon name="copy"/>}<span>{copied===key?t("library.copied"):t("library.copy")}</span></button></article>})}
          {!allCommands.length&&<div className="empty-state"><span><Icon name="search"/></span><b>{t("library.empty")}</b><small>{t("library.emptySub")}</small></div>}
        </div>
        {allCommands.length>80&&<div className="library-footer">{t("library.showing",{n:num(80),total:num(allCommands.length)})}</div>}
      </div>
    </section>

    <section className="showcase section-wrap reveal">
      <div className="section-head compact"><div><span className="section-eyebrow">{t("tools.eyebrow")}</span><h2>{t("tools.title1")}<br/><em>{t("tools.title2")}</em></h2></div><p>{t("tools.sub")}</p></div>
      <div className="tool-grid">{tools.map((item,index)=><button className="tool-card" key={item.id} onClick={()=>openAgent(item.seed)}><span className="tool-index" dir="ltr">{String(index+1).padStart(2,"0")}</span><span className="tool-icon">{item.icon}</span><div><b>{t(`tool.${item.id}.name`)}</b><small>{t(`tool.${item.id}.desc`)}</small></div><span className="tool-arrow">↗</span></button>)}</div>
    </section>

    <section className="workflow section-wrap reveal">
      <div className="workflow-art"><div className="workflow-grid"></div><div className="workflow-card card-a"><span>01</span><b>{t("flow.step1")}</b><small>{t("flow.step1Sub")}</small></div><div className="workflow-card card-b"><span>02</span><b>{t("flow.step2")}</b><small>{t("flow.step2Sub")}</small></div><div className="workflow-card card-c"><span>03</span><b>{t("flow.step3")}</b><small>{t("flow.step3Sub")}</small></div><div className="workflow-core"><Icon name="spark"/></div></div>
      <div className="workflow-copy"><span className="section-eyebrow">{t("flow.eyebrow")}</span><h2>{t("flow.title1")}<br/><em>{t("flow.title2")}</em></h2><p>{t("flow.sub")}</p><button className="text-link" onClick={()=>openAgent()}>{t("flow.cta")} <Icon name="arrow"/></button></div>
    </section>

    <section className="cta section-wrap reveal"><div><div><span className="section-eyebrow light">{t("cta.eyebrow")}</span><h2>{t("cta.title1")}<br/><em>{t("cta.title2")}</em></h2></div><button onClick={()=>openAgent()}>{t("cta.button")} <Icon name="arrow"/></button></div></section>
   </>:<section className="generator-page section-wrap">
    <AICommandAgent key={agentSeed} seed={agentSeed} version={version} saved={saved} onCopy={copyText} onSave={saveCommand} onRemoveSaved={removeSaved}/>
   </section>}
   </main>
   <footer className="site-footer"><div><b>Voxel<span>Tools</span></b><span dir={lang==="fa"?"rtl":"ltr"}>{t("footer.tag")}</span></div><div><span>{t("footer.local")}</span><span>{t("footer.focused")}</span></div></footer>
 </div>;
}

export default App;
