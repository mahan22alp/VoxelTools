import {useEffect,useMemo,useState} from "react";

type Tool={id:string;name:string;icon:string;desc:string};
type MinecraftCommand={name:string;syntax:string;category:string;desc:string;versions:string};

const tools:Tool[]=[
{id:"command",name:"Command Generator",icon:"⌘",desc:"Build common Minecraft commands"},
{id:"give",name:"Give Generator",icon:"◆",desc:"Create /give item commands"},
{id:"summon",name:"Summon Generator",icon:"✦",desc:"Create mob summon commands"},
{id:"enchant",name:"Enchant Generator",icon:"✧",desc:"Add enchantments to items"},
{id:"effect",name:"Effect Generator",icon:"◈",desc:"Apply potion effects"},
{id:"fill",name:"Fill Generator",icon:"▦",desc:"Generate fill commands"},
{id:"teleport",name:"Teleport Generator",icon:"➤",desc:"Create /tp commands"},
];

const mobs=["zombie","skeleton","creeper","spider","enderman","warden","iron_golem"];
const items=["diamond_sword","netherite_sword","diamond_pickaxe","netherite_pickaxe","diamond_helmet","netherite_chestplate","elytra","golden_apple"];
const enchants=["sharpness","protection","efficiency","unbreaking","fortune","mending","fire_aspect","looting"];
const effects=["speed","strength","haste","regeneration","resistance","fire_resistance","night_vision","jump_boost"];

