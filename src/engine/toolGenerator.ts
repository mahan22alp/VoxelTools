import {isCommandAvailable,versionAtLeast} from "./versionResolver";

type Form=Record<string,string>;

export function generateToolCommand(tool:string,form:Form,version:string){
  const f=form,p=f.player||"@p";
  const def={
    give:"give",summon:"summon",enchant:"enchant",effect:"effect",fill:"fill",teleport:"teleport"
  }[tool];
  if(def){
    const commandName=def;
    const match={name:commandName} as never;
  }
  switch(tool){
    case"give":
      return "/give "+p+" "+(f.item||"item")+" "+(f.count||"1");
    case"summon":
      return "/summon "+(f.mob||"zombie")+" "+(f.x||"~")+" "+(f.y||"~")+" "+(f.z||"~");
    case"enchant":
      return "/enchant "+p+" "+(f.enchant||"enchantment")+" "+(f.level||"1");
    case"effect":
      if(versionAtLeast(version,"1.13")) return "/effect give "+p+" "+(f.effect||"speed")+" "+(f.duration||"30")+" "+(f.amplifier||"1");
      return "/effect "+p+" "+(f.effect||"speed")+" "+(f.duration||"30")+" "+(f.amplifier||"1");
    case"fill":
      if(!versionAtLeast(version,"1.8")) return "// /fill is not available in Minecraft Java "+version;
      return "/fill "+(f.x1||"~")+" "+(f.y1||"~")+" "+(f.z1||"~")+" "+(f.x2||"~")+" "+(f.y2||"~")+" "+(f.z2||"~")+" "+(f.block||"stone");
    case"teleport":
      return "/tp "+p+" "+(f.x||"0")+" "+(f.y||"64")+" "+(f.z||"0");
    default:
      return "";
  }
}