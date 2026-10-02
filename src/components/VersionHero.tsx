import {useRef,useState} from "react";
import type {CSSProperties,MouseEvent} from "react";
import "../eras.css";
import {eras,eraFor} from "../data/eras";
import type {Lang} from "../i18n";
import {useLang} from "./LangContext";

type Props={version:string;mouse:{x:number;y:number};onPick:(version:string)=>void};
type Bi={en:string;fa:string};

function CommandBar({command}:{command:string}){
  const {t}=useLang();
  const [done,setDone]=useState(false);
  const copy=async()=>{try{await navigator.clipboard.writeText(command);setDone(true);window.setTimeout(()=>setDone(false),1400)}catch{/* clipboard unavailable */}};
  return <div className="era-cmd" onClick={e=>e.stopPropagation()}><code dir="ltr">{command}</code><button onClick={copy}>{done?t("library.copied"):t("library.copy")}</button></div>;
}

// 1.7.10 - 1.12.2: click blocks to cycle them, the command follows the last block you changed.
const blocks:[string,string][]=[["grass","#5d9c3a"],["stone","#8b8b8b"],["dirt","#8a5a33"],["planks","#b78a4f"],["diamond_ore","#5fcfd1"]];
function Classic(){
  const [cells,setCells]=useState<number[]>(()=>Array<number>(40).fill(0));
  const [last,setLast]=useState(0);
  const click=(i:number)=>{setCells(c=>c.map((v,k)=>k===i?(v+1)%blocks.length:v));setLast(i)};
  return <>
    <div className="px-grid">{cells.map((v,i)=><button key={i} className="px-cell" aria-label={blocks[v][0]} style={{"--c":blocks[v][1]} as CSSProperties} onClick={()=>click(i)}/>)}</div>
    <CommandBar command={`/setblock ~${last%8} ~ ~${Math.floor(last/8)} ${blocks[cells[last]][0]}`}/>
  </>;
}

// 1.13.2 - 1.15.2: click the water to release bubbles.
function Aquatic(){
  const nid=useRef(0);
  const [bubbles,setBubbles]=useState<{id:number;x:number;s:number}[]>([]);
  const pop=(e:MouseEvent<HTMLDivElement>)=>{
    const r=e.currentTarget.getBoundingClientRect();
    const id=nid.current++;
    setBubbles(b=>[...b.slice(-12),{id,x:((e.clientX-r.left)/r.width)*100,s:10+Math.random()*16}]);
    window.setTimeout(()=>setBubbles(b=>b.filter(v=>v.id!==id)),2500);
  };
  return <>
    <div className="water" onClick={pop}><i className="wave w1"/><i className="wave w2"/><i className="wave w3"/>{bubbles.map(b=><i key={b.id} className="bubble" style={{left:`${b.x}%`,width:b.s,height:b.s}}/>)}</div>
    <CommandBar command="/effect give @s minecraft:water_breathing 60 0"/>
  </>;
}

// 1.16.x: light the nether portal.
function Nether(){
  const [lit,setLit]=useState(false);
  return <>
    <button className={lit?"portal lit":"portal"} onClick={()=>setLit(v=>!v)} aria-pressed={lit}><span className="portal-in"/></button>
    {lit&&<div className="embers">{Array.from({length:10},(_,k)=><i key={k} style={{left:`${8+k*9}%`,animationDelay:`${(k%5)*.4}s`}}/>)}</div>}
    <CommandBar command={lit?"/execute in minecraft:the_nether run tp @s ~ ~ ~":"/give @p minecraft:flint_and_steel"}/>
  </>;
}

// 1.17 - 1.18.2: a depth slider. World height is 0-256 in 1.17 and -64 to 320 from 1.18.
function Caves({version,lang}:{version:string;lang:Lang}){
  const old=version.startsWith("1.17");
  const min=old?0:-64,max=old?256:320;
  const [y,setY]=useState(64);
  const yy=Math.min(max,Math.max(min,y));
  const p=(v:number)=>`${((max-v)/(max-min))*100}%`;
  const bg=old
    ?`linear-gradient(to right,var(--accent-soft) ${p(64)},#8d8d97 ${p(64)} ${p(4)},#1d1d23 ${p(4)})`
    :`linear-gradient(to right,var(--accent-soft) ${p(64)},#8d8d97 ${p(64)} ${p(0)},#4b4b57 ${p(0)} ${p(-59)},#1d1d23 ${p(-59)})`;
  const names=lang==="fa"?["سطح و کوه‌ها","سنگ","دیپ‌اسلیت","بدراک"]:["Surface & mountains","Stone","Deepslate","Bedrock"];
  const layer=yy>64?names[0]:yy>=(old?5:0)?names[1]:yy>(old?4:-60)?names[2]:names[3];
  return <>
    <div className="depth">
      <div className="depth-y" dir="ltr">Y {yy}<small>{layer}</small></div>
      <div className="strata" style={{background:bg}}><i className="strata-mark" style={{left:p(yy)}}/></div>
      <input type="range" dir="ltr" min={0} max={max-min} step={1} value={max-yy} onChange={e=>setY(max-Number(e.target.value))} aria-label="Y level"/>
    </div>
    <CommandBar command={`/tp @s ~ ${yy} ~`}/>
  </>;
}