const minecraftCommands:MinecraftCommand[]=[
{name:"advancement",syntax:"/advancement <grant|revoke> <targets> <everything|from|through|until|only>",category:"Players",desc:"Grant or revoke advancements.",versions:"Java"},
{name:"attribute",syntax:"/attribute <target> <attribute> <get|base|modifier>",category:"Entities",desc:"Read or modify an entity attribute.",versions:"Java"},
{name:"ban",syntax:"/ban <player> [reason]",category:"Server",desc:"Ban a player from a multiplayer server.",versions:"Java"},
{name:"ban-ip",syntax:"/ban-ip <ip|player> [reason]",category:"Server",desc:"Ban an IP address from a server.",versions:"Java"},
{name:"banlist",syntax:"/banlist [ips|players]",category:"Server",desc:"List banned players or IPs.",versions:"Java"},
{name:"bossbar",syntax:"/bossbar <add|remove|list|get|set>",category:"World",desc:"Create and control boss bars.",versions:"Java"},
{name:"clear",syntax:"/clear [targets] [item] [components] [maxCount]",category:"Players",desc:"Remove matching items from inventories.",versions:"Java"},
{name:"clone",syntax:"/clone <begin> <end> <destination> [replace|masked] [force|move|normal]",category:"World",desc:"Copy blocks from one region to another.",versions:"Java"},
{name:"damage",syntax:"/damage <target> <amount> [damageType] [at|by]",category:"Entities",desc:"Apply damage to entities.",versions:"Java"},
{name:"data",syntax:"/data <get|merge|modify|remove> <block|entity|storage>",category:"Data",desc:"Inspect and modify NBT-style data.",versions:"Java"},
{name:"datapack",syntax:"/datapack <enable|disable|list>",category:"Data",desc:"Manage loaded data packs.",versions:"Java"},
{name:"debug",syntax:"/debug <start|stop|function|permission>",category:"Server",desc:"Use Java Edition debugging tools.",versions:"Java"},
{name:"defaultgamemode",syntax:"/defaultgamemode <survival|creative|adventure|spectator>",category:"World",desc:"Set the default game mode.",versions:"Java"},
{name:"deop",syntax:"/deop <player>",category:"Server",desc:"Remove operator status.",versions:"Java"},
{name:"difficulty",syntax:"/difficulty <peaceful|easy|normal|hard>",category:"World",desc:"Set world difficulty.",versions:"Java"},
{name:"effect",syntax:"/effect <give|clear> <targets> [effect] [seconds] [amplifier] [hideParticles]",category:"Players",desc:"Give or clear status effects.",versions:"Java"},
{name:"enchant",syntax:"/enchant <targets> <enchantment> [level]",category:"Players",desc:"Enchant an item held by a target.",versions:"Java"},
{name:"execute",syntax:"/execute <as|at|positioned|if|unless|run|store|on|summon|...>",category:"Logic",desc:"Run commands with conditions, contexts and transformations.",versions:"Java"},
{name:"experience",syntax:"/experience <add|set|query> <targets> <amount> [points|levels]",category:"Players",desc:"Add, set or query experience.",versions:"Java"},
{name:"fill",syntax:"/fill <from> <to> <block> [destroy|hollow|keep|outline|replace]",category:"World",desc:"Fill a region with blocks.",versions:"Java"},
{name:"fillbiome",syntax:"/fillbiome <from> <to> <biome>",category:"World",desc:"Change the biome data in a region.",versions:"Java"},
{name:"forceload",syntax:"/forceload <add|remove|query> <from> [to]",category:"World",desc:"Control forced-loaded chunks.",versions:"Java"},
{name:"function",syntax:"/function <name> [arguments]",category:"Data",desc:"Run a function from a data pack.",versions:"Java"},
{name:"gamemode",syntax:"/gamemode <survival|creative|adventure|spectator> [target]",category:"Players",desc:"Change a player's game mode.",versions:"Java"},
{name:"gamerule",syntax:"/gamerule <rule> [value]",category:"World",desc:"Read or change a game rule.",versions:"Java 1.21.11+"},
{name:"give",syntax:"/give <targets> <item>[components] [count]",category:"Players",desc:"Give items to players.",versions:"Java"},
{name:"help",syntax:"/help [command]",category:"Server",desc:"Show command help.",versions:"Java"},
{name:"item",syntax:"/item <target> <slot> <replace|modify> ...",category:"Players",desc:"Replace or modify items in entity or block slots.",versions:"Java"},
{name:"jfr",syntax:"/jfr <start|stop>",category:"Server",desc:"Start or stop Java Flight Recorder profiling.",versions:"Java"},
{name:"kick",syntax:"/kick <players> [reason]",category:"Server",desc:"Remove players from a server.",versions:"Java"},
{name:"kill",syntax:"/kill [targets]",category:"Entities",desc:"Remove targeted entities.",versions:"Java"},
{name:"list",syntax:"/list [uuids]",category:"Server",desc:"List players currently on the server.",versions:"Java"},
{name:"locate",syntax:"/locate <structure|biome|poi> <id> [useNewChunks]",category:"World",desc:"Find the nearest matching structure, biome or point of interest.",versions:"Java"},
{name:"loot",syntax:"/loot <replace|insert|give|spawn> ...",category:"World",desc:"Generate and distribute loot.",versions:"Java"},
{name:"me",syntax:"/me <action>",category:"Chat",desc:"Send a third-person action message.",versions:"Java"},
{name:"msg",syntax:"/msg <targets> <message>",category:"Chat",desc:"Send a private message.",versions:"Java"},
{name:"op",syntax:"/op <player>",category:"Server",desc:"Grant operator status.",versions:"Java"},
{name:"pardon",syntax:"/pardon <player>",category:"Server",desc:"Remove a player from the ban list.",versions:"Java"},
{name:"pardon-ip",syntax:"/pardon-ip <ip>",category:"Server",desc:"Remove an IP from the ban list.",versions:"Java"},
{name:"particle",syntax:"/particle <name> [pos] [delta] [speed] [count] [force|normal] [viewers]",category:"Visual",desc:"Create particle effects.",versions:"Java"},
{name:"perf",syntax:"/perf start|stop",category:"Server",desc:"Collect server performance information when supported.",versions:"Java"},
{name:"place",syntax:"/place <feature|jigsaw|structure|template|configured>",category:"World",desc:"Place configured world-generation elements.",versions:"Java"},
{name:"playsound",syntax:"/playsound <sound> <source> <targets> [pos] [volume] [pitch] [minVolume]",category:"Audio",desc:"Play a sound for selected players.",versions:"Java"},
{name:"publish",syntax:"/publish [port]",category:"Server",desc:"Open a single-player world to LAN.",versions:"Java"},
{name:"random",syntax:"/random <roll|sequence> ...",category:"Logic",desc:"Generate random values or sequences.",versions:"Java"},
{name:"recipe",syntax:"/recipe <give|take> <targets> <recipe|*>",category:"Players",desc:"Give or take crafting recipes.",versions:"Java"},
{name:"reload",syntax:"/reload",category:"Data",desc:"Reload data packs and server data.",versions:"Java"},
{name:"return",syntax:"/return <fail|run|success|result> ...",category:"Logic",desc:"Control return values inside command functions.",versions:"Java"},
{name:"ride",syntax:"/ride <target> <mount|dismount|...>",category:"Entities",desc:"Control entity riding relationships.",versions:"Java"},
{name:"save-all",syntax:"/save-all [flush]",category:"Server",desc:"Save world data to disk.",versions:"Java"},
{name:"save-off",syntax:"/save-off",category:"Server",desc:"Disable automatic world saving.",versions:"Java"},
{name:"save-on",syntax:"/save-on",category:"Server",desc:"Enable automatic world saving.",versions:"Java"},
{name:"say",syntax:"/say <message>",category:"Chat",desc:"Broadcast a message to all players.",versions:"Java"},
{name:"schedule",syntax:"/schedule <function|clear> <function> <time|append>",category:"Data",desc:"Schedule a function to run later.",versions:"Java"},
{name:"scoreboard",syntax:"/scoreboard <objectives|players|display|teams|...>",category:"Logic",desc:"Create and manage scoreboards and scores.",versions:"Java"},
{name:"seed",syntax:"/seed",category:"World",desc:"Show the current world seed.",versions:"Java"},
{name:"setblock",syntax:"/setblock <pos> <block> [destroy|keep|replace]",category:"World",desc:"Change one block.",versions:"Java"},
{name:"setworldspawn",syntax:"/setworldspawn [pos] [angle]",category:"World",desc:"Set the world spawn point.",versions:"Java"},
{name:"spawnpoint",syntax:"/spawnpoint [targets] [pos] [angle]",category:"Players",desc:"Set a player's respawn point.",versions:"Java"},
{name:"spectate",syntax:"/spectate [target] [player]",category:"Players",desc:"Make a player spectate an entity.",versions:"Java"},
{name:"spreadplayers",syntax:"/spreadplayers <center> <spreadDistance> <maxRange> <respectTeams> <targets>",category:"World",desc:"Spread entities across an area.",versions:"Java"},
{name:"stop",syntax:"/stop",category:"Server",desc:"Stop a dedicated server.",versions:"Java"},
{name:"stopwatch",syntax:"/stopwatch <create|query|restart|remove> <id> [scale]",category:"Data",desc:"Track real time independently of game ticks.",versions:"Java 1.21.11+"},
{name:"stopsound",syntax:"/stopsound <targets> [source] [sound]",category:"Audio",desc:"Stop sounds for selected players.",versions:"Java"},
{name:"summon",syntax:"/summon <entity> [pos] [rotation] [nbt]",category:"Entities",desc:"Summon an entity.",versions:"Java"},
{name:"tag",syntax:"/tag <targets> <add|remove|list> [name]",category:"Entities",desc:"Manage custom entity tags.",versions:"Java"},
{name:"team",syntax:"/team <list|add|remove|empty|join|leave|modify>",category:"Players",desc:"Create and manage teams.",versions:"Java"},
{name:"teammsg",syntax:"/teammsg <message>",category:"Chat",desc:"Send a message to your team.",versions:"Java"},
{name:"teleport",syntax:"/teleport [targets] <location|destination> [rotation|facing]",category:"Movement",desc:"Teleport entities or players.",versions:"Java"},
{name:"tell",syntax:"/tell <targets> <message>",category:"Chat",desc:"Send a private message.",versions:"Java"},
{name:"tellraw",syntax:"/tellraw <targets> <message>",category:"Chat",desc:"Send a JSON-formatted chat message.",versions:"Java"},
{name:"tick",syntax:"/tick <query|rate|step|sprint|freeze|unfreeze>",category:"World",desc:"Control and inspect game tick behavior.",versions:"Java"},
{name:"time",syntax:"/time <set|add|query> <value>",category:"World",desc:"Set, add or query world time.",versions:"Java"},
{name:"title",syntax:"/title <targets> <clear|reset|title|subtitle|actionbar|times>",category:"Visual",desc:"Display titles and action bars.",versions:"Java"},
{name:"tm",syntax:"/tm <message>",category:"Chat",desc:"Team message alias.",versions:"Java"},
{name:"trigger",syntax:"/trigger <objective> <add|set> <value>",category:"Logic",desc:"Trigger a scoreboard objective for a player.",versions:"Java"},
{name:"transfer",syntax:"/transfer <host> [port]",category:"Server",desc:"Transfer a player to another server.",versions:"Java"},
{name:"version",syntax:"/version",category:"Server",desc:"Show server version information where supported.",versions:"Java"},
{name:"dialog",syntax:"/dialog <show|clear> <targets> [dialog]",category:"Players",desc:"Show or clear custom dialog screens.",versions:"Java 1.21.6+"},
{name:"fetchprofile",syntax:"/fetchprofile <name|id> <profile>",category:"Players",desc:"Fetch a player profile from Mojang's servers.",versions:"Java 1.21.9+"},
{name:"rotate",syntax:"/rotate <target> <rotation|facing>",category:"Entities",desc:"Rotate an entity toward a rotation or target.",versions:"Java 1.21+"},
{name:"setidletimeout",syntax:"/setidletimeout <minutes>",category:"Server",desc:"Set the idle timeout for players on a server.",versions:"Java"},
{name:"test",syntax:"/test <run|runmultiple|runclosest|runfailed|create|clearall|locate|pos|stop|verify>",category:"Data",desc:"Run and manage Java GameTests.",versions:"Java"},
{name:"tp",syntax:"/tp [targets] <location|destination> [rotation|facing]",category:"Movement",desc:"Teleport alias for /teleport.",versions:"Java"},
{name:"w",syntax:"/w <targets> <message>",category:"Chat",desc:"Private message alias for /msg.",versions:"Java"},
{name:"waypoint",syntax:"/waypoint <list|modify> ...",category:"World",desc:"Manage waypoints used by the locator bar.",versions:"Java 1.21.6+"},
{name:"weather",syntax:"/weather <clear|rain|thunder> [duration]",category:"World",desc:"Change the weather.",versions:"Java"},
{name:"whitelist",syntax:"/whitelist <on|off|list|add|remove|reload>",category:"Server",desc:"Manage the server whitelist.",versions:"Java"},
{name:"worldborder",syntax:"/worldborder <add|center|damage|set|warning|get>",category:"World",desc:"Manage the world border.",versions:"Java"},
{name:"xp",syntax:"/xp <add|set|query> <targets> <amount> [points|levels]",category:"Players",desc:"Experience command alias.",versions:"Java"}
];

