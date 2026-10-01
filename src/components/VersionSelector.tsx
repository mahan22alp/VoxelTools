import {useLang} from "./LangContext";
type Props={value:string;options:string[];onChange:(value:string)=>void};
export default function VersionSelector({value,options,onChange}:Props){
  const {t}=useLang();
  return <select value={value} onChange={e=>onChange(e.target.value)} aria-label={t("version.aria")}>{options.map(v=><option key={v}>{v}</option>)}</select>;
}
