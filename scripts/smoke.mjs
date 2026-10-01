import {createServer} from "node:http";
import {existsSync,readFileSync} from "node:fs";

const app=readFileSync("src/App.tsx","utf8");
const agent=readFileSync("src/components/AICommandAgent.tsx","utf8");
const css=readFileSync("src/styles.css","utf8");
const search=readFileSync("src/components/GlobalSearch.tsx","utf8");
const saved=readFileSync("src/components/SavedCommands.tsx","utf8");
const commands=readFileSync("src/data/commands.ts","utf8");
const i18n=readFileSync("src/i18n.ts","utf8");
const index=readFileSync("index.html","utf8");

const checks=[
  [search,'t("search.aria")',"global search"],
  [saved,'className="saved-panel"',"saved command panel"],
  [app,'AICommandAgent',"AI agent page integration"],
  [agent,'callAI(',"AI provider request wiring"],
  [agent,'systemPrompt(',"version-aware agent prompt"],
  [app,'localStorage.setItem("voxeltools-saved"',"saved command persistence"],
  [app,'localStorage.setItem("voxeltools-version"',"version persistence"],
  [app,'localStorage.setItem("voxeltools-lang"',"language persistence"],
  [app,'document.documentElement.dir=',"RTL direction switching"],
  [i18n,'"fa"',"Persian dictionary"],
  [css,".saved-panel","saved panel styles"],
  [css,".lang-fa","Persian/RTL styles"],
  [index,'Vazirmatn',"Persian font loaded"],
  [commands,'introduced:"26.3"',"26.3 command metadata"],
  [index,"VoxelTools","production HTML"]
];

for(const [source,needle,label] of checks){
  if(!String(source).includes(String(needle))) throw new Error("Smoke check failed: "+label);
}
if(!existsSync("dist")) throw new Error("Smoke check failed: dist directory missing");

const html=index;
const server=createServer((req,res)=>{
  if(req.url==="/VoxelTools/"||req.url==="/VoxelTools/index.html"){
    res.writeHead(200,{"content-type":"text/html; charset=utf-8"});
    res.end(html);
    return;
  }
  res.writeHead(404);
  res.end("Not found");
});

await new Promise((resolve,reject)=>{
  server.once("error",reject);
  server.listen(4173,"127.0.0.1",resolve);
});

try{
  const response=await fetch("http://127.0.0.1:4173/VoxelTools/");
  if(!response.ok) throw new Error("HTTP "+response.status);
  const body=await response.text();
  if(!body.includes("VoxelTools")) throw new Error("Response missing VoxelTools");
}finally{
  await new Promise(resolve=>server.close(()=>resolve()));
}

console.log("Smoke checks passed.");
