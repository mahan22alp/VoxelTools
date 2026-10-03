import {useEffect,useRef,useState} from 'react';
import type {CSSProperties,MouseEvent} from 'react';
import '../eras.css';
import {eraFor,groups} from '../data/eras';
import type {Fx} from '../data/eras';
import type {Lang} from '../i18n';
import {useLang} from './LangContext';

type Props={version:string;mouse:{x:number;y:number};onPick:(version:string)=>void};
type Bi={en:string;fa:string};

function CommandBar({command}:{command:string}){
  const {t}=useLang();
  const [done,setDone]=useState(false);
  const copy=async()=>{try{await navigator.clipboard.writeText(command);setDone(true);window.setTimeout(()=>setDone(false),1400)}catch{/* clipboard unavailable */}};
  return <div className='era-cmd' onClick={e=>e.stopPropagation()}><code dir='ltr'>{command}</code><button onClick={copy}>{done?t('library.copied'):t('library.copy')}</button></div>;
}

// Ambient particles. Every version gets its own count, speed and positions from its seed.
function Particles({kind,n,seed}:{kind:Fx;n:number;seed:number}){
  if(kind==='none')return null;
  return <div className={`fx fx-${kind}`} aria-hidden='true'>{Array.from({length:n},(_,i)=>{
    const r=((i*7919+seed*104729)%1000)/10;
    return <i key={i} style={{left:`${r}%`,'--t':`${(i*37+seed)%90}%`,'--s':`${4+((i*5+seed)%9)}px`,animationDelay:`${-(((i*37+seed)%90)/10)}s`,animationDuration:`${6+((i*13+seed)%70)/10}s`} as CSSProperties}/>;
  })}</div>;
}

// 1.7.10 and 1.8: click blocks to cycle them, the command follows the last block you changed.
const blockSets:Record<string,[string,string][]>={
  blocks:[['grass','#5d9c3a'],['stone','#8b8b8b'],['dirt','#8a5a33'],['planks','#b78a4f'],['diamond_ore','#5fcfd1']],
  prism:[['prismarine','#5aa99a'],['sea_lantern','#cfeee5'],['slime','#7ac75a'],['red_sandstone','#b5582a'],['stained_glass','#7fb3d8']]
};
function Blocks({set}:{set:string}){
  const list=blockSets[set]||blockSets.blocks;
  const [cells,setCells]=useState<number[]>(()=>Array<number>(40).fill(0));
  const [last,setLast]=useState(0);
  const click=(i:number)=>{setCells(c=>c.map((v,k)=>k===i?(v+1)%list.length:v));setLast(i)};
  return <>
    <div className='px-grid'>{cells.map((v,i)=><button key={i} className='px-cell' aria-label={list[v][0]} style={{'--c':list[v][1]} as CSSProperties} onClick={()=>click(i)}/>)}</div>
    <CommandBar command={`/setblock ~${last%8} ~ ~${Math.floor(last/8)} ${list[cells[last]][0]}`}/>
  </>;
}

// 1.9: the attack ring fills over time. Swing when it is full for a critical hit.
function Combat(){
  const [charge,setCharge]=useState(0);
  const [hit,setHit]=useState('none');
  const [n,setN]=useState(0);
  useEffect(()=>{const id=window.setInterval(()=>setCharge(c=>Math.min(100,c+2)),40);return()=>window.clearInterval(id)},[]);
  const swing=()=>{setHit(charge>=100?'crit':'weak');setN(v=>v+1);setCharge(0)};
  const r=44,circ=2*Math.PI*r;
  return <>
    <svg className={charge>=100?'ring full':'ring'} viewBox='0 0 100 100' aria-hidden='true'><circle className='ring-bg' cx='50' cy='50' r={r}/><circle className='ring-fg' cx='50' cy='50' r={r} strokeDasharray={circ} strokeDashoffset={circ*(1-charge/100)}/></svg>
    <button key={n} className={hit==='none'?'blade':`blade ${hit}`} onClick={swing} aria-label='Swing'><i className='blade-edge'/><i className='blade-guard'/><i className='blade-grip'/></button>
    {hit==='crit'&&<b key={`c${n}`} className='crit'>CRIT!</b>}
    <CommandBar command={hit==='crit'?'/give @p diamond_sword 1 0 {ench:[{id:16,lvl:5}]}':'/give @p minecraft:shield'}/>
  </>;
}

