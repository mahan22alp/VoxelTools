import {useEffect,useRef,useState} from "react";
import {useLang} from "./LangContext";
import {versionOptions} from "../data/versions";

type Kind="command"|"agent"|"translation"|"other";
type Entry={id:number;kind:Kind;message:string;email:string;context:string;createdAt:number};
type Draft=Partial<Entry>;
type Error="none"|"fail"|"activation";
type Props={draft:Draft|null;onDraftConsumed:()=>void};

// FormSubmit forwards reports to the maintainer's inbox — no API key needed. The very
// first submission emails a one-time "Activate Form" link to that address; until it is
// confirmed, sends fail with the activation error and reports wait in the outbox.
const ENDPOINT="https://formsubmit.co/ajax/mahanalipur2@gmail.com";
const OUTBOX_KEY="voxeltools-report-outbox";

function readOutbox():Entry[]{
  try{const parsed=JSON.parse(localStorage.getItem(OUTBOX_KEY)||"[]");return Array.isArray(parsed)?parsed.filter(e=>e&&typeof e.message==="string") as Entry[]:[]}
  catch{return []}
}
function writeOutbox(items:Entry[]){try{localStorage.setItem(OUTBOX_KEY,JSON.stringify(items))}catch{/* ignore */}}

async function send(entry:Entry):Promise<void>{
  const res=await fetch(ENDPOINT,{
    method:"POST",
    headers:{"content-type":"application/json",accept:"application/json"},
    body:JSON.stringify({
      _subject:"VoxelTools report: "+entry.kind,
      _template:"table",
      _captcha:"false",
      _honey:"",
      kind:entry.kind,
      message:entry.message,
      email:entry.email||undefined,
      _replyto:entry.email||undefined,
      context:entry.context,
      created_at:new Date(entry.createdAt).toISOString()
    })
  });
  const data=await res.json().catch(()=>({}));
  if(!res.ok||data.success===false){
    const reason=String(data.message||"");
    if(/activat/i.test(reason))throw new Error("activation");
    throw new Error(reason||`Request failed (${res.status})`);
  }
}

export default function ReportPanel({draft,onDraftConsumed}:Props){
  const {t}=useLang();
  const [kind,setKind]=useState<Kind>("command");
  const [message,setMessage]=useState("");
  const [email,setEmail]=useState("");
  const [state,setState]=useState<"idle"|"sending"|"sent">("idle");
  const [error,setError]=useState<Error>("none");
  const [outbox,setOutbox]=useState<Entry[]>(readOutbox);
  const seeded=useRef(false);

  // A report started from an agent message arrives as a draft with context attached.
  useEffect(()=>{
    if(!draft||seeded.current)return;
    seeded.current=true;
    setKind(draft.kind?"agent":"agent");setMessage(draft.message||"");setEmail(draft.email||"");
    setState("idle");setError("none");
    onDraftConsumed();
  },[draft,onDraftConsumed]);

  const persist=(items:Entry[])=>{setOutbox(items);writeOutbox(items)};

  const submit=async()=>{
    if(state==="sending")return;
    const text=message.trim();
    if(!text){setError("fail");return}
    const entry:Entry={id:Date.now(),kind,message:text,email:email.trim(),context:draft?.context||"",createdAt:Date.now()};
    setState("sending");setError("none");
    try{
      await send(entry);
      setState("sent");
      setMessage("");setEmail("");setKind("command");
    }catch(err){
      persist([...outbox,entry]);
      setState("idle");setError(err instanceof Error&&err.message==="activation"?"activation":"fail");
    }
  };

  const retry=async(entry:Entry)=>{
    try{await send(entry);persist(outbox.filter(e=>e.id!==entry.id))}
    catch(err){setError(err instanceof Error&&err.message==="activation"?"activation":"fail")}
  };

  const kindLabel=(k:Kind)=>t("report.kind"+k.charAt(0).toUpperCase()+k.slice(1));
  const kinds:Kind[]=["command","agent","translation","other"];

  return <div className="report-wrap">
    <div className="report-head">
      <span className="section-eyebrow">{t("report.eyebrow")}</span>
      <h2>{t("report.title1")}<br/><em>{t("report.title2")}</em></h2>
      <p>{t("report.sub")}</p>
    </div>
    <div className="report-card">
      {state==="sent"?<div className="report-done" role="status">
        <span className="report-check">✓</span>
        <b>{t("report.sent")}</b>
        <button className="report-again" onClick={()=>setState("idle")}>{t("report.another")}</button>
      </div>:<>
        <label className="report-label">{t("report.kindLabel")}</label>
        <div className="report-kinds" role="radiogroup" aria-label={t("report.kindLabel")}>
          {kinds.map(k=><button key={k} className={kind===k?"report-chip on":"report-chip"} onClick={()=>setKind(k)}>{kindLabel(k)}</button>)}
        </div>
        <label className="report-label">{t("report.messageLabel")}</label>
        <textarea className="report-text" rows={5} value={message} onChange={e=>{setMessage(e.target.value);setError("none")}} placeholder={t("report.messagePlaceholder")}/>
        <label className="report-label">{t("report.emailLabel")}</label>
        <input className="report-input" dir="ltr" type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder={t("report.emailPlaceholder")}/>
        <div className="report-context">
          <b>{t("report.contextLabel")}</b>
          <small>{t("report.contextHint")}</small>
          {draft?.context&&<code dir="ltr">{draft.context}</code>}
        </div>
        {error!=="none"&&<div className="report-error" role="alert">{t(error==="activation"?"report.activation":"report.fail")}</div>}
        <button className="report-submit" onClick={submit} disabled={state==="sending"||!message.trim()}>{state==="sending"?t("report.sending"):t("report.submit")}</button>
      </>}
    </div>
    <div className="report-outbox">
      <div className="report-outbox-head"><b>{t("report.pendingTitle")}</b>{outbox.length>0&&<span className="report-outbox-badge">{outbox.length}</span>}</div>
      {outbox.length===0?<small>{t("report.pendingEmpty")}</small>:<>
        <small>{t("report.pendingCount",{n:outbox.length})}</small>
        {outbox.map(entry=><div className="report-pending" key={entry.id}>
          <div><b>{kindLabel(entry.kind)}</b><small dir="auto">{entry.message}</small></div>
          <div className="report-pending-actions"><button onClick={()=>retry(entry)}>{t("report.retry")}</button><button onClick={()=>persist(outbox.filter(e=>e.id!==entry.id))}>{t("report.discard")}</button></div>
        </div>)}
      </>}
    </div>
    <div className="report-version">{t("version.aria")}: {versionOptions[1]}</div>
  </div>;
}
