import {useMemo,useState} from "react";
import {minecraftCommands} from "../data/commands";
import {syntaxFor} from "../engine/versionResolver";
import {naturalCommand} from "../engine/commandGenerator";
import SavedCommands from "./SavedCommands";
import {useLang} from "./LangContext";
import {isFa} from "../i18n";

type Props={seed:string;version:string;saved:string[];onCopy:(value:string,key:string)=>void|Promise<void>;onSave:(command:string)=>void;onRemoveSaved:(command:string)=>void};
type Intent={id:string;label:string;test:RegExp};
type Step={label:string;detail:string};
type Plan={intent:Intent;command:string;steps:Step[];unavailable:boolean;name:string;definition?:typeof minecraftCommands[number]};

const INTENTS:Intent[]=[
 {id:"time",label:"time",test:/\btime\b/},
 {id:"weather",label:"weather",test:/\bweather\b|\brain\b|\bthunder\b|\bstorm\b/},
 {id:"gamemode",label:"gamemode",test:/\bgamemode\b|\bgame mode\b|\bcreative\b|\bsurvival\b|\badventure\b|\bspectator\b/},
 {id:"give",label:"give",test:/\bgive\b|\bget me\b|\bitem\b|\bapple\b|\bsword\b|\bpickaxe\b|\bdiamond\b|\belytra\b|\bemerald\b|\bingot\b/},
 {id:"summon",label:"summon",test:/\bsummon\b|\bspawn\b/},
 {id:"teleport",label:"teleport",test:/\btp\b|\bteleport\b|\bwarp\b/},
 {id:"kill",label:"kill",test:/\bkill\b|\bslay\b/},
 {id:"effect",label:"effect",test:/\beffect\b|\bpotion\b/},
 {id:"enchant",label:"enchant",test:/\benchant\b/},
 {id:"difficulty",label:"difficulty",test:/\bdifficulty\b/},
 {id:"gamerule",label:"gamerule",test:/\bgamerule\b|\bgame rule\b/}
];
const GENERAL:Intent={id:"general",label:"general",test:/./};

const SUGGEST:Record<string,string[]>={
 general:["weather rain","tp @p 100 64 200","give me 3 golden apple"],
 time:["set time to noon","set time to midnight","set time to day"],
 weather:["weather rain","weather thunder","weather clear"],
 gamemode:["gamemode creative","switch to survival","gamemode spectator"],
 give:["give me 3 golden apple","give me a netherite sword","give me 12 diamond"],
 summon:["summon skeleton 0 64 0","summon creeper ~ ~ ~","summon iron_golem"],
 teleport:["tp @p 100 64 200","teleport @p ~ ~10 ~","tp @a 0 80 0"],
 kill:["kill @e[type=creeper]","kill @e[type=item]","kill @p"],
 effect:["effect @p speed 30 1","effect @a night_vision 60 0","effect @a levitation 10 1"],
 enchant:["enchant @p sharpness 4","enchant @p mending 1","enchant @p unbreaking 3"],
 difficulty:["set difficulty hard","set difficulty peaceful","difficulty normal"],
 gamerule:["/gamerule keepInventory true","/gamerule doDaylightCycle false","/gamerule showCoordinates true"]
};

function planRequest(input:string,version:string,label:(k:string,vars?:Record<string,string|number>)=>string,lang:"en"|"fa"):Plan{
 const trimmed=input.trim();
 const s=trimmed.toLowerCase().replace(/[?!.]/g,"").replace(/\s+/g," ");
 const intent=INTENTS.find(i=>i.test.test(s))||GENERAL;
 const command=naturalCommand(trimmed,version);
 const unavailable=command.includes("is not available");
 const fallback=!command.startsWith("/")&&!unavailable;
 const name=unavailable?command.match(/\/([\w-]+) is not available/)?.[1]??"":command.startsWith("/")?command.slice(1).split(/\s+/)[0]:"";
 const definition=name?minecraftCommands.find(c=>c.name===name):undefined;
 const versionLabel=version==="All versions"?label("hero.allReleases"):(isFa(lang)?"جاوا ":"Java ")+version;
 const quoted=(q:string)=>label("agent.planQuoted",{q});
 const steps:Step[]=[
  {label:label("agent.stepParse"),detail:trimmed?quoted(trimmed):label("agent.planEmpty")},
  {label:label("agent.stepIntent"),detail:label("intent."+intent.id)},
  {label:label("agent.stepVersion"),detail:unavailable?label("agent.planBlocked",{name,v:definition?.introduced??"a later release"}):fallback?label("agent.planNoMatch"):label("agent.planValidated",{v:versionLabel})},
  {label:label("agent.stepCompose"),detail:unavailable?label("agent.planComposeBlocked"):command}
 ];
 return {intent,command,steps,unavailable,name,definition};
}