// 1.10: five clicks freeze the crystal solid.
function Frost(){
  const nid=useRef(0);
  const [bursts,setBursts]=useState<number[]>([]);
  const [freeze,setFreeze]=useState(0);
  const click=()=>{
    const id=nid.current++;
    setBursts(b=>[...b.slice(-3),id]);
    window.setTimeout(()=>setBursts(b=>b.filter(v=>v!==id)),900);
    setFreeze(f=>f>=5?0:f+1);
  };
  return <>
    <button className='crystal' style={{'--f':freeze/5} as CSSProperties} onClick={click} aria-label='Ice crystal'><i/></button>
    {bursts.map(id=><i key={id} className='frost-ring'/>)}
    <CommandBar command={freeze>=5?'/setblock ~ ~1 ~ minecraft:packed_ice':'/give @p minecraft:snowball 16'}/>
  </>;
}

// 1.11: open the shulker box.
function Shulker(){
  const [open,setOpen]=useState(false);
  return <>
    <button className={open?'shulker open':'shulker'} onClick={()=>setOpen(!open)} aria-pressed={open}>
      <span className='sh-body'/><span className='sh-eye'/><span className='sh-lid'/>
      {open&&<><b className='sh-gem g1'/><b className='sh-gem g2'/><b className='sh-gem g3'/></>}
    </button>
    <CommandBar command={open?'/give @p minecraft:diamond 64':'/give @p minecraft:purple_shulker_box'}/>
  </>;
}

// 1.12: pick a dye, the concrete block and command follow.
const dyes:[string,string][]=[['white','#f2f2f2'],['orange','#f07613'],['magenta','#bd44b3'],['light_blue','#3aafd9'],['yellow','#f8c627'],['lime','#70b919'],['pink','#ed8dac'],['gray','#3e4447'],['silver','#8e8e86'],['cyan','#158991'],['purple','#792aac'],['blue','#35399d'],['brown','#724728'],['green','#546d1b'],['red','#a12722'],['black','#141519']];
function Colors(){
  const [i,setI]=useState(3);
  return <>
    <div className='dye-stage' style={{'--c':dyes[i][1]} as CSSProperties}><span className='dye-block'/></div>
    <div className='dye-row'>{dyes.map((d,k)=><button key={d[0]} className={k===i?'dye on':'dye'} aria-label={d[0]} style={{'--c':d[1]} as CSSProperties} onClick={()=>setI(k)}/>)}</div>
    <CommandBar command={`/setblock ~ ~ ~ minecraft:concrete ${i}`}/>
  </>;
}

// 1.13: click the water to release bubbles.
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
    <div className='water' onClick={pop}><i className='wave w1'/><i className='wave w2'/><i className='wave w3'/>{bubbles.map(b=><i key={b.id} className='bubble' style={{left:`${b.x}%`,width:b.s,height:b.s}}/>)}</div>
    <CommandBar command='/effect give @s minecraft:water_breathing 60 0'/>
  </>;
}

// 1.14: ring the bell. The third ring calls a raid.
function Village(){
  const [rings,setRings]=useState(0);
  const [swing,setSwing]=useState(0);
  const ring=()=>{setRings(r=>r>=3?1:r+1);setSwing(s=>s+1)};
  return <>
    <div className='town'><i/><i/><i/><i/></div>
    <button key={swing} className={swing?'bell ring':'bell'} onClick={ring} aria-label='Bell'><i/></button>
    {swing>0&&<i key={`w${swing}`} className='bell-wave'/>}
    <CommandBar command={rings>=3?'/summon minecraft:pillager ~ ~ ~':'/summon minecraft:villager ~ ~ ~'}/>
  </>;
}

