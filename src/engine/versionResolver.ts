import type {MinecraftCommand} from "../data/commands";
import {minecraftVersions} from "../data/versions";

export function versionRank(v:string){const key=v==="All versions"?minecraftVersions[minecraftVersions.length-1]:v;const i=minecraftVersions.indexOf(key as never);return i>=0?i:-1;}
export function compareVersions(a:string,b:string){return versionRank(a)-versionRank(b)}
export function versionAtLeast(v:string,target:string){return compareVersions(v,target)>=0}
export function isCommandAvailable(c:MinecraftCommand,v:string){if(v==="All versions")return true;const rank=versionRank(v);const intro=c.introduced?versionRank(c.introduced):0;const removed=c.removed?versionRank(c.removed):-1;return rank>=intro&&(removed<0||rank<removed)}
export function syntaxFor(c:MinecraftCommand,v:string){const table=c.syntaxByVersion;if(!table)return c.syntax;const candidates=Object.keys(table).filter(k=>versionAtLeast(v,k)).sort((a,b)=>versionRank(a)-versionRank(b));return candidates.length?table[candidates[candidates.length-1]]:c.syntax}
