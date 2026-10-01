import {useLang} from "./LangContext";

type Props={items:string[];onRemove:(item:string)=>void;onCopy:(item:string)=>Promise<void>|void};

export default function SavedCommands({items,onRemove,onCopy}:Props){
  const {t}=useLang();
  return <section className="saved-panel" aria-label={t("saved.title")}>
    <div className="saved-header"><b>{t("saved.title")}</b><span dir="ltr">{items.length}/20</span></div>
    {items.length?<div className="saved-list">{items.map(item=><div className="saved-item" key={item}><code dir="ltr">{item}</code><button onClick={()=>onCopy(item)}>{t("library.copy")}</button><button onClick={()=>onRemove(item)}>×</button></div>)}</div>:<p>{t("saved.none")}</p>}
  </section>;
}