// 1.15: fill the honeycomb while a bee flies by.
function Bees(){
  const [on,setOn]=useState<boolean[]>(()=>Array<boolean>(20).fill(false));
  const filled=on.filter(Boolean).length;
  const flip=(i:number)=>setOn(a=>a.map((v,k)=>k===i?!v:v));
  return <>
    <div className='hive'>{on.map((v,i)=><button key={i} className={`hex${v?' on':''}${Math.floor(i/5)%2?' odd':''}`} onClick={()=>flip(i)} aria-label='Honeycomb cell'/>)}</div>
    <i className='bee'/>
    <CommandBar command={filled>=5?'/give @p minecraft:honey_bottle':'/summon minecraft:bee ~ ~ ~'}/>
  </>;
}

// 1.16: light the nether portal.
function Nether(){
  const [lit,setLit]=useState(false);
  return <>
    <button className={lit?'portal lit':'portal'} onClick={()=>setLit(v=>!v)} aria-pressed={lit}><span className='portal-in'/></button>
    {lit&&<div className='embers'>{Array.from({length:10},(_,k)=><i key={k} style={{left:`${8+k*9}%`,animationDelay:`${(k%5)*.4}s`}}/>)}</div>}
    <CommandBar command={lit?'/execute in minecraft:the_nether run tp @s ~ ~ ~':'/give @p minecraft:flint_and_steel'}/>
  </>;
}

// 1.17: grow the amethyst cluster through its four stages.
const geodeIds=['small_amethyst_bud','medium_amethyst_bud','large_amethyst_bud','amethyst_cluster'];
function Geode(){
  const [stage,setStage]=useState(0);
  return <>
    <button className='geode' style={{'--g':stage} as CSSProperties} onClick={()=>setStage(s=>(s+1)%4)} aria-label='Amethyst'><i/><i/><i/><i/><i/></button>
    <CommandBar command={`/setblock ~ ~ ~ minecraft:${geodeIds[stage]}`}/>
  </>;
}

// 1.18: a depth slider from the new world bottom (-64) to the new build limit (320).
function Depth({lang}:{lang:Lang}){
  const min=-64,max=320;
  const [y,setY]=useState(64);
  const p=(v:number)=>`${((max-v)/(max-min))*100}%`;
  const bg=`linear-gradient(to right,var(--accent-soft) ${p(64)},#8d8d97 ${p(64)} ${p(0)},#4b4b57 ${p(0)} ${p(-59)},#1d1d23 ${p(-59)})`;
  const names=lang==='fa'?['سطح و کوه‌ها','سنگ','دیپ‌اسلیت','بدراک']:['Surface & mountains','Stone','Deepslate','Bedrock'];
  const layer=y>64?names[0]:y>=0?names[1]:y>-60?names[2]:names[3];
  return <>
    <div className='depth'>
      <div className='depth-y' dir='ltr'>Y {y}<small>{layer}</small></div>
      <div className='strata' style={{background:bg}}><i className='strata-mark' style={{left:p(y)}}/></div>
      <input type='range' dir='ltr' min={0} max={max-min} step={1} value={max-y} onChange={e=>setY(max-Number(e.target.value))} aria-label='Y level'/>
    </div>
    <CommandBar command={`/tp @s ~ ${y} ~`}/>
  </>;
}

// 1.19: click to make vibrations. Five clicks in a row wake the Warden.
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
    <div className='sculk' onClick={ping}>
      <i className={awake?'sensor awake':'sensor'}/>
      {ripples.map(r=><i key={r.id} className='ripple' style={{left:r.x,top:r.y}}/>)}
      <div className='anger'><u style={{width:`${anger*25}%`}}/></div>
    </div>
    <CommandBar command={awake?'/summon minecraft:warden ~ ~ ~':'/playsound minecraft:block.sculk_sensor.clicking block @a ~ ~ ~'}/>
  </>;
}

