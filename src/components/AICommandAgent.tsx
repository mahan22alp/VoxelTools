import {useMemo,useState} from "react";
import {minecraftCommands} from "../data/commands";
import {syntaxFor} from "../engine/versionResolver";
import {naturalCommand} from "../engine/commandGenerator";
import SavedCommands from "./SavedCommands";

type Props={seed:string;version:string;saved:string[];onCopy:(value:string,key:string)=>void|Promise<void>;onSave:(command:string)=>void;onRemoveSaved:(command:string)=>void};
type Intent={id:string;label:string;test:RegExp};
type Step={label:string;detail:string};
type Plan={intent:Intent;command:string;steps:Step[];unavailable:boolean;name:string;definition?:typeof minecraftCommands[number]};

const INTENTS:Intent[]=[
 {id:"time",label:"World time",test:/\btime\b/},
 {id:"weather",label:"Weather",test:/\bweather\b|\brain\b|\bthunder\b|\bstorm\b/},
 {id:"gamemode",label:"Game mode",test:/\bgamemode\b|\bgame mode\b|\bcreative\b|\bsurvival\b|\badventure\b|\bspectator\b/},
 {id:"give",label:"Item grant",test:/\bgive\b|\bget me\b|\bitem\b|\bapple\b|\bsword\b|\bpickaxe\b|\bdiamond\b|\belytra\b|\bemerald\b|\bingot\b/},
 {id:"summon",label:"Entity summon",test:/\bsummon\b|\bspawn\b/},
 {id:"teleport",label:"Teleport",test:/\btp\b|\bteleport\b|\bwarp\b/},
 {id:"kill",label:"Entity removal",test:/\bkill\b|\bslay\b/},
 {id:"effect",label:"Status effect",test:/\beffect\b|\bpotion\b/},
 {id:"enchant",label:"Enchantment",test:/\benchant\b/},
 {id:"difficulty",label:"Difficulty",test:/\bdifficulty\b/},
 {id:"gamerule",label:"Game rule",test:/\bgamerule\b|\bgame rule\b/}
];
const GENERAL:Intent={id:"general",label:"Direct command",test:/./};

const EXPLAIN:Record<string,string>={
 general:"Raw requests pass through the local engine unchanged after a version check.",
 time:"Maps day-phase words to clock ticks: day 1000, noon 6000, night 13000, midnight 18000.",
 weather:"Toggles rain and thunder for the whole world; clear resets both.",
 gamemode:"Switches a target between survival, creative, adventure and spectator.",
 give:"Resolves item aliases and counts into a /give with a target selector.",
 summon:"Places an entity at the given coordinates, defaulting to the executor position.",
 teleport:"Moves entities to coordinates or another destination entity.",
 kill:"Removes matching entities; scope it with a type selector to stay safe.",
 effect:"Grants a status effect with a duration in seconds and an amplifier level.",
 enchant:"Applies an enchantment to the item held by the target.",
 difficulty:"Sets the world difficulty for every connected player.",
 gamerule:"Reads or writes world rules such as keepInventory."
};

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

function planRequest(input:string,version:string):Plan{
 const trimmed=input.trim();
 const s=trimmed.toLowerCase().replace(/[?!.]/g,"").replace(/\s+/g," ");
 const intent=INTENTS.find(i=>i.test.test(s))||GENERAL;
 const command=naturalCommand(trimmed,version);
 const unavailable=command.includes("is not available");
 const fallback=!command.startsWith("/")&&!unavailable;
 const name=unavailable?command.match(/\/([\w-]+) is not available/)?.[1]??"":command.startsWith("/")?command.slice(1).split(/\s+/)[0]:"";
 const definition=name?minecraftCommands.find(c=>c.name===name):undefined;
 const versionLabel=version==="All versions"?"all releases":"Java "+version;
 const steps:Step[]=[
  {label:"Parse request",detail:trimmed?`"${trimmed}"`:"empty input"},
  {label:"Resolve intent",detail:intent.label},
  {label:"Apply version rules",detail:unavailable?`/${name} arrived in ${definition?.introduced??"a later release"} — select it or newer`:fallback?"no intent matched — showing engine hint":`validated against ${versionLabel}`},
  {label:"Compose syntax",detail:unavailable?"blocked — adjust the version selector":command}
 ];
 return {intent,command,steps,unavailable,name,definition};
}

