import {useEffect,useRef,useState} from "react";
import "../agent.css";
import {minecraftCommands} from "../data/commands";
import {isCommandAvailable,syntaxFor} from "../engine/versionResolver";
import {naturalCommand} from "../engine/commandGenerator";

type Msg={id:number;role:"user"|"agent";text:string;command?:string};
type Props={version:string;onSave:(command:string)=>void};

const examples=["set time to night","set weather to clear","give me 5 diamonds"];

function findCommand(command:string){
  const name=command.trim().replace(/^\/+/,"").split(/\s+/)[0].toLowerCase();
  return minecraftCommands.find(c=>c.name===name);
}

export default function AICommandAgent({version,onSave}:Props){
  const nextId=useRef(1);
  const endRef=useRef<HTMLDivElement|null>(null);
  const [input,setInput]=useState("");
  const [copied,setCopied]=useState(0);
  const [messages,setMessages]=useState<Msg[]>([{id:0,role:"agent",text:"Describe what you want in plain words and I will write the command."}]);

  useEffect(()=>{endRef.current?.scrollIntoView({block:"nearest"})},[messages]);

  const add=(...items:Omit<Msg,"id">[])=>{
    const withIds=items.map(item=>({...item,id:nextId.current++}));
    setMessages(prev=>[...prev,...withIds]);
  };

  const send=(value:string)=>{
    const text=value.trim();
    if(!text)return;
    add({role:"user",text},{role:"agent",text:`Command for ${version}:`,command:naturalCommand(text,version)});
    setInput("");
  };

  const copy=async(id:number,command:string)=>{
    try{await navigator.clipboard.writeText(command);setCopied(id);window.setTimeout(()=>setCopied(0),1500)}
    catch{add({role:"agent",text:"Copy failed. Select the command and copy it manually."})}
  };

  const explain=(command:string)=>{
    const c=findCommand(command);
    add({role:"agent",text:c?`${c.desc} Syntax for ${version}: ${syntaxFor(c,version)}`:"I could not match this to a known command."});
  };

  const fix=(command:string)=>{
    const cleaned="/"+command.trim().replace(/^\/+/,"").replace(/\s+/g," ");
    const c=findCommand(cleaned);
    if(!c){
      const word=cleaned.slice(1).split(" ")[0];
      const close=word?minecraftCommands.filter(x=>x.name.startsWith(word.slice(0,2))).slice(0,3).map(x=>"/"+x.name):[];
      add({role:"agent",text:close.length?`Unknown command. Did you mean ${close.join(", ")}?`:"Unknown command."});
      return;
    }
    if(!isCommandAvailable(c,version)){add({role:"agent",text:`/${c.name} is not available in ${version}.`});return}
    add({role:"agent",text:`Cleaned up. Expected syntax: ${syntaxFor(c,version)}`,command:cleaned});
  };

  const save=(command:string)=>{onSave(command);add({role:"agent",text:"Saved. You can find it in the Generator tab."})};

  return <div className="ai-agent">
    <div className="ai-head">
      <span className="section-eyebrow">AI AGENT</span>
      <h2>Say it in words.<br/><em>Get the command.</em></h2>
      <p>Runs locally in your browser for {version}. No account, no server.</p>
    </div>
    <div className="ai-chat">
      <div className="ai-log" aria-live="polite">
        {messages.map(m=>{
          const cmd=m.command;
          return <div key={m.id} className={`ai-msg ${m.role}`}>
            <p>{m.text}</p>
            {cmd&&<>
              <code>{cmd}</code>
              <div className="ai-actions">
                <button onClick={()=>copy(m.id,cmd)}>{copied===m.id?"Copied":"Copy"}</button>
                <button onClick={()=>explain(cmd)}>Explain</button>
                <button onClick={()=>fix(cmd)}>Fix</button>
                <button onClick={()=>save(cmd)}>Save</button>
              </div>
            </>}
          </div>;
        })}
        <div ref={endRef}/>
      </div>
      <div className="ai-examples">{examples.map(t=><button key={t} onClick={()=>send(t)}>{t}</button>)}</div>
      <form className="ai-compose" onSubmit={e=>{e.preventDefault();send(input)}}>
        <input aria-label="Describe your command" value={input} onChange={e=>setInput(e.target.value)} placeholder="Describe your command..."/>
        <button type="submit">Generate</button>
      </form>
    </div>
  </div>;
}