// 1.20: brush the sand to uncover a find.
function Cherry(){
  const [p,setP]=useState(0);
  const brush=()=>setP(v=>v>=100?0:Math.min(100,v+25));
  return <>
    <div className='dig' style={{'--p':p} as CSSProperties} onClick={brush}><span className='sand'/></div>
    <div className='dig-bar' style={{'--p':p} as CSSProperties}><u style={{width:`${p}%`}}/></div>
    <CommandBar command={p>=100?'/loot give @p loot minecraft:archaeology/desert_pyramid':'/give @p minecraft:brush'}/>
  </>;
}

// 1.21: open the trial vault.
const rewards:Bi[]=[{en:'Diamond',fa:'الماس'},{en:'Emerald',fa:'زمرد'},{en:'Golden Apple',fa:'سیب طلایی'},{en:'Trial Key',fa:'کلید آزمون'},{en:'Enchanted Book',fa:'کتاب جادویی'}];
function Trials({lang}:{lang:Lang}){
  const [open,setOpen]=useState(false);
  const [n,setN]=useState(0);
  const toggle=()=>{if(!open)setN(v=>(v+1)%rewards.length);setOpen(!open)};
  return <>
    <button className={open?'vault open':'vault'} onClick={toggle} aria-pressed={open}><i/></button>
    {open&&<span className='loot'>{rewards[n][lang]}</span>}
    <CommandBar command={open?'/loot give @p loot minecraft:chests/trial_chambers/reward':'/give @p minecraft:trial_key'}/>
  </>;
}

// 1.21.2: pack items into the bundle.
function Bundle(){
  const [n,setN]=useState(0);
  return <>
    <button className='bundle' onClick={()=>setN(v=>v>=8?0:v+1)} aria-label='Bundle'><i className='bundle-top'/>{Array.from({length:n},(_,k)=><b key={k} className='bundle-item' style={{'--k':k} as CSSProperties}/>)}</button>
    <CommandBar command='/give @p minecraft:bundle'/>
  </>;
}

// 1.21.4: the pale oak watches you. Hover to wake its eyes, click to make it stir.
function Pale(){
  const [stir,setStir]=useState(0);
  return <>
    <div className='pale' onClick={()=>setStir(s=>s+1)}>
      <div className='pale-mist'/>
      <button key={stir} className={stir?'pale-tree stir':'pale-tree'} aria-label='Pale oak'><i className='eye l'/><i className='eye r'/></button>
    </div>
    <CommandBar command={stir%2?'/summon minecraft:creaking ~ ~ ~':'/setblock ~ ~ ~ minecraft:creaking_heart'}/>
  </>;
}

// 1.21.5: click the firefly bush to scatter fireflies.
function Garden(){
  const nid=useRef(0);
  const [flies,setFlies]=useState<{id:number;dx:number;dy:number}[]>([]);
  const burst=()=>{
    const base=nid.current;
    nid.current+=6;
    const made=Array.from({length:6},(_,k)=>({id:base+k,dx:(k%2?1:-1)*(30+k*14),dy:-(40+k*18)}));
    setFlies(f=>[...f.slice(-12),...made]);
    window.setTimeout(()=>setFlies(f=>f.filter(x=>x.id<base||x.id>=base+6)),2200);
  };
  return <>
    <button className='bush' onClick={burst} aria-label='Firefly bush'><i/><i/><i/></button>
    {flies.map(f=><i key={f.id} className='fly' style={{'--dx':`${f.dx}px`,'--dy':`${f.dy}px`} as CSSProperties}/>)}
    <CommandBar command='/setblock ~ ~ ~ minecraft:firefly_bush'/>
  </>;
}

// 1.21.6 to 1.21.8: a friendly ghast floating through the clouds.
function Sky(){
  const [jump,setJump]=useState(0);
  return <>
    <i className='cloud c1'/><i className='cloud c2'/><i className='cloud c3'/>
    <button key={jump} className={jump?'ghast hop':'ghast'} onClick={()=>setJump(j=>j+1)} aria-label='Happy Ghast'><i className='g-eye l'/><i className='g-eye r'/><i className='g-mouth'/></button>
    <CommandBar command='/summon minecraft:happy_ghast ~ ~ ~'/>
  </>;
}

