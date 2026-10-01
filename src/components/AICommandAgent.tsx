import {useEffect,useRef,useState} from "react";
import type {ClipboardEvent,KeyboardEvent} from "react";
import "../agent.css";
import SavedCommands from "./SavedCommands";
import {useLang} from "./LangContext";
import {agentCommands} from "../data/agentCommands";
import {buildKnowledge} from "../data/agentKnowledge";
import {isCommandAvailable,syntaxFor,versionAtLeast} from "../engine/versionResolver";

type Provider="gemini"|"groq"|"openrouter"|"openai"|"anthropic";
type Msg={id:number;role:"user"|"agent";text:string;command?:string;raw?:string};
type Turn={role:"user"|"assistant";content:string};

const providers:Record<Provider,{label:string;url:string;model:string;keyPage:string}>={
  openrouter:{label:"OpenRouter (free models)",url:"https://openrouter.ai/api/v1/chat/completions",model:"openrouter/free",keyPage:"https://openrouter.ai/keys"},
  groq:{label:"Groq (free tier)",url:"https://api.groq.com/openai/v1/chat/completions",model:"llama-3.3-70b-versatile",keyPage:"https://console.groq.com/keys"},
  gemini:{label:"Google Gemini (free tier)",url:"https://generativelanguage.googleapis.com/v1beta/openai/chat/completions",model:"gemini-flash-latest",keyPage:"https://aistudio.google.com/apikey"},
  openai:{label:"OpenAI (paid)",url:"https://api.openai.com/v1/chat/completions",model:"gpt-4o-mini",keyPage:"https://platform.openai.com/api-keys"},
  anthropic:{label:"Anthropic (paid)",url:"https://api.anthropic.com/v1/messages",model:"claude-sonnet-5-5",keyPage:"https://platform.claude.com/settings/keys"}
};
const examples=["set time to night","give me a sharpness 5 diamond sword","teleport me to 0 100 0"];

function read(key:string,fallback:string){try{return localStorage.getItem(key)??fallback}catch{return fallback}}
function write(key:string,value:string){try{localStorage.setItem(key,value)}catch{/* storage unavailable */}}
function readProvider():Provider{const value=read("voxeltools-ai-provider","openrouter");return value in providers?(value as Provider):"openrouter"}
function prefersReducedMotion(){try{return window.matchMedia("(prefers-reduced-motion: reduce)").matches}catch{return false}}

// Every command that exists in the selected version, with its syntax.
function commandReference(version:string){
  const all=version==="All versions";
  return agentCommands.filter(c=>isCommandAvailable(c,version)).map(c=>{
    const notes=[c.introduced&&all?`added ${c.introduced}`:"",c.removed&&all?`removed ${c.removed}`:""].filter(Boolean).join(", ");
    return `${syntaxFor(c,version)}${notes?` [${notes}]`:""}`;
  }).join("\n");
}

function systemPrompt(version:string,lang:"en"|"fa"){
  const all=version==="All versions";
  const target=all?"any Java Edition version (the list shows when commands were added or removed)":version;
  const languageRule=lang==="fa"?"\n\nThe player is chatting in Persian (Farsi). Write your explanation sentences in Persian, but the command itself must stay in English exactly as Minecraft requires.":"";
  return `You are a Minecraft Java Edition command expert. The player's game version is ${target}.\n\nThe list below is the authoritative list of commands that exist in this version, with their top-level syntax. Only use commands from this list. If the request needs a command that is not listed, say it does not exist in this version and suggest the closest listed alternative (for example /item replaced /replaceitem in 1.17, and /execute if replaced /testfor in 1.13).\n\nFor selectors, coordinates, item components vs NBT, enchant levels and version-era differences, follow the KNOWLEDGE section exactly — it reflects this version.\n\nReply with exactly one command inside a fenced code block, then at most two short sentences of explanation. Do not restate the request. If the request is unclear, ask one short question instead. Never invent commands or arguments.${languageRule}\n\nKNOWLEDGE:\n${buildKnowledge(version)}\n\nCOMMANDS:\n${commandReference(version)}`;
}

