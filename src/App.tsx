import {useEffect,useMemo,useState} from "react";

type Tool={id:string;name:string;icon:string;desc:string};
type MinecraftCommand={name:string;syntax:string;category:string;desc:string;versions:string;syntaxByVersion?:Record<string,string>};

const tools:Tool[]=[
{id:"command",name:"Command Generator",icon:"⌘",desc:"Build common Minecraft commands"},
{id:"give",name:"Give Generator",icon:"◆",desc:"Create /give item commands"},
{id:"summon",name:"Summon Generator",icon:"✦",desc:"Create mob summon commands"},
{id:"enchant",name:"Enchant Generator",icon:"✧",desc:"Add enchantments to items"},
{id:"effect",name:"Effect Generator",icon:"◈",desc:"Apply potion effects"},
{id:"fill",name:"Fill Generator",icon:"▦",desc:"Generate fill commands"},
{id:"teleport",name:"Teleport Generator",icon:"➤",desc:"Create /tp commands"}
];

const mobs=["zombie","skeleton","creeper","spider","enderman","warden","iron_golem"];
const items=["diamond_sword","netherite_sword","diamond_pickaxe","netherite_pickaxe","diamond_helmet","netherite_chestplate","elytra","golden_apple"];
const enchants=["sharpness","protection","efficiency","unbreaking","fortune","mending","fire_aspect","looting"];
const effects=["speed","strength","haste","regeneration","resistance","fire_resistance","night_vision","jump_boost"];

const itemAliases:Record<string,string>={
 sword:"diamond_sword","swords":"diamond_sword","diamond sword":"diamond_sword","diamond swords":"diamond_sword","diamond_sword":"diamond_sword",
 "netherite sword":"netherite_sword","netherite swords":"netherite_sword","netherite_sword":"netherite_sword",
 pickaxe:"diamond_pickaxe","pickaxes":"diamond_pickaxe","diamond pickaxe":"diamond_pickaxe","diamond pickaxes":"diamond_pickaxe","netherite pickaxe":"netherite_pickaxe",
 helmet:"diamond_helmet","helmets":"diamond_helmet","diamond helmet":"diamond_helmet","diamond helmets":"diamond_helmet",
 elytra:"elytra","golden apple":"golden_apple","golden apples":"golden_apple","apple":"apple","apples":"apple",
 diamond:"diamond","diamonds":"diamond","emerald":"emerald","emeralds":"emerald","iron":"iron_ingot","iron ingot":"iron_ingot","iron ingots":"iron_ingot",
 gold:"gold_ingot","gold ingot":"gold_ingot","gold ingots":"gold_ingot","netherite":"netherite_ingot","netherite ingot":"netherite_ingot","netherite ingots":"netherite_ingot"
};

function naturalCommand(input:string){
 const s=input.trim().toLowerCase().replace(/[?!.]/g,"").replace(/\s+/g," ");
 if(!s) return "/give @p minecraft:diamond_sword 1";
 if(s.startsWith("/")) return input.trim();
 if(/\b(set|change)\b.*\btime\b/.test(s)){
   if(s.includes("night")) return "/time set night";
   if(s.includes("noon")) return "/time set noon";
   if(s.includes("midnight")) return "/time set midnight";
   if(s.includes("day")) return "/time set day";
 }
 const mode=s.match(/\b(creative|survival|adventure|spectator)\b/);
 if(mode) return `/gamemode ${mode[1]} @p`;
 if(/^(give|get)\b/.test(s)){
   const match=s.match(/^(?:give|get)(?:\s+me)?\s+(?:(\d+)\s+)?(.+?)(?:\s+(\d+))?$/);
   if(match){
     const count=match[1]||match[3]||"1";
     const raw=match[2].trim().replace(/\b(a|an|some|please|minecraft)\b/g,"").replace(/\s+/g," ").trim();
     const key=Object.keys(itemAliases).sort((a,b)=>b.length-a.length).find(k=>raw===k||raw.includes(k));
     const item=key?itemAliases[key]:(raw.includes(":")?raw:`minecraft:${raw.replace(/\s+/g,"_")}`);
     return `/give @p ${item} ${count}`;
   }
 }
 const commandNames=minecraftCommands.map(c=>c.name).sort((a,b)=>b.length-a.length);
 const direct=commandNames.find(name=>s===name||s.startsWith(name+" "));
 if(direct){const rest=s.slice(direct.length).trim();return rest?`/${direct} ${rest}`:`/${direct}`;}
 const naturalAliases:Record<string,string>={
   "change weather":"weather","set weather":"weather","make it rain":"weather","clear weather":"weather",
   "set difficulty":"difficulty","set game mode":"gamemode","change game mode":"gamemode",
   teleport:"tp",tp:"tp",kill:"kill",summon:"summon",give:"give",enchant:"enchant",
   "set block":"setblock","set a block":"setblock","fill area":"fill","set world spawn":"setworldspawn",
   "set spawn":"spawnpoint","set time":"time","change time":"time","set gamerule":"gamerule",
   "find structure":"locate","find biome":"locate","play sound":"playsound","send message":"tellraw",
   "clear inventory":"clear",experience:"experience",xp:"xp",particle:"particle"
 };
 const alias=Object.keys(naturalAliases).sort((a,b)=>b.length-a.length).find(a=>s.startsWith(a));
 if(alias){const name=naturalAliases[alias];const rest=s.slice(alias.length).trim();if(rest)return `/${name} ${rest}`;}
 return `// Try "weather rain", "summon zombie", "tp @p 0 64 0", or "give me diamonds"`;
}