function App(){
 const [tool,setTool]=useState("command"),[query,setQuery]=useState(""),[version,setVersion]=useState("1.21.11");
 const [commandQuery,setCommandQuery]=useState(""),[category,setCategory]=useState("All");
 const [dark,setDark]=useState(true),[mobile,setMobile]=useState(false),[saved,setSaved]=useState<string[]>([]);\n const [aiPrompt,setAiPrompt]=useState(""),[aiCommand,setAiCommand]=useState(""),[aiLoading,setAiLoading]=useState(false),[aiError,setAiError]=useState("");
 const [form,setForm]=useState<Record<string,string>>({item:"diamond_sword",count:"1",player:"@p",mob:"zombie",level:"4",enchant:"sharpness",effect:"speed",duration:"30",amplifier:"1",x:"0",y:"64",z:"0",x1:"0",y1:"64",z1:"0",x2:"10",y2:"70",z2:"10",block:"stone",command:"/time set day"});
 useEffect(()=>{const s=localStorage.getItem("voxeltools-saved");if(s) setSaved(JSON.parse(s));},[]);
 const visible=useMemo(()=>tools.filter(t=>(t.name+" "+t.desc).toLowerCase().includes(query.toLowerCase())),[query]);
 const categories=useMemo(()=>["All",...Array.from(new Set(minecraftCommands.map(c=>c.category)))],[ ]);
 const allCommands=useMemo(()=>minecraftCommands.filter(c=>(category==="All"||c.category===category)&&(c.name+" "+c.syntax+" "+c.desc).toLowerCase().includes(commandQuery.toLowerCase())),[category,commandQuery]);
 const set=(k:string,v:string)=>setForm(f=>({...f,[k]:v}));
 const command=useMemo(()=>{
  const f=form,p=f.player||"@p";
  switch(tool){
   case"give":return `/give ${p} ${f.item||"diamond_sword"} ${f.count||"1"}`;
   case"summon":return `/summon ${f.mob||"zombie"} ${f.x||"~"} ${f.y||"~"} ${f.z||"~"}`;
   case"enchant":return `/enchant ${p} ${f.enchant||"sharpness"} ${f.level||"4"}`;
   case"effect":return `/effect give ${p} ${f.effect||"speed"} ${f.duration||"30"} ${f.amplifier||"1"}`;
   case"fill":return `/fill ${f.x1} ${f.y1} ${f.z1} ${f.x2} ${f.y2} ${f.z2} ${f.block||"stone"}`;
   case"teleport":return `/tp ${p} ${f.x||"0"} ${f.y||"64"} ${f.z||"0"}`;
   default:return f.command||"/time set day";
  }
 },[tool,form]);
 const copy=()=>navigator.clipboard?.writeText(command);
 const save=()=>{const n=[...new Set([command,...saved])].slice(0,20);setSaved(n);localStorage.setItem("voxeltools-saved",JSON.stringify(n));};
 const copyCatalog=(syntax:string)=>navigator.clipboard?.writeText(syntax);\n const generateAI=async()=>{\n  if(!aiPrompt.trim()||aiLoading)return;\n  setAiLoading(true);setAiError("");\n  try{\n   const r=await fetch("/api/generate-command",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({prompt:aiPrompt,version})});\n   const data=await r.json();\n   if(!r.ok)throw new Error(data?.error||"AI request failed.");\n   setAiCommand(data.command||"");\n  }catch(e){setAiError(e instanceof Error?e.message:"Could not generate command.");}\n  finally{setAiLoading(false);}\n };
 const field=(label:string,key:string,opts?:string[])=> <label className="field"><span>{label}</span>{opts?<select value={form[key]||opts[0]} onChange={e=>set(key,e.target.value)}>{opts.map(o=><option key={o}>{o}</option>)}</select>:<input value={form[key]||""} onChange={e=>set(key,e.target.value)} />}</label>;
 const editor=()=>{
  if(tool==="give")return <div className="grid">{field("Player","player")} {field("Item","item",items)} {field("Count","count")}</div>;
  if(tool==="summon")return <div className="grid">{field("Mob","mob",mobs)} {field("X","x")} {field("Y","y")} {field("Z","z")}</div>;
  if(tool==="enchant")return <div className="grid">{field("Player","player")} {field("Enchantment","enchant",enchants)} {field("Level","level")}</div>;
  if(tool==="effect")return <div className="grid">{field("Player","player")} {field("Effect","effect",effects)} {field("Duration","duration")} {field("Amplifier","amplifier")}</div>;
  if(tool==="fill")return <div className="grid">{field("From X","x1")} {field("From Y","y1")} {field("From Z","z1")} {field("To X","x2")} {field("To Y","y2")} {field("To Z","z2")} {field("Block","block")}</div>;
  if(tool==="teleport")return <div className="grid">{field("Player","player")} {field("X","x")} {field("Y","y")} {field("Z","z")}</div>;
  return <label className="field wide"><span>Command</span><input value={form.command} onChange={e=>set("command",e.target.value)} placeholder="/time set day"/></label>;
 };
 return <div className={dark?"app":"app light"}>
  <aside className={mobile?"sidebar open":"sidebar"}><div className="brand"><div className="logo">V</div><div><b>Voxel<span>Tools</span></b><small>MINECRAFT UTILITIES</small></div><button className="close" onClick={()=>setMobile(false)}>×</button></div>
   <div className="side-title">NAVIGATION</div><button className="nav active" onClick={()=>{setTool("command");setMobile(false);window.scrollTo({top:0,behavior:"smooth"})}}><i>⌂</i>Homepage</button><button className="nav" onClick={()=>{document.getElementById("ai-agent")?.scrollIntoView({behavior:"smooth"});setMobile(false)}}><i>✦</i>AI Command Agent</button><button className="nav" onClick={()=>{document.getElementById("workspace")?.scrollIntoView({behavior:"smooth"});setMobile(false)}}><i>⌘</i>Command Generator</button>
   <div className="side-foot">VOID + CYAN<br/><span>v1.1.0</span></div>
  </aside>
  <main><header><button className="hamb" onClick={()=>setMobile(true)}>☰</button><div className="search">⌕<input placeholder="Search commands..." value={query} onChange={e=>setQuery(e.target.value)}/></div><div className="head-actions"><select value={version} onChange={e=>setVersion(e.target.value)}><option>All versions</option><option>1.21.11</option><option>1.21.10</option><option>1.21.9</option><option>1.21.8</option><option>1.21.7</option><option>1.21.6</option><option>1.21.5</option><option>1.21.4</option><option>1.21.3</option><option>1.21.2</option><option>1.21.1</option><option>1.21</option><option>1.20.6</option><option>1.20.5</option><option>1.20.4</option><option>1.20.2</option><option>1.20.1</option><option>1.20</option><option>1.19.4</option><option>1.19.3</option><option>1.19.2</option><option>1.19.1</option><option>1.19</option><option>1.18.2</option><option>1.18.1</option><option>1.18</option><option>1.17.1</option><option>1.17</option><option>1.16.5</option><option>1.16.4</option><option>1.16.3</option><option>1.16.2</option><option>1.16.1</option><option>1.15.2</option><option>1.14.4</option><option>1.13.2</option><option>1.12.2</option><option>1.11.2</option><option>1.10.2</option><option>1.9.4</option><option>1.8.9</option><option>1.7.10</option></select><button onClick={()=>setDark(!dark)}>{dark?"☀":"☾"}</button></div></header>
   <section className="hero"><div><p className="eyebrow">MINECRAFT COMMAND LAB</p><h1>Build commands.<br/><span>Play smarter.</span></h1><p className="sub">A complete Java Edition command reference on the home page, with version-aware tools and searchable syntax.</p></div><div className="hero-orb"><div>VT</div></div></section>
      <section className="command-index">
    <div className="section-head"><div><h2>All Java Commands</h2><p>{minecraftCommands.length} commands • all versions • searchable syntax reference</p></div><span className="badge">JAVA • ALL VERSIONS</span></div>
    <div className="command-controls"><input placeholder="Search commands, syntax or description..." value={commandQuery} onChange={e=>setCommandQuery(e.target.value)}/><select value={category} onChange={e=>setCategory(e.target.value)}>{categories.map(c=><option key={c}>{c}</option>)}</select></div>
    <div className="command-list">{allCommands.map(c=><article className="command-row" key={c.name} onMouseMove={e=>{const r=e.currentTarget.getBoundingClientRect();e.currentTarget.style.setProperty("--mx",`${e.clientX-r.left}px`);e.currentTarget.style.setProperty("--my",`${e.clientY-r.top}px`);}} onMouseLeave={e=>{e.currentTarget.style.setProperty("--mx","50%");e.currentTarget.style.setProperty("--my","50%");}}><div className="command-main"><div className="command-name">/{c.name}<span>{c.category}</span></div><code>{c.syntax}</code><p>{c.desc}</p></div><div className="command-meta"><small>{c.versions}</small><button onClick={()=>copyCatalog(c.syntax)}>COPY SYNTAX</button></div></article>)}{!allCommands.length&&<div className="empty">No commands match your search.</div>}</div>
   </section>

   <section id="ai-agent" className="ai-agent">
    <div className="section-head"><div><h2>AI Command Agent</h2><p>Describe any Minecraft command in plain language and let AI build it.</p></div><span className="badge">AI • JAVA</span></div>
    <div className="ai-panel">
     <div className="ai-intro">
      <div className="ai-icon">✦</div>
      <div><strong>What do you want to create?</strong><span>Example: “Summon a zombie with full netherite armor and a Sharpness 10 sword.”</span></div>
     </div>
     <div className="ai-input-wrap">
      <textarea value={aiPrompt} onChange={e=>setAiPrompt(e.target.value)} onKeyDown={e=>{if((e.ctrlKey||e.metaKey)&&e.key==="Enter")generateAI()}} placeholder="Describe the command you want..."/>
      <button className="primary ai-generate" onClick={generateAI} disabled={aiLoading||!aiPrompt.trim()}>{aiLoading?"GENERATING...":"GENERATE COMMAND"}</button>
     </div>
     {aiError&&<div className="ai-error">{aiError}</div>}
     {aiCommand&&<div className="ai-result">
      <div className="ai-result-head"><span><em></em> GENERATED COMMAND</span><small>{version}</small></div>
      <pre>{aiCommand}</pre>
      <div className="console-actions"><button className="primary" onClick={()=>navigator.clipboard?.writeText(aiCommand)}>COPY COMMAND</button><button onClick={()=>setAiCommand("")}>CLEAR</button></div>
     </div>}
    </div>
   </section>

   <section id="workspace" className="workspace"><div className="section-head"><div><h2>Command Generator</h2><p>Build a Minecraft Java command for the selected version.</p></div><span className="badge">COMMAND ONLY</span></div><div className="workspace-grid"><div className="panel editor">{editor()}</div><div className="panel console"><div className="console-head"><span><em></em> LIVE COMMAND</span><small>{version}</small></div><pre>{command}</pre><div className="console-actions"><button className="primary" onClick={copy}>COPY COMMAND</button><button onClick={save}>＋ SAVE</button></div></div></div></section>
   <footer>VOXELTOOLS <span>•</span> Built for Minecraft Java creators</footer>
  </main>
 </div>
}
export default App;
