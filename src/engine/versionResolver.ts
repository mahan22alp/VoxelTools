import type {MinecraftCommand} from "../data/commands";
export const versionOrder=["1.7.10","1.8.9","1.9.4","1.10.2","1.11.2","1.12.2","1.13.2","1.14.4","1.15.2","1.16.5","1.17.1","1.18.2","1.19.4","1.20.1","1.20.2","1.20.4","1.20.5","1.20.6","1.21","1.21.1","1.21.2","1.21.3","1.21.4","1.21.5","1.21.6","1.21.7","1.21.8","1.21.9","1.21.10","1.21.11","26.1","26.1.1","26.2","26.3"];
export function versionKey(v:string){return v==="All versions"?"1.21.11":v}
export function versionAtLeast(v:string,target:string){const a=versionKey(v).split(".").map(Number),b=target.split(".").map(Number);for(let i=0;i<Math.max(a.length,b.length);i++){const x=a[i]||0,y=b[i]||0;if(x!==y)return x>y}return true}
export function syntaxFor(c:MinecraftCommand,v:string){const table=c.syntaxByVersion;if(!table)return c.syntax;const keys=Object.keys(table).filter(k=>versionAtLeast(v,k)).sort((a,b)=>versionOrder.indexOf(a)-versionOrder.indexOf(b));return keys.length?table[keys[keys.length-1]]:c.syntax}
