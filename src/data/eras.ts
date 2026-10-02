import type {CSSProperties} from "react";

export type EraId="all"|"classic"|"aquatic"|"nether"|"caves"|"wild"|"trials"|"next";
type Bi={en:string;fa:string};
export type Era={id:EraId;name:Bi;range:string;first:string;hint:Bi;accent:string;accent2:string;deep:string;glow:string};

// Default look, used for "All versions". The colors match the base site theme.
export const allEra:Era={id:"all",name:{en:"All versions",fa:"همه نسخه‌ها"},range:"1.7.10 – 26.3",first:"",hint:{en:"",fa:""},accent:"#5f55c9",accent2:"#8178df",deep:"#4d43b3",glow:"#d8d3fa"};

// One entry per group of versions. Each gets its own palette and its own interactive hero panel.
export const eras:Era[]=[
  {id:"classic",name:{en:"Classic Era",fa:"دوران کلاسیک"},range:"1.7.10 – 1.12.2",first:"1.7.10",hint:{en:"Click blocks to change them",fa:"برای تغییر بلوک‌ها کلیک کنید"},accent:"#3f8a2e",accent2:"#6db04e",deep:"#27631c",glow:"#bfe3a8"},
  {id:"aquatic",name:{en:"Aquatic & Villages",fa:"اقیانوس و روستا"},range:"1.13.2 – 1.15.2",first:"1.13.2",hint:{en:"Click the water",fa:"روی آب کلیک کنید"},accent:"#0b8497",accent2:"#35bfd1",deep:"#08596a",glow:"#a8e6ef"},
  {id:"nether",name:{en:"Nether Update",fa:"آپدیت نِدر"},range:"1.16.1 – 1.16.5",first:"1.16.1",hint:{en:"Click the portal to light it",fa:"برای روشن کردن پورتال کلیک کنید"},accent:"#c93a1f",accent2:"#ee6c45",deep:"#8e2412",glow:"#f3b19f"},
  {id:"caves",name:{en:"Caves & Cliffs",fa:"غارها و صخره‌ها"},range:"1.17 – 1.18.2",first:"1.17",hint:{en:"Drag to dig deeper",fa:"برای حفاری عمیق‌تر بکشید"},accent:"#7a4fd0",accent2:"#a888ef",deep:"#52318f",glow:"#d3c0f6"},
  {id:"wild",name:{en:"The Wild & Trails",fa:"دنیای وحشی"},range:"1.19 – 1.20.6",first:"1.19",hint:{en:"Click to make noise. Don't wake the Warden.",fa:"برای ایجاد صدا کلیک کنید؛ وردن را بیدار نکنید."},accent:"#139a88",accent2:"#45d1bd",deep:"#0b6a5d",glow:"#9fe6dc"},
  {id:"trials",name:{en:"Tricky Trials",fa:"آزمون‌های حیله‌گر"},range:"1.21 – 1.21.11",first:"1.21",hint:{en:"Click the vault to open it",fa:"برای باز کردن والت کلیک کنید"},accent:"#c2601a",accent2:"#ee9552",deep:"#8f420f",glow:"#f5c8a1"},
  {id:"next",name:{en:"Next Generation",fa:"نسل بعدی"},range:"26.1 – 26.3",first:"26.1",hint:{en:"Move your cursor over the grid",fa:"نشانگر را روی شبکه ببرید"},accent:"#3f5df0",accent2:"#2fc7f4",deep:"#2a3fb8",glow:"#a9bcff"}
];

const byId=(id:EraId)=>eras.find(e=>e.id===id)||allEra;

// Maps a version such as "1.16.5" or "26.2" to its group.
export function eraFor(version:string):Era{
  const parts=version.split(".").map(Number);
  const major=parts[0],minor=parts[1];
  if(!Number.isFinite(major)||!Number.isFinite(minor))return allEra;
  if(major>=26)return byId("next");
  if(minor<=12)return byId("classic");
  if(minor<=15)return byId("aquatic");
  if(minor===16)return byId("nether");
  if(minor<=18)return byId("caves");
  if(minor<=20)return byId("wild");
  return byId("trials");
}

// CSS variables that re-color the whole site for the selected group.
export function eraVars(era:Era):CSSProperties{
  if(era.id==="all")return {};
  return {"--accent":era.accent,"--accent-2":era.accent2,"--deep":era.deep,"--glow":era.glow} as CSSProperties;
}
