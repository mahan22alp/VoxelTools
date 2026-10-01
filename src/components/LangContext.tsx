import {createContext,useContext,useMemo} from "react";
import type {ReactNode} from "react";
import {t} from "../i18n";
import type {Lang} from "../i18n";

type Ctx={lang:Lang;t:(key:string,vars?:Record<string,string|number>)=>string};
const LangContext=createContext<Ctx>({lang:"en",t:(k)=>k});

export function LangProvider({lang,children}:{lang:Lang;children:ReactNode}){
  const value=useMemo(()=>({lang,t:(key:string,vars?:Record<string,string|number>)=>t(lang,key,vars)}),[lang]);
  return <LangContext.Provider value={value}>{children}</LangContext.Provider>;
}

export function useLang(){return useContext(LangContext)}