const versionOrder=["1.7.10","1.8.9","1.9.4","1.10.2","1.11.2","1.12.2","1.13.2","1.14.4","1.15.2","1.16.5","1.17.1","1.18.2","1.19.4","1.20.1","1.20.2","1.20.4","1.20.5","1.20.6","1.21","1.21.1","1.21.2","1.21.3","1.21.4","1.21.5","1.21.6","1.21.7","1.21.8","1.21.9","1.21.10","1.21.11","26.1","26.1.1","26.2","26.3"];
function versionKey(v:string){return v==="All versions"?"1.21.11":v}
function versionAtLeast(v:string,target:string){
 const a=versionKey(v).split(".").map(Number),b=target.split(".").map(Number);
 for(let i=0;i<Math.max(a.length,b.length);i++){const x=a[i]||0,y=b[i]||0;if(x!==y)return x>y}
 return true;
}
function syntaxFor(c:MinecraftCommand,v:string){
 const table=c.syntaxByVersion;if(!table)return c.syntax;
 const keys=Object.keys(table).filter(k=>versionAtLeast(v,k)).sort((a,b)=>versionOrder.indexOf(a)-versionOrder.indexOf(b));
 return keys.length?table[keys[keys.length-1]]:c.syntax;
}

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
{name:"gamerule",syntax:"/gamerule <rule> [value]",category:"World",desc:"Read or change a game rule.",versions:"Java",syntaxByVersion:{"1.21.11":"/gamerule <rule> [value] · namespaced snake_case rule names"}},
{name:"give",syntax:"/give <targets> <item> [count]",category:"Players",desc:"Give items to players.",versions:"Java",syntaxByVersion:{"1.20.5":"/give <targets> <item>[components] [count]"}},
{name:"help",syntax:"/help [command]",category:"Server",desc:"Show command help.",versions:"Java"},
{name:"item",syntax:"/item <target> <slot> <replace|modify> ...",category:"Players",desc:"Replace or modify items in entity or block slots.",versions:"Java",syntaxByVersion:{"1.20.5":"/item <target> <slot> <replace|modify> ..."}},
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
{name:"place",syntax:"/place <feature|jigsaw|structure|template|configured>",category:"World",desc:"Place configured world-generation elements.",versions:"Java"},
{name:"playsound",syntax:"/playsound <sound> <source> <targets> [pos] [volume] [pitch] [minVolume]",category:"Audio",desc:"Play a sound for selected players.",versions:"Java"},
{name:"publish",syntax:"/publish [port]",category:"Server",desc:"Open a single-player world to LAN.",versions:"Java"},
{name:"random",syntax:"/random <roll|sequence> ...",category:"Logic",desc:"Generate random values or sequences.",versions:"Java"},
{name:"recipe",syntax:"/recipe <give|take> <targets> <recipe|*>",category:"Players",desc:"Give or take crafting recipes.",versions:"Java"},
{name:"reload",syntax:"/reload",category:"Data",desc:"Reload data packs and server data.",versions:"Java"},
{name:"ride",syntax:"/ride <target> <mount|dismount|...>",category:"Entities",desc:"Control entity riding relationships.",versions:"Java"},
{name:"save-all",syntax:"/save-all [flush]",category:"Server",desc:"Save world data to disk.",versions:"Java"},
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

