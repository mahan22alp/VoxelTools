import {minecraftCommands} from "./commands";
import type {MinecraftCommand} from "./commands";

type Range={introduced?:string;removed?:string};

// Start versions for commands that the library lists without one.
// Kept separate from the library data so the AI Agent can be precise per version.
const ranges:Record<string,Range>={
  execute:{introduced:"1.8"},
  clone:{introduced:"1.8"},
  worldborder:{introduced:"1.8"},
  title:{introduced:"1.8"},
  particle:{introduced:"1.8"},
  spectate:{introduced:"1.8"},
  tag:{introduced:"1.9"},
  locate:{introduced:"1.11"},
  advancement:{introduced:"1.12"},
  recipe:{introduced:"1.12"},
  reload:{introduced:"1.12"},
  attribute:{introduced:"1.16"},
  item:{introduced:"1.17"}
};

// Commands that were removed in later versions, plus ones the library does not list.
const extra:MinecraftCommand[]=[
  {name:"save-on",syntax:"/save-on",category:"Server",desc:"Enable automatic world saving.",versions:"Java"},
  {name:"save-off",syntax:"/save-off",category:"Server",desc:"Disable automatic world saving.",versions:"Java"},
  {name:"achievement",removed:"1.12",syntax:"/achievement <give|take> <achievement|*> [player]",category:"Players",desc:"Give or take achievements. Replaced by advancements.",versions:"Java"},
  {name:"testfor",removed:"1.13",syntax:"/testfor <player> [dataTag]",category:"Logic",desc:"Test for a player or entity. Replaced by /execute if.",versions:"Java"},
  {name:"testforblock",removed:"1.13",syntax:"/testforblock <x> <y> <z> <block> [dataValue|state] [dataTag]",category:"Logic",desc:"Test for a block. Replaced by /execute if block.",versions:"Java"},
  {name:"testforblocks",introduced:"1.8",removed:"1.13",syntax:"/testforblocks <x1> <y1> <z1> <x2> <y2> <z2> <x> <y> <z> [masked|all]",category:"Logic",desc:"Compare two regions. Replaced by /execute if blocks.",versions:"Java"},
  {name:"toggledownfall",removed:"1.13",syntax:"/toggledownfall",category:"World",desc:"Toggle rain and snow. Replaced by /weather.",versions:"Java"},
  {name:"blockdata",introduced:"1.8",removed:"1.13",syntax:"/blockdata <x> <y> <z> <dataTag>",category:"Data",desc:"Modify block entity data. Replaced by /data.",versions:"Java"},
  {name:"entitydata",introduced:"1.8",removed:"1.13",syntax:"/entitydata <entity> <dataTag>",category:"Data",desc:"Modify entity data. Replaced by /data.",versions:"Java"},
  {name:"stats",introduced:"1.8",removed:"1.13",syntax:"/stats <block|entity> <target> <set|clear> <stat> [selector] [objective]",category:"Logic",desc:"Store command results in a scoreboard. Replaced by /execute store.",versions:"Java"},
  {name:"replaceitem",introduced:"1.8",removed:"1.17",syntax:"/replaceitem <block|entity> <target> <slot> <item> [count] [data] [dataTag]",category:"Players",desc:"Replace an item in a slot. Replaced by /item.",versions:"Java"},
  {name:"locatebiome",introduced:"1.16.2",removed:"1.19",syntax:"/locatebiome <biome>",category:"World",desc:"Find the nearest biome. Merged into /locate.",versions:"Java"}
];

export const agentCommands:MinecraftCommand[]=[
  ...minecraftCommands.map(c=>ranges[c.name]?{...c,...ranges[c.name]}:c),
  ...extra
];
