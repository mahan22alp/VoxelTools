import {useEffect,useRef,useState} from "react";
import "../agent.css";
import SavedCommands from "./SavedCommands";

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

function systemPrompt(version:string){
  const target=version==="All versions"?"the latest release":version;
  return `You are a Minecraft Java Edition command expert. The player's game version is ${target}. Reply with exactly one command inside a fenced code block, then at most two short sentences of explanation. If the request is unclear, ask one short question instead. Never invent commands or arguments. If something is not possible in this version, say so.`;
}

function parseReply(raw:string):{text:string;command?:string}{
  const reply=raw.replace(/<think>[\s\S]*?<\/think>/g,"").trim();
  const match=reply.match(/```[\w-]*\n?([\s\S]*?)```/);
  if(match)return {text:reply.replace(match[0],"").trim()||"Here is your command:",command:match[1].trim()};
  // Some free models skip the code block, so fall back to the first line that starts with a slash.
  const line=reply.split("\n").find(l=>/^\s*\/[a-z_:]+/i.test(l));
  if(line)return {text:reply.replace(line,"").trim()||"Here is your command:",command:line.trim()};
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
      body:JSON.stringify({model,max_tokens:700,system,messages:turns})
    });
    const data=await res.json();
    if(!res.ok)throw new Error(data?.error?.message||`Request failed (${res.status})`);
    return (data.content as {type:string;text?:string}[]).filter(b=>b.type==="text").map(b=>b.text||"").join("\n");
  }
  // OpenRouter, Groq, Gemini and OpenAI all speak the OpenAI chat-completions format.
  const res=await fetch(url,{
    method:"POST",
    headers:{"content-type":"application/json",authorization:`Bearer ${key}`},
    body:JSON.stringify({model,messages:[{role:"system",content:system},...turns]})
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
    const id=window.setInterval(()=>setCount(v=>{if(v>=text.length){window.clearInterval(id);return v}return v+1}),14);
    return()=>window.clearInterval(id);
  },[text,animate]);
  if(!animate)return <>{text}</>;
  return <>{text.slice(0,count)}{count<text.length&&<span className="ai-caret"/>}</>;
}

