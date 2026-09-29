const itemAliases:Record<string,string>={
 sword:"diamond_sword","swords":"diamond_sword","diamond sword":"diamond_sword","diamond swords":"diamond_sword","diamond_sword":"diamond_sword",
 "netherite sword":"netherite_sword","netherite swords":"netherite_sword","netherite_sword":"netherite_sword",
 pickaxe:"diamond_pickaxe","pickaxes":"diamond_pickaxe","diamond pickaxe":"diamond_pickaxe","diamond pickaxes":"diamond_pickaxe","netherite pickaxe":"netherite_pickaxe",
 helmet:"diamond_helmet","helmets":"diamond_helmet","diamond helmet":"diamond_helmet","diamond helmets":"diamond_helmet",
 elytra:"elytra","golden apple":"golden_apple","golden apples":"golden_apple","apple":"apple","apples":"apple",
 diamond:"diamond","diamonds":"diamond","emerald":"emerald","emeralds":"emerald","iron":"iron_ingot","iron ingot":"iron_ingot","iron ingots":"iron_ingot",
 gold:"gold_ingot","gold ingot":"gold_ingot","gold ingots":"gold_ingot","netherite":"netherite_ingot","netherite ingot":"netherite_ingot","netherite ingots":"netherite_ingot"
};

export function naturalCommand(input:string){){
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
export function generateNaturalCommand(input:string){return naturalCommand(input)}