export default function AICommandAgent({seed,version,saved,onCopy,onSave,onRemoveSaved}:Props){
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

 const plan=useMemo(()=>planRequest(input,version),[input,version]);
 const stale=lastRun.input!==input||lastRun.version!==version;
 const displayed=running?command:stale?plan.command:command;
 const badge=running?"RUNNING":stale?"DRAFT":plan.unavailable?"BLOCKED":"READY";
 const versionLabel=version==="All versions"?"all releases":"Java "+version;

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

 const statusLine=running?"Executing plan…":plan.unavailable?`/${plan.name} is not available in ${versionLabel}`:stale?"Draft ready — press run to apply":`Validated for ${versionLabel}`;

 return <section aria-label="AI command agent">
  <div className="generator-top">
   <div>
    <span className="section-eyebrow">AI / COMMAND AGENT</span>
    <h2>Describe the outcome.<br/><em>Get the command.</em></h2>
    <p>The agent parses your request, plans the steps and composes version-aware syntax — entirely offline, right in your browser.</p>
   </div>
   <div className="generator-context">
    <span className="context-badge"><i/>{version==="All versions"?"ALL RELEASES":"JAVA "+version}</span>
    <span className="context-badge">OFFLINE · DETERMINISTIC</span>
   </div>
  </div>
  <div className="generator-workspace">
   <div className="generator-panel">
    <div className="workspace-heading"><div><span>AGENT INPUT</span><b>Describe the outcome you want</b></div><span className="workspace-key">✦</span></div>
    <div className="natural-input">
     <span className="agent-orb">✦</span>
     <input aria-label="Agent request" value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>{if(e.key==="Enter")run()}} placeholder="Describe your command..."/>
     <button className="agent-run" onClick={run} disabled={running}>{running?"···":"Run"}</button>
    </div>
    <div className="example-row"><span>TRY</span>{SUGGEST.general.map(s=><button key={s} onClick={()=>setInput(s)}>{s}</button>)}</div>
    <div className="agent-plan" aria-label="Execution plan">
     <div className="plan-title"><span>EXECUTION PLAN</span><small>{plan.intent.label}</small></div>
     <ol>{plan.steps.map((step,i)=><li key={step.label} className={i<stepIndex?"done":running&&i===stepIndex?"active":""}><span className="plan-dot"/><div><b>{step.label}</b><small>{step.detail}</small></div></li>)}</ol>
    </div>
   </div>
   <aside className="output-panel">
    <div className="output-header"><div><span>AGENT OUTPUT</span><b>{plan.intent.label}</b></div><strong>{badge}</strong></div>
    <div className="output-code">{running?<div className="shimmer"><span/><span/></div>:<pre className={stale?"draft":""}>{displayed}</pre>}</div>
    <div className="output-actions">
     <button className="copy-btn" onClick={copy}>{copied?"Copied ✓":"Copy"}</button>
     <button className="save-btn" onClick={save}>{savedFlash?"Saved ✓":"Save"}</button>
    </div>
    <div className="output-actions agent-qa">
     <button className={showExplain?"on":""} onClick={()=>setShowExplain(v=>!v)}>Explain</button>
     <button onClick={refine}>Refine</button>
    </div>
    <div className="output-state"><span className={"state-dot"+(plan.unavailable?" error":"")}/><span>{statusLine}</span></div>
    {showExplain&&<div className="agent-explain"><b>Why this command?</b><p>{EXPLAIN[plan.intent.id]||EXPLAIN.general}</p>{plan.definition&&<code>{syntaxFor(plan.definition,version)}</code>}</div>}
   </aside>
  </div>
  <div className="generator-lower">
   <div className="tip-card"><span>HOW IT WORKS</span><b>Deterministic, offline agent</b><small>Requests are parsed, matched to an intent, checked against your selected release and composed into syntax — all locally. Nothing leaves the browser, so the same request always yields the same command.</small></div>
   <SavedCommands items={saved} onRemove={onRemoveSaved} onCopy={item=>onCopy(item,"saved")}/>
  </div>
 </section>;
}