// 1.21.9 and later: click to age the copper through its four stages.
const stages:[string,string][]=[['copper_block','#c8734a'],['exposed_copper','#a98a6b'],['weathered_copper','#5e9f86'],['oxidized_copper','#3f9f8e']];
function Copper(){
  const [s,setS]=useState(0);
  return <>
    <button className='ingot' style={{'--c':stages[s][1]} as CSSProperties} onClick={()=>setS(v=>(v+1)%4)} aria-label={stages[s][0]}><i/><i/><i/></button>
    <CommandBar command={s===3?'/summon minecraft:copper_golem ~ ~ ~':`/setblock ~ ~ ~ minecraft:${stages[s][0]}`}/>
  </>;
}

// 26.x: a neon grid that follows the cursor.
function Next(){
  const [pulse,setPulse]=useState(0);
  return <>
    <div className='neon' onClick={()=>setPulse(p=>p+1)}>
      <div className='neon-grid'>{Array.from({length:40},(_,i)=><i key={i}/>)}</div>
      <b className='neon-title' dir='ltr'>26.x</b>
      {pulse>0&&<i key={pulse} className='neon-ring'/>}
    </div>
    <CommandBar command='/tick query'/>
  </>;
}

// All versions: every group on one board. Click one to switch to its first version.
function Timeline({onPick,lang}:{onPick:(version:string)=>void;lang:Lang}){
  return <div className='timeline'>{groups.map((g,i)=>{
    const first=g.versions[0],last=g.versions[g.versions.length-1];
    return <button key={g.key} className='tl-row' style={{'--c':eraFor(first).accent,'--i':i} as CSSProperties} onClick={()=>onPick(first)}><i className='tl-dot'/><span><b>{g.name[lang]}</b><small dir='ltr'>{first===last?first:`${first} - ${last}`}</small></span></button>;
  })}</div>;
}

function Scene({motif,lang,onPick}:{motif:string;lang:Lang;onPick:(version:string)=>void}){
  switch(motif){
    case 'all':return <Timeline onPick={onPick} lang={lang}/>;
    case 'blocks':case 'prism':return <Blocks set={motif}/>;
    case 'combat':return <Combat/>;
    case 'frost':return <Frost/>;
    case 'shulker':return <Shulker/>;
    case 'colors':return <Colors/>;
    case 'water':return <Aquatic/>;
    case 'village':return <Village/>;
    case 'bees':return <Bees/>;
    case 'portal':return <Nether/>;
    case 'geode':return <Geode/>;
    case 'depth':return <Depth lang={lang}/>;
    case 'sculk':return <Wild/>;
    case 'cherry':return <Cherry/>;
    case 'vault':return <Trials lang={lang}/>;
    case 'bundle':return <Bundle/>;
    case 'pale':return <Pale/>;
    case 'garden':return <Garden/>;
    case 'sky':return <Sky/>;
    case 'copper':return <Copper/>;
    case 'neon':return <Next/>;
    default:return null;
  }
}

export default function VersionHero({version,mouse,onPick}:Props){
  const era=eraFor(version);
  const {lang}=useLang();
  return <div className='hero-visual era-stage reveal in-view' data-motif={era.motif} style={{'--mx':`${mouse.x}%`,'--my':`${mouse.y}%`} as CSSProperties}>
    <div className='era-scene'>
      <Particles kind={era.fx} n={era.fxCount} seed={era.seed}/>
      <div className='era-badge'><i/><b>{era.name[lang]}</b><small dir='ltr'>{era.range}</small></div>
      <Scene motif={era.motif} lang={lang} onPick={onPick}/>
      {era.motif!=='all'&&<p className='era-hint'>{era.hint[lang]}</p>}
    </div>
  </div>;
}
