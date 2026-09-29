import type {MinecraftCommand} from "../data/commands";
import {minecraftVersions} from "../data/versions";

function parseVersion(v:string){return v.replace(/^v/i,"").split(".").map(part=>Number(part)||0)}
export function versionRank(v:string){
  const normalized=v==="All versions"?minecraftVersions[minecraftVersions.length-1]:v;
  const i=minecraftVersions.indexOf(normalized as never);
  return i>=0?i:parseVersion(normalized).reduce((n,p)=>n+p/1000000,0);
}
export function compareVersions(a:string,b:string){
  const av=parseVersion(a==="All versions"?minecraftVersions[minecraftVersions.length-1]:a);
  const bv=parseVersion(b==="All versions"?minecraftVersions[minecraftVersions.length-1]:b);
  for(let i=0;i<Math.max(av.length,bv.length);i++){const x=av[i]||0,y=bv[i]||0;if(x!==y)return x-y;}
  return 0;
}
export function versionAtLeast(v:string,target:string){return compareVersions(v,target)>=0}
export function isCommandAvailable(c:MinecraftCommand,v:string){
  if(v==="All versions")return true;
  if(c.introduced && !versionAtLeast(v,c.introduced))return false;
  if(c.removed && versionAtLeast(v,c.removed))return false;
  return true;
}
export function syntaxFor(c:MinecraftCommand,v:string){
  const table=c.syntaxByVersion;
  if(!table)return c.syntax;
  const candidates=Object.keys(table).filter(k=>versionAtLeast(v,k)).sort((a,b)=>compareVersions(a,b));
  return candidates.length?table[candidates[candidates.length-1]]:c.syntax;
}