// Flags replies that drifted from the grounded command list or era syntax.
function groundingNote(command:string|undefined,version:string):string{
  if(!command)return "";
  const name=command.replace(/^\//,"").split(/[\s\[]/)[0].split(":").pop()||"";
  const known=agentCommands.find(c=>c.name===name);
  if(!known)return "";
  const vLabel=version==="All versions"?"that version":version;
  if(!isCommandAvailable(known,version))return `\n\n⚠️ /${name} does not exist in ${vLabel}.`;
  if(version!=="All versions"&&/^(give|item|clear)$/.test(name)&&/\[[^\]]*minecraft:[a-z_]+[=:{]/.test(command)&&!versionAtLeast(version,"1.20.5"))return `\n\n⚠️ Item components need 1.20.5+; in ${vLabel} this item is written with NBT braces {…}.`;
  return "";
}

function parseReply(raw:string,fallback:string):{text:string;command?:string}{
  const reply=raw.replace(/<think>[\s\S]*?<\/think>/g,"").trim();
  const match=reply.match(/```[\w-]*\n?([\s\S]*?)```/);
  if(match)return {text:reply.replace(match[0],"").trim()||fallback,command:match[1].trim()};
  // Some free models skip the code block, so fall back to the first line that starts with a slash.
  const line=reply.split("\n").find(l=>/^\s*\/[a-z_:]+/i.test(l));
  if(line)return {text:reply.replace(line,"").trim()||fallback,command:line.trim()};
  return {text:reply};
}

function toTurns(items:Msg[]):Turn[]{
  const turns=items.filter(m=>m.raw).slice(-10).map((m):Turn=>({role:m.role==="user"?"user":"assistant",content:m.raw as string}));
  const first=turns.findIndex(t=>t.role==="user");
  return first<0?turns:turns.slice(first);
}

async function callAI(provider:Provider,key:string,model:string,system:string,turns:Turn[]):Promise<string>{
  const url=providers[provider].url;
  if(provider==="anthropic"){
    const res=await fetch(url,{
      method:"POST",
      headers:{"content-type":"application/json","x-api-key":key,"anthropic-version":"2023-06-01","anthropic-dangerous-direct-browser-access":"true"},
      body:JSON.stringify({model,max_tokens:500,temperature:0.2,system,messages:turns})
    });
    const data=await res.json();
    if(!res.ok)throw new Error(data?.error?.message||`Request failed (${res.status})`);
    return (data.content as {type:string;text?:string}[]).filter(b=>b.type==="text").map(b=>b.text||"").join("\n");
  }
  // OpenRouter, Groq, Gemini and OpenAI all speak the OpenAI chat-completions format.
  const res=await fetch(url,{
    method:"POST",
    headers:{"content-type":"application/json",authorization:`Bearer ${key}`},
    body:JSON.stringify({model,temperature:0.2,max_tokens:500,messages:[{role:"system",content:system},...turns]})
  });
  const data=await res.json();
  if(!res.ok){
    const detail=Array.isArray(data)?data[0]?.error?.message:data?.error?.message;
    throw new Error(detail||`Request failed (${res.status})`);
  }
  return String(data.choices?.[0]?.message?.content||"");
}

// Reveals text one character at a time while animate is true, then shows it in full.
function Typed({text,animate}:{text:string;animate:boolean}){
  const [count,setCount]=useState(0);
  useEffect(()=>{
    if(!animate)return;
    // Longer texts type proportionally faster so replies always land in about a second.
    const speed=Math.min(18,Math.max(3,Math.round(1600/Math.max(text.length,1))));
    const id=window.setInterval(()=>setCount(v=>{if(v>=text.length){window.clearInterval(id);return v}return v+1}),speed);
    return()=>window.clearInterval(id);
  },[text,animate]);
  if(!animate)return <>{text}</>;
  return <>{text.slice(0,count)}{count<text.length&&<span className="ai-caret"/>}</>;
}

export default function AICommandAgent({version,lang}:{version:string;lang:"en"|"fa"}){
  const {t}=useLang();
  const nextId=useRef(1);
  const endRef=useRef<HTMLDivElement|null>(null);
  const [provider,setProvider]=useState<Provider>(readProvider);
  const [model,setModel]=useState(()=>read("voxeltools-ai-model","")||providers[readProvider()].model);
  const [apiKey,setApiKey]=useState(()=>read("voxeltools-ai-key",""));
  const [keyDraft,setKeyDraft]=useState("");
  const [showSettings,setShowSettings]=useState(()=>!read("voxeltools-ai-key",""));
  const [input,setInput]=useState("");
  const [busy,setBusy]=useState(false);
  const [copied,setCopied]=useState(0);
  const [freshId,setFreshId]=useState(-1);
  const [saved,setSaved]=useState<string[]>(()=>{
    try{const parsed=JSON.parse(read("voxeltools-agent-saved","[]"));return Array.isArray(parsed)?parsed.filter((x):x is string=>typeof x==="string").slice(0,20):[]}
    catch{return []}
  });
  const [messages,setMessages]=useState<Msg[]>([{id:0,role:"agent",text:t("ai.welcome")}]);

  useEffect(()=>{endRef.current?.scrollIntoView({block:"nearest"})},[messages,busy]);
  // Provider and model are saved as soon as they change.
  useEffect(()=>{write("voxeltools-ai-provider",provider);write("voxeltools-ai-model",model.trim()||providers[provider].model)},[provider,model]);

  const push=(item:Omit<Msg,"id">)=>{const id=nextId.current++;setMessages(prev=>[...prev,{...item,id}]);return id};

  const changeProvider=(next:Provider)=>{setProvider(next);setModel(providers[next].model)};

  // Saves the key right away (on paste, Enter, leaving the field, or the Save key button).
  const commitKey=(value:string)=>{
    const key=value.trim();
    if(!key){if(apiKey)setShowSettings(false);return}
    if(key.length<8)return;
    write("voxeltools-ai-key",key);
    const stored=read("voxeltools-ai-key","")===key;
    setApiKey(key);setKeyDraft("");setShowSettings(false);
    push({role:"agent",text:stored?t("ai.keySavedMsg"):t("ai.keyNoStore")});
  };
  const onKeyPaste=(e:ClipboardEvent<HTMLInputElement>)=>{e.preventDefault();commitKey(e.clipboardData.getData("text"))};
  const onKeyEnter=(e:KeyboardEvent<HTMLInputElement>)=>{if(e.key==="Enter"){e.preventDefault();commitKey(keyDraft)}};
  const removeKey=()=>{write("voxeltools-ai-key","");setApiKey("");setKeyDraft("");setShowSettings(true)};

  const ask=async(prompt:string,shown=prompt)=>{
    const text=prompt.trim();
    if(!text||busy||!apiKey)return;
    const userMsg:Msg={id:nextId.current++,role:"user",text:shown.trim(),raw:text};
    const next=[...messages,userMsg];
    setMessages(next);setInput("");setBusy(true);
    try{
      const reply=await callAI(provider,apiKey,model.trim()||providers[provider].model,systemPrompt(version,lang),toTurns(next));
      if(!reply.trim())throw new Error(t("ai.emptyReply"));
      const parsed=parseReply(reply,t("ai.here"));
      setFreshId(push({role:"agent",text:parsed.text+groundingNote(parsed.command,version),command:parsed.command,raw:reply}));
    }catch(err){
      const message=err instanceof Error?err.message:"Request failed.";
      push({role:"agent",text:message==="Failed to fetch"?t("ai.networkFail"):message});
    }finally{setBusy(false)}
  };

  const copy=async(id:number,command:string)=>{
    try{await navigator.clipboard.writeText(command);setCopied(id);window.setTimeout(()=>setCopied(0),1500)}
    catch{push({role:"agent",text:t("ai.copyFail")})}
  };
  const persist=(next:string[])=>{setSaved(next);write("voxeltools-agent-saved",JSON.stringify(next))};
  const saveCommand=(command:string)=>persist([...new Set([command,...saved])].slice(0,20));

  return <div className="ai-agent">
    <div className="ai-top">
      <div className="ai-head">
        <span className="section-eyebrow">{t("ai.eyebrow")}</span>
        <h2>{t("ai.title1")}<br/><em>{t("ai.title2")}</em></h2>
        <p>{t("ai.targets",{v:version==="All versions"?t("hero.allReleases"):version})}</p>
      </div>
      <button className="ai-gear" onClick={()=>setShowSettings(v=>!v)}>{showSettings?t("ai.hideSettings"):t("ai.settings")}</button>
    </div>
    <div className={busy?"ai-chat busy":"ai-chat"}>
      {showSettings&&<div className="ai-settings">
        <div className="ai-grid">
          <label>{t("ai.provider")}<select value={provider} onChange={e=>changeProvider(e.target.value as Provider)}>{(Object.keys(providers) as Provider[]).map(p=><option key={p} value={p}>{providers[p].label}</option>)}</select></label>
          <label>{t("ai.model")}<input dir="ltr" value={model} onChange={e=>setModel(e.target.value)} placeholder={providers[provider].model}/></label>
        </div>
        <label>{t("ai.apiKey")}<input dir="ltr" type="password" autoComplete="off" value={keyDraft} onChange={e=>setKeyDraft(e.target.value)} onPaste={onKeyPaste} onKeyDown={onKeyEnter} onBlur={()=>{if(keyDraft.trim())commitKey(keyDraft)}} placeholder={apiKey?t("ai.keySavedPlaceholder"):t("ai.keyPlaceholder")}/></label>
        <small><a href={providers[provider].keyPage} target="_blank" rel="noreferrer">{t("ai.getKey",{p:providers[provider].label.split(" (")[0]})}</a>. {t("ai.freeNote")}</small>
        <small>{t("ai.keyNote")}</small>
        <div className="ai-row"><button className="ai-primary" onClick={()=>commitKey(keyDraft)}>{t("ai.saveKey")}</button>{apiKey&&<button className="ai-ghost" onClick={removeKey}>{t("ai.removeKey")}</button>}</div>
      </div>}
      <div className="ai-log" aria-live="polite">
        {messages.map(m=>{
          const cmd=m.command;
          const animate=m.id===freshId&&!prefersReducedMotion();
          return <div key={m.id} className={`ai-msg ${m.role}`}>
            <p><Typed text={m.id===0?t("ai.welcome"):m.text} animate={animate}/></p>
            {cmd&&<>
              <code dir="ltr"><Typed text={cmd} animate={animate}/></code>
              <div className="ai-actions">
                <button onClick={()=>copy(m.id,cmd)}>{copied===m.id?t("ai.copied"):t("ai.copy")}</button>
                <button disabled={busy} onClick={()=>ask(t("ai.explainPrompt",{c:cmd}),t("ai.explainShown",{c:cmd}))}>{t("ai.explain")}</button>
                <button disabled={busy} onClick={()=>ask(t("ai.fixPrompt",{c:cmd}),t("ai.fixShown",{c:cmd}))}>{t("ai.fix")}</button>
                <button onClick={()=>saveCommand(cmd)}>{saved.includes(cmd)?t("ai.saved"):t("ai.save")}</button>
              </div>
            </>}
          </div>;
        })}
        {busy&&<div className="ai-msg agent"><span className="ai-dots" role="status" aria-label={t("ai.thinking")}><i/><i/><i/></span></div>}
        <div ref={endRef}/>
      </div>
      <div className="ai-examples">{examples.map(ex=><button key={ex} dir="ltr" disabled={busy||!apiKey} onClick={()=>ask(ex)}>{ex}</button>)}</div>
      <form className="ai-compose" onSubmit={e=>{e.preventDefault();ask(input)}}>
        <input aria-label={t("ai.composeAria")} disabled={!apiKey} value={input} onChange={e=>setInput(e.target.value)} placeholder={apiKey?t("ai.composePlaceholder"):t("ai.needKey")}/>
        <button type="submit" disabled={busy||!apiKey}>{t("ai.send")}</button>
      </form>
    </div>
    <SavedCommands items={saved} onRemove={item=>persist(saved.filter(x=>x!==item))} onCopy={async(value)=>{try{await navigator.clipboard.writeText(value)}catch{/* ignore */}}}/>
  </div>;
}
