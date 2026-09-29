import {createServer} from "node:http";
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
  [app,'localStorage.getItem("voxeltools-version")',"version persistence"],
  [css,".saved-panel","saved panel styles"],
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
