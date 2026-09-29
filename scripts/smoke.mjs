import {spawn} from "node:child_process";
import {existsSync,readFileSync} from "node:fs";

const app=readFileSync("src/App.tsx","utf8");
const css=readFileSync("src/styles.css","utf8");
const commands=readFileSync("src/data/commands.ts","utf8");
const index=readFileSync("dist/index.html","utf8");

const checks=[
  [app,'aria-label="Global command search"',"global search"],
  [app,'className="saved-panel"',"saved command panel"],
  [app,'naturalCommand(naturalInput,version)',"version-aware live generator"],
  [app,'localStorage.getItem("voxeltools-saved")',"saved command persistence"],
  [css,".saved-panel","saved panel styles"],
  [commands,'introduced:"26.3"',"26.3 command metadata"],
  [index,"VoxelTools","production HTML"]
];

for(const [source,needle,label] of checks){
  if(!String(source).includes(String(needle))) throw new Error("Smoke check failed: "+label);
}

if(!existsSync("dist")) throw new Error("Smoke check failed: dist directory missing");

const port=4173;
const child=spawn("npm",["run","preview","--","--host","127.0.0.1","--port",String(port)],{stdio:["ignore","pipe","pipe"]});
const url="http://127.0.0.1:"+port+"/VoxelTools/";
let response;
let lastError;
for(let i=0;i<30;i++){
  try{
    response=await fetch(url);
    if(response.ok) break;
  }catch(error){lastError=error}
  await new Promise(r=>setTimeout(r,250));
}
if(!response?.ok) throw new Error("Smoke check failed: preview server unavailable"+(lastError?" ("+lastError+")":""));
const body=await response.text();
if(!body.includes("VoxelTools")) throw new Error("Smoke check failed: preview response missing VoxelTools");

child.kill("SIGTERM");
console.log("Smoke checks passed.");
