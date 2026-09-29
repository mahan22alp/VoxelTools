import {versionAtLeast} from "./versionResolver";
import {minecraftCommands} from "../data/commands";
import {isCommandAvailable} from "./versionResolver";

type Form=Record<string,string>;

export function generateToolCommand(tool:string,form:Form,version:string){
  const f=form,p=f.player||"@p";
  switch(tool){
    case"give":{
      const item=f.item||"item",count=f.count||"1",components=(f.components||"").trim();
      if(components&&!versionAtLeast(version,"1.20.5")) return "// Item components require Minecraft Java 1.20.5+.";
      return "/give "+p+" "+item+(components?"["+components+"]":"")+" "+count;
    }
    case"summon":
      return "/summon "+(f.mob||"zombie")+" "+(f.x||"~")+" "+(f.y||"~")+" "+(f.z||"~");
    case"enchant":
      return "/enchant "+p+" "+(f.enchant||"enchantment")+" "+(f.level||"1");
    case"effect":
      return versionAtLeast(version,"1.13")
        ? "/effect give "+p+" "+(f.effect||"speed")+" "+(f.duration||"30")+" "+(f.amplifier||"1")
        : "/effect "+p+" "+(f.effect||"speed")+" "+(f.duration||"30")+" "+(f.amplifier||"1");
    case"fill":
      if(!versionAtLeast(version,"1.8")) return "// /fill is not available in Minecraft Java "+version;
      return "/fill "+(f.x1||"~")+" "+(f.y1||"~")+" "+(f.z1||"~")+" "+(f.x2||"~")+" "+(f.y2||"~")+" "+(f.z2||"~")+" "+(f.block||"stone");
    case"teleport":
      return "/tp "+p+" "+(f.x||"0")+" "+(f.y||"64")+" "+(f.z||"0");
    default:
      return "";
  }
}
