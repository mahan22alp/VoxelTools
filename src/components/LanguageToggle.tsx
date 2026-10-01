import {useLang} from "./LangContext";
import type {Lang} from "../i18n";

type Props={lang:Lang;onToggle:()=>void};
export default function LanguageToggle({lang,onToggle}:Props){
  const {t}=useLang();
  return <button className="theme-toggle" onClick={onToggle} aria-label={lang==="en"?"Switch to Persian (Farsi)":"تغییر به انگلیسی"} title={lang==="en"?"فارسی":"English"}>
    <svg viewBox="0 0 24 24" aria-hidden="true" className="icon"><path d="M3 6h8M7 4v2M9.5 9c-1 2.6-3 4.6-5.5 5.7M5 10.6c1.3 2.4 3.5 4 6.5 4.9M13 20l3.8-9L20.5 20M14.4 17h4.7" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/></svg>
    <span>{lang==="en"?"فا":"EN"}</span>
  </button>;
}