// 1.19 - 1.20.6: click to make vibrations. Five clicks in a row wake the Warden.
function Wild(){
  const nid=useRef(0);
  const [ripples,setRipples]=useState<{id:number;x:number;y:number}[]>([]);
  const [anger,setAnger]=useState(0);
  const ping=(e:MouseEvent<HTMLDivElement>)=>{
    const r=e.currentTarget.getBoundingClientRect();
    const id=nid.current++;
    setRipples(v=>[...v.slice(-5),{id,x:e.clientX-r.left,y:e.clientY-r.top}]);
    window.setTimeout(()=>setRipples(v=>v.filter(i=>i.id!==id)),1400);
    setAnger(a=>a>=4?0:a+1);
  };
  const awake=anger>=4;
  return <>
    <div className="sculk" onClick={ping}>
      <i className={awake?"sensor awake":"sensor"}/>
      {ripples.map(r=><i key={r.id} className="ripple" style={{left:r.x,top:r.y}}/>)}
      <div className="anger"><u style={{width:`${anger*25}%`}}/></div>
    </div>
    <CommandBar command={awake?"/summon minecraft:warden ~ ~ ~":"/playsound minecraft:block.sculk_sensor.clicking block @a ~ ~ ~"}/>
  </>;
}

// 1.21.x: open the trial vault.
const rewards:Bi[]=[{en:"Diamond",fa:"الماس"},{en:"Emerald",fa:"زمرد"},{en:"Golden Apple",fa:"سیب طلایی"},{en:"Trial Key",fa:"کلید آزمون"},{en:"Enchanted Book",fa:"کتاب جادویی"}];
function Trials({lang}:{lang:Lang}){
  const [open,setOpen]=useState(false);
  const [n,setN]=useState(0);
  const toggle=()=>{if(!open)setN(v=>(v+1)%rewards.length);setOpen(!open)};
  return <>
    <button className={open?"vault open":"vault"} onClick={toggle} aria-pressed={open}><i/></button>
    {open&&<span className="loot">{rewards[n][lang]}</span>}
    <CommandBar command={open?"/loot give @p loot minecraft:chests/trial_chambers/reward":"/give @p minecraft:trial_key"}/>
  </>;
}

// 26.x: a neon grid that follows the cursor.
function Next(){
  const [pulse,setPulse]=useState(0);
  return <>
    <div className="neon" onClick={()=>setPulse(p=>p+1)}>
      <div className="neon-grid">{Array.from({length:40},(_,i)=><i key={i}/>)}</div>
      <b className="neon-title" dir="ltr">26.x</b>
      {pulse>0&&<i key={pulse} className="neon-ring"/>}
    </div>
    <CommandBar command="/tick query"/>
  </>;
}

// All versions: a timeline of every group. Click one to switch to its first version.
function Timeline({onPick,lang}:{onPick:(version:string)=>void;lang:Lang}){
  return <div className="timeline">{eras.map((e,i)=><button key={e.id} className="tl-row" style={{"--c":e.accent,"--w":`${((i+1)/eras.length)*100}%`,"--i":i} as CSSProperties} onClick={()=>onPick(e.first)}><i className="tl-dot"/><b>{e.name[lang]}</b><small dir="ltr">{e.range}</small></button>)}</div>;
}

export default function VersionHero({version,mouse,onPick}:Props){
  const era=eraFor(version);
  const {lang}=useLang();
  return <div className="hero-visual era-stage reveal in-view" style={{"--mx":`${mouse.x}%`,"--my":`${mouse.y}%`} as CSSProperties}>
    <div className="era-scene">
      <div className="era-badge"><i/><b>{era.name[lang]}</b><small dir="ltr">{era.range}</small></div>
      {era.id==="all"&&<Timeline onPick={onPick} lang={lang}/>}
      {era.id==="classic"&&<Classic/>}
      {era.id==="aquatic"&&<Aquatic/>}
      {era.id==="nether"&&<Nether/>}
      {era.id==="caves"&&<Caves version={version} lang={lang}/>}
      {era.id==="wild"&&<Wild/>}
      {era.id==="trials"&&<Trials lang={lang}/>}
      {era.id==="next"&&<Next/>}
      {era.id!=="all"&&<p className="era-hint">{era.hint[lang]}</p>}
    </div>
  </div>;
}