export default function AICommandAgent({version}:{version:string}){
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
  const [messages,setMessages]=useState<Msg[]>([{id:0,role:"agent",text:"Describe what you want in plain words and I will write the command. Add your API key in Settings first."}]);

  useEffect(()=>{endRef.current?.scrollIntoView({block:"nearest"})},[messages,busy]);

  const push=(item:Omit<Msg,"id">)=>{const id=nextId.current++;setMessages(prev=>[...prev,{...item,id}]);return id};

  const changeProvider=(next:Provider)=>{setProvider(next);setModel(providers[next].model)};
  const saveSettings=()=>{
    const key=keyDraft.trim()||apiKey;
    write("voxeltools-ai-provider",provider);
    write("voxeltools-ai-model",model.trim()||providers[provider].model);
    write("voxeltools-ai-key",key);
    setApiKey(key);setKeyDraft("");
    if(key)setShowSettings(false);
  };
  const removeKey=()=>{write("voxeltools-ai-key","");setApiKey("");setKeyDraft("");setShowSettings(true)};

  const ask=async(prompt:string,shown=prompt)=>{
    const text=prompt.trim();
    if(!text||busy||!apiKey)return;
    const userMsg:Msg={id:nextId.current++,role:"user",text:shown.trim(),raw:text};
    const next=[...messages,userMsg];
    setMessages(next);setInput("");setBusy(true);
    try{
      const reply=await callAI(provider,apiKey,model.trim()||providers[provider].model,systemPrompt(version),toTurns(next));
      if(!reply.trim())throw new Error("The model returned an empty reply. Try again.");
      const parsed=parseReply(reply);
      setFreshId(push({role:"agent",text:parsed.text,command:parsed.command,raw:reply}));
    }catch(err){
      const message=err instanceof Error?err.message:"Request failed.";
      push({role:"agent",text:message==="Failed to fetch"?"Could not reach the provider. Check your connection, then try again.":message});
    }finally{setBusy(false)}
  };

  const copy=async(id:number,command:string)=>{
    try{await navigator.clipboard.writeText(command);setCopied(id);window.setTimeout(()=>setCopied(0),1500)}
    catch{push({role:"agent",text:"Copy failed. Select the command and copy it manually."})}
  };
  const persist=(next:string[])=>{setSaved(next);write("voxeltools-agent-saved",JSON.stringify(next))};
  const saveCommand=(command:string)=>persist([...new Set([command,...saved])].slice(0,20));

  return <div className="ai-agent">
    <div className="ai-top">
      <div className="ai-head">
        <span className="section-eyebrow">AI AGENT</span>
        <h2>Say it in words.<br/><em>Get the command.</em></h2>
        <p>Uses your own API key. Targets {version==="All versions"?"the latest release":version}.</p>
      </div>
      <button className="ai-gear" onClick={()=>setShowSettings(v=>!v)}>{showSettings?"Hide settings":"Settings"}</button>
    </div>
    <div className={busy?"ai-chat busy":"ai-chat"}>
      {showSettings&&<div className="ai-settings">
        <div className="ai-grid">
          <label>Provider<select value={provider} onChange={e=>changeProvider(e.target.value as Provider)}>{(Object.keys(providers) as Provider[]).map(p=><option key={p} value={p}>{providers[p].label}</option>)}</select></label>
          <label>Model<input value={model} onChange={e=>setModel(e.target.value)} placeholder={providers[provider].model}/></label>
        </div>
        <label>API key<input type="password" autoComplete="off" value={keyDraft} onChange={e=>setKeyDraft(e.target.value)} placeholder={apiKey?"Key saved. Paste a new key to replace it.":"Paste your API key"}/></label>
        <small><a href={providers[provider].keyPage} target="_blank" rel="noreferrer">Get a {providers[provider].label.split(" (")[0]} key</a>. Free tiers have usage limits and may use your prompts to improve their models.</small>
        <small>Your key is stored only in this browser and sent only to the provider you pick. Never put it in the code or share it.</small>
        <div className="ai-row"><button className="ai-primary" onClick={saveSettings}>Save settings</button>{apiKey&&<button className="ai-ghost" onClick={removeKey}>Remove key</button>}</div>
      </div>}
      <div className="ai-log" aria-live="polite">
        {messages.map(m=>{
          const cmd=m.command;
          const animate=m.id===freshId&&!prefersReducedMotion();
          return <div key={m.id} className={`ai-msg ${m.role}`}>
            <p><Typed text={m.text} animate={animate}/></p>
            {cmd&&<>
              <code><Typed text={cmd} animate={animate}/></code>
              <div className="ai-actions">
                <button onClick={()=>copy(m.id,cmd)}>{copied===m.id?"Copied":"Copy"}</button>
                <button disabled={busy} onClick={()=>ask(`Explain this command briefly: ${cmd}`,`Explain ${cmd}`)}>Explain</button>
                <button disabled={busy} onClick={()=>ask(`Fix this command so it works in my version and return it as one command: ${cmd}`,`Fix ${cmd}`)}>Fix</button>
                <button onClick={()=>saveCommand(cmd)}>{saved.includes(cmd)?"Saved":"Save"}</button>
              </div>
            </>}
          </div>;
        })}
        {busy&&<div className="ai-msg agent"><span className="ai-dots" role="status" aria-label="Thinking"><i/><i/><i/></span></div>}
        <div ref={endRef}/>
      </div>
      <div className="ai-examples">{examples.map(t=><button key={t} disabled={busy||!apiKey} onClick={()=>ask(t)}>{t}</button>)}</div>
      <form className="ai-compose" onSubmit={e=>{e.preventDefault();ask(input)}}>
        <input aria-label="Describe your command" disabled={!apiKey} value={input} onChange={e=>setInput(e.target.value)} placeholder={apiKey?"Describe your command...":"Add your API key in Settings to start"}/>
        <button type="submit" disabled={busy||!apiKey}>Send</button>
      </form>
    </div>
    <SavedCommands items={saved} onRemove={item=>persist(saved.filter(x=>x!==item))} onCopy={async(value)=>{try{await navigator.clipboard.writeText(value)}catch{/* ignore */}}}/>
  </div>;
}