export default function AICommandAgent({seed,version,saved,onCopy,onSave,onRemoveSaved}:Props){
 const {lang,t}=useLang();
 const initial=seed||"set time to night";
 const [input,setInput]=useState(initial);
 const [command,setCommand]=useState(()=>naturalCommand(initial,version));
 const [lastRun,setLastRun]=useState({input:initial,version});
 const [stepIndex,setStepIndex]=useState(4);
 const [running,setRunning]=useState(false);
 const [copied,setCopied]=useState(false);
 const [savedFlash,setFlash]=useState(false);
 const [showExplain,setShowExplain]=useState(false);
 const [refineIndex,setRefineIndex]=useState(0);

 const plan=useMemo(()=>planRequest(input,version,t,lang),[input,version,t,lang]);
 const stale=lastRun.input!==input||lastRun.version!==version;
 const displayed=running?command:stale?plan.command:command;
 const badge=running?"RUNNING":stale?"DRAFT":plan.unavailable?"BLOCKED":"READY";
 const versionLabel=version==="All versions"?t("hero.allReleases"):(isFa(lang)?"جاوا ":"Java ")+version;
 const versionBadge=version==="All versions"?t("hero.allReleases"):(isFa(lang)?"جاوا ":"JAVA ")+version;

 const run=()=>{
  if(running)return;
  setRunning(true);setStepIndex(0);
  plan.steps.forEach((_,i)=>window.setTimeout(()=>setStepIndex(i+1),300*(i+1)));
  window.setTimeout(()=>{setCommand(plan.command);setLastRun({input,version});setStepIndex(plan.steps.length);setRunning(false)},300*plan.steps.length+160);
 };
 const copy=async()=>{await onCopy(displayed,"agent");setCopied(true);window.setTimeout(()=>setCopied(false),1400)};
 const save=()=>{onSave(displayed);setFlash(true);window.setTimeout(()=>setFlash(false),1400)};
 const refine=()=>{
  const options=SUGGEST[plan.intent.id]||SUGGEST.general;
  setInput(options[refineIndex%options.length]);
  setRefineIndex(i=>i+1);
 };

 const statusLine=running?t("agent.executing"):plan.unavailable?`/${plan.name} ${t("agent.blocked")} ${versionLabel}`:stale?t("agent.draftHint"):t("agent.validatedFor",{v:versionLabel});

 return <section aria-label="AI command agent">
  <div className="generator-top">
   <div>
    <span className="section-eyebrow">{t("agent.eyebrow")}</span>
    <h2>{t("agent.title1")}<br/><em>{t("agent.title2")}</em></h2>
    <p>{t("agent.sub")}</p>
   </div>
   <div className="generator-context">
    <span className="context-badge"><i/>{versionBadge}</span>
    <span className="context-badge">{t("agent.badgeOffline")}</span>
   </div>
  </div>
  <div className="generator-workspace">
   <div className="generator-panel">
    <div className="workspace-heading"><div><span>{t("agent.inputLabel")}</span><b>{t("agent.inputHeading")}</b></div><span className="workspace-key">✦</span></div>
    <div className="natural-input">
     <span className="agent-orb">✦</span>
     <input aria-label={t("agent.inputAria")} value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>{if(e.key==="Enter")run()}} placeholder={t("agent.inputPlaceholder")}/>
     <button className="agent-run" onClick={run} disabled={running}>{running?t("agent.running"):t("agent.run")}</button>
    </div>
    <div className="example-row"><span>{t("agent.try")}</span>{SUGGEST.general.map(s=><button key={s} onClick={()=>setInput(s)}>{s}</button>)}</div>
    <div className="agent-plan" aria-label={t("agent.planTitle")}>
     <div className="plan-title"><span>{t("agent.planTitle")}</span><small>{t("intent."+plan.intent.id)}</small></div>
     <ol>{plan.steps.map((step,i)=><li key={step.label} className={i<stepIndex?"done":running&&i===stepIndex?"active":""}><span className="plan-dot"/><div><b>{step.label}</b><small>{step.detail}</small></div></li>)}</ol>
    </div>
   </div>
   <aside className="output-panel">
    <div className="output-header"><div><span>{t("agent.outputLabel")}</span><b>{t("intent."+plan.intent.id)}</b></div><strong>{badge}</strong></div>
    <div className="output-code">{running?<div className="shimmer"><span/><span/></div>:<pre className={stale?"draft":""} dir="ltr">{displayed}</pre>}</div>
    <div className="output-actions">
     <button className="copy-btn" onClick={copy}>{copied?t("agent.copied"):t("agent.copy")}</button>
     <button className="save-btn" onClick={save}>{savedFlash?t("agent.saved"):t("agent.save")}</button>
    </div>
    <div className="output-actions agent-qa">
     <button className={showExplain?"on":""} onClick={()=>setShowExplain(v=>!v)}>{t("agent.explain")}</button>
     <button onClick={refine}>{t("agent.refine")}</button>
    </div>
    <div className="output-state"><span className={"state-dot"+(plan.unavailable?" error":"")}/><span>{statusLine}</span></div>
    {showExplain&&<div className="agent-explain"><b>{t("agent.whyTitle")}</b><p>{t("explain."+plan.intent.id)}</p>{plan.definition&&<code dir="ltr">{syntaxFor(plan.definition,version)}</code>}</div>}
   </aside>
  </div>
  <div className="generator-lower">
   <div className="tip-card"><span>{t("agent.howLabel")}</span><b>{t("agent.howTitle")}</b><small>{t("agent.howBody")}</small></div>
   <SavedCommands items={saved} onRemove={onRemoveSaved} onCopy={item=>onCopy(item,"saved")}/>
  </div>
 </section>;
}