const versionOptions=["All versions","1.21.11","1.21.10","1.21.9","1.21.8","1.21.7","1.21.6","1.21.5","1.21.4","1.21.3","1.21.2","1.21.1","1.21","1.20.6","1.20.5","1.20.4","1.20.2","1.20.1","1.20","1.19.4","1.19.3","1.19.2","1.19.1","1.19","1.18.2","1.18.1","1.18","1.17.1","1.17","1.16.5","1.16.4","1.16.3","1.16.2","1.16.1","1.15.2","1.14.4","1.13.2","1.12.2","1.11.2","1.10.2","1.9.4","1.8.9","1.7.10"];

function App(){
 const [tool,setTool]=useState("command"),[page,setPage]=useState<"home"|"generator">(()=>{try{return localStorage.getItem("voxeltools-page")==="generator"?"generator":"home"}catch{return "home"}}),[query,setQuery]=useState(""),[version,setVersion]=useState("1.21.11");
 const [commandQuery,setCommandQuery]=useState(""),[category,setCategory]=useState("All");
 const [dark,setDark]=useState(false),[mobile,setMobile]=useState(false),[saved,setSaved]=useState<string[]>([]),[scrollProgress,setScrollProgress]=useState(0),[copied,setCopied]=useState(false);
 const [form,setForm]=useState<Record<string,string>>({player:"@p",item:"diamond_sword",count:"1",mob:"zombie",enchant:"sharpness",level:"4",effect:"speed",duration:"30",amplifier:"1",x:"~",y:"~",z:"~",x1:"~",y1:"~",z1:"~",x2:"~",y2:"~",z2:"~",block:"stone"});
 const [naturalInput,setNaturalInput]=useState("give me sword"),[generated,setGenerated]=useState("/give @p minecraft:diamond_sword 1");
 useEffect(()=>{const onScroll=()=>{const max=document.documentElement.scrollHeight-window.innerHeight;setScrollProgress(max>0?Math.min(100,Math.max(0,window.scrollY/max*100)):0)};onScroll();window.addEventListener("scroll",onScroll,{passive:true});return()=>window.removeEventListener("scroll",onScroll)},[]);
 useEffect(()=>{const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting)entry.target.classList.add("in-view")}),{threshold:.12,rootMargin:"0px 0px -35px 0px"});document.querySelectorAll(".reveal").forEach(el=>observer.observe(el));return()=>observer.disconnect()},[]);
 const categories=useMemo(()=>["All",...Array.from(new Set(minecraftCommands.map(c=>c.category)))],[]);
 const allCommands=useMemo(()=>minecraftCommands.filter(c=>(category==="All"||c.category===category)&&(c.name+" "+syntaxFor(c,version)+" "+c.desc).toLowerCase().includes(commandQuery.toLowerCase())),[category,commandQuery,version]);
 const set=(k:string,v:string)=>setForm(f=>({...f,[k]:v}));
 const command=useMemo(()=>{
  const f=form,p=f.player||"@p";
  switch(tool){
   case"give":return `/give ${p} ${f.item||"diamond_sword"} ${f.count||"1"}`;
   case"summon":return `/summon ${f.mob||"zombie"} ${f.x||"~"} ${f.y||"~"} ${f.z||"~"}`;
   case"enchant":return `/enchant ${p} ${f.enchant||"sharpness"} ${f.level||"4"}`;
   case"effect":return `/effect give ${p} ${f.effect||"speed"} ${f.duration||"30"} ${f.amplifier||"1"}`;
   case"fill":return `/fill ${f.x1||"~"} ${f.y1||"~"} ${f.z1||"~"} ${f.x2||"~"} ${f.y2||"~"} ${f.z2||"~"} ${f.block||"stone"}`;
   case"teleport":return `/tp ${p} ${f.x||"0"} ${f.y||"64"} ${f.z||"0"}`;
   default:return generated;
  }
 },[tool,form,generated]);
 const copy=()=>{navigator.clipboard?.writeText(command);setCopied(true);window.setTimeout(()=>setCopied(false),1200)};
 const save=()=>{const n=[...new Set([command,...saved])].slice(0,20);setSaved(n);localStorage.setItem("voxeltools-saved",JSON.stringify(n));};
 const field=(label:string,key:string,opts?:string[])=> <label className="field"><span>{label}</span>{opts?<select value={form[key]||opts[0]} onChange={e=>set(key,e.target.value)}>{opts.map(o=><option key={o}>{o}</option>)}</select>:<input value={form[key]||""} onChange={e=>set(key,e.target.value)} />}</label>;
 const editor=()=>{
  if(tool==="give")return <div className="grid">{field("Player","player")} {field("Item","item",items)} {field("Count","count")}</div>;
  if(tool==="summon")return <div className="grid">{field("Mob","mob",mobs)} {field("X","x")} {field("Y","y")} {field("Z","z")}</div>;
  if(tool==="enchant")return <div className="grid">{field("Player","player")} {field("Enchantment","enchant",enchants)} {field("Level","level")}</div>;
  if(tool==="effect")return <div className="grid">{field("Player","player")} {field("Effect","effect",effects)} {field("Duration","duration")} {field("Amplifier","amplifier")}</div>;
  if(tool==="fill")return <div className="grid">{field("From X","x1")} {field("From Y","y1")} {field("From Z","z1")} {field("To X","x2")} {field("To Y","y2")} {field("To Z","z2")} {field("Block","block")}</div>;
  if(tool==="teleport")return <div className="grid">{field("Player","player")} {field("X","x")} {field("Y","y")} {field("Z","z")}</div>;
  return <div className="natural-editor"><label className="field wide"><span>Describe what you want</span><input aria-label="Describe a command" value={naturalInput} onChange={e=>{setNaturalInput(e.target.value);setGenerated(naturalCommand(e.target.value))}} placeholder="e.g. set time to night"/></label><p className="hint">Live generation · offline · version selector stays global</p></div>;
 };
 const switchPage=(next:"home"|"generator")=>{setPage(next);localStorage.setItem("voxeltools-page",next);window.scrollTo({top:0,behavior:"smooth"});setMobile(false)};
 return <div className={dark?"app dark":"app"}>
  <header className="site-header"><div className="scroll-progress"><span style={{width:`${scrollProgress}%`}} /></div><div className="header-inner">
   <button className="mobile-menu" onClick={()=>setMobile(true)} aria-label="Open menu">☰</button>
   <button className="brand" onClick={()=>switchPage("home")}><span className="brand-mark">V</span><span>Voxel<span>Tools</span></span></button>
   <nav className={mobile?"main-nav open":"main-nav"}><button className={page==="home"?"nav active":"nav"} onClick={()=>switchPage("home")}>Home</button><button className={page==="generator"?"nav active":"nav"} onClick={()=>switchPage("generator")}>Command Generator</button><a className="nav" href="#commands" onClick={()=>{setPage("home");localStorage.setItem("voxeltools-page","home")}}>Commands</a><button className="nav close-nav" onClick={()=>setMobile(false)}>Close</button></nav>
   <div className="header-actions"><span className="version-label">Minecraft Java</span><select value={version} onChange={e=>setVersion(e.target.value)}>{versionOptions.map(v=><option key={v}>{v}</option>)}</select><button className="theme-toggle" onClick={()=>setDark(!dark)} aria-label="Toggle theme">{dark?"☀":"◐"}</button></div>
  </div></header>

  <main>
   <section className="hero section-wrap reveal in-view">
    <div className="hero-copy"><div className="eyebrow"><span></span>MINECRAFT COMMAND TOOLS</div><h1>All Minecraft<br/><strong>commands.</strong></h1><p>Build, search and generate Java commands in one focused workspace.</p><div className="hero-actions"><button className="primary-action" onClick={()=>switchPage("generator")}>Open Generator <span>↗</span></button><button className="secondary-action" onClick={()=>document.getElementById("commands")?.scrollIntoView({behavior:"smooth"})}>Browse Commands</button></div><div className="hero-note"><span>01</span><div><b>Offline & fast</b><small>No account. No backend. Just useful tools.</small></div></div></div>
    <div className="hero-art" aria-hidden="true" onMouseMove={e=>{const r=e.currentTarget.getBoundingClientRect();const x=e.clientX-r.left-r.width/2;const y=e.clientY-r.top-r.height/2;e.currentTarget.style.setProperty("--px",`${x/18}px`);e.currentTarget.style.setProperty("--py",`${y/18}px`);}} onMouseLeave={e=>{e.currentTarget.style.setProperty("--px","0px");e.currentTarget.style.setProperty("--py","0px")}}><div className="art-grid"></div><div className="art-card"><span>JAVA</span><b>{version==="All versions"?"ALL":version}</b><small>VERSION READY</small></div><div className="art-orbit orbit-a"></div><div className="art-orbit orbit-b"></div><div className="art-block block-a"></div><div className="art-block block-b"></div></div>
   </section>

   {page==="home" ? <section className="page-view home-page">
    <section className="feature-strip section-wrap reveal"><div><small>01</small><b>Offline & Fast</b><span>Runs locally in your browser.</span></div><div><small>02</small><b>Complete Commands</b><span>Searchable Java command reference.</span></div><div><small>03</small><b>Version Support</b><span>Syntax changes follow the selector.</span></div><div><small>04</small><b>Simple & Clean</b><span>Swiss-inspired, distraction-free UI.</span></div></section>
    <section id="commands" className="command-index section-wrap reveal"><div className="section-kicker">COMMAND LIBRARY</div><div className="section-title-row"><div><h2>Every command.<br/><em>One clean reference.</em></h2><p>Search syntax, filter categories and copy exactly what you need.</p></div><span className="count-badge">{allCommands.length} MATCHES</span></div>
     <div className="command-controls"><label className="search-field"><span>⌕</span><input placeholder="Search commands, syntax or description..." value={commandQuery} onChange={e=>setCommandQuery(e.target.value)}/></label><select value={category} onChange={e=>setCategory(e.target.value)}>{categories.map(c=><option key={c}>{c}</option>)}</select></div>
     <div className="command-list">{allCommands.map(c=><article className="command-row" key={c.name}><div className="command-number">/{c.name}</div><div className="command-content"><code>{syntaxFor(c,version)}</code><p>{c.desc}</p></div><div className="command-meta"><span>{version==="All versions"?"ALL":version}</span><button onClick={()=>navigator.clipboard?.writeText(syntaxFor(c,version))}>Copy</button></div></article>)}{!allCommands.length&&<div className="empty">No commands match your search.</div>}</div>
    </section>
    <section className="tools-section section-wrap reveal"><div className="section-kicker">EXPLORE MORE</div><div className="tools-heading"><h2>Powerful tools<br/><em>for every player.</em></h2><div className="tools-grid">{tools.map(t=><button className="tool-tile" key={t.id} onClick={()=>{setTool(t.id);switchPage("generator")}}><span>{t.icon}</span><div><b>{t.name}</b><small>{t.desc}</small></div><i>↗</i></button>)}</div></div></section>
   </section> :
   <section key="generator" className="page-view generator-page section-wrap reveal in-view"><div className="generator-shell"><div className="section-kicker">COMMAND GENERATOR</div><div className="generator-title"><div><h2>Generate any<br/><em>Minecraft command.</em></h2><p>Describe what you want in normal English and get a command instantly.</p></div><span className="version-chip">{version}</span></div><div className="generator-layout"><div className="generator-left"><div className="natural-input"><span>✦</span><input aria-label="Command request" value={naturalInput} onChange={e=>{setNaturalInput(e.target.value);setGenerated(naturalCommand(e.target.value))}} placeholder="e.g. give me 10 diamonds, set time to night..."/></div><div className="example-row"><button onClick={()=>{setNaturalInput("set time to night");setGenerated(naturalCommand("set time to night"))}}>set time to night</button><button onClick={()=>{setNaturalInput("weather rain");setGenerated(naturalCommand("weather rain"))}}>weather rain</button><button onClick={()=>{setNaturalInput("tp @p 0 64 0");setGenerated(naturalCommand("tp @p 0 64 0"))}}>tp @p 0 64 0</button></div><div className="generator-tools"><div className="tool-picker">{tools.slice(1).map(t=><button className={tool===t.id?"tool-chip active":"tool-chip"} key={t.id} onClick={()=>setTool(t.id)}>{t.icon}<span>{t.name.replace(" Generator","")}</span></button>)}</div><div className="form-card">{editor()}</div></div></div><div className="output-card"><div className="output-top"><span><i></i>GENERATED COMMAND</span><small>{version}</small></div><pre>{command}</pre><div className="output-actions"><button className={copied?"copy-btn copied":"copy-btn"} onClick={copy}>{copied?"Copied ✓":"Copy command"}</button><button className="save-btn" onClick={save}>＋ Save</button></div><div className="output-note">Live preview updates as you type.</div></div></div></div></section>}
  </main>
  <footer className="site-footer"><div><b>Voxel<span>Tools</span></b><span> • Minecraft Java command utilities</span></div><div>Build better commands.</div></footer>
 </div>
}

export default App;
