import {forwardRef} from "react";
import {useLang} from "./LangContext";

type Props={value:string;onChange:(value:string)=>void;onEnter:()=>void};

const GlobalSearch=forwardRef<HTMLInputElement,Props>(function GlobalSearch({value,onChange,onEnter},ref){
  const {t}=useLang();
  return <label className="header-search"><span aria-hidden="true">⌕</span><input ref={ref} aria-label={t("search.aria")} placeholder={t("search.placeholder")} value={value} onChange={e=>onChange(e.target.value)} onKeyDown={e=>{if(e.key==="Enter")onEnter()}}/><kbd>/</kbd></label>;
});

export default GlobalSearch;
