import type {CSSProperties} from 'react';

type Bi={en:string;fa:string};
export type Motif='all'|'blocks'|'prism'|'combat'|'frost'|'shulker'|'colors'|'water'|'village'|'bees'|'portal'|'geode'|'depth'|'sculk'|'cherry'|'vault'|'bundle'|'pale'|'garden'|'sky'|'copper'|'neon';
export type Fx='none'|'snow'|'petals'|'embers'|'bubbles'|'fireflies'|'spores'|'stars';
export type Era={id:string;version:string;name:Bi;range:string;motif:Motif;fx:Fx;fxCount:number;seed:number;hint:Bi;accent:string;accent2:string;deep:string;glow:string};
export type Group={key:string;versions:string[];name:Bi;motif:Motif;fx:Fx;hue:number;sat?:number};

// Short instruction shown under each interactive panel.
export const hints:Record<Motif,Bi>={
  all:{en:'',fa:''},
  blocks:{en:'Click blocks to change them',fa:'برای تغییر بلوک‌ها کلیک کنید'},
  prism:{en:'Click blocks to change them',fa:'برای تغییر بلوک‌ها کلیک کنید'},
  combat:{en:'Click when the ring is full',fa:'وقتی حلقه پر شد کلیک کنید'},
  frost:{en:'Click the crystal five times to freeze',fa:'برای یخ زدن پنج بار روی کریستال کلیک کنید'},
  shulker:{en:'Click the box to open it',fa:'برای باز کردن جعبه کلیک کنید'},
  colors:{en:'Pick a dye color',fa:'یک رنگ انتخاب کنید'},
  water:{en:'Click the water',fa:'روی آب کلیک کنید'},
  village:{en:'Ring the bell. Three rings call a raid.',fa:'زنگ را بزنید؛ سه بار یعنی حمله.'},
  bees:{en:'Click cells to fill the honeycomb',fa:'برای پر کردن کندو روی خانه‌ها کلیک کنید'},
  portal:{en:'Click the portal to light it',fa:'برای روشن کردن پورتال کلیک کنید'},
  geode:{en:'Click to grow the crystals',fa:'برای رشد کریستال‌ها کلیک کنید'},
  depth:{en:'Drag to dig deeper',fa:'برای حفاری عمیق‌تر بکشید'},
  sculk:{en:'Click to make noise. Do not wake the Warden.',fa:'برای ایجاد صدا کلیک کنید؛ وردن را بیدار نکنید.'},
  cherry:{en:'Click to brush the sand',fa:'برای کشیدن قلم‌مو روی شن کلیک کنید'},
  vault:{en:'Click the vault to open it',fa:'برای باز کردن والت کلیک کنید'},
  bundle:{en:'Click to add items to the bundle',fa:'برای افزودن آیتم به بسته کلیک کنید'},
  pale:{en:'Hover the tree. Click to make it stir.',fa:'نشانگر را روی درخت ببرید؛ برای تکان دادن کلیک کنید.'},
  garden:{en:'Click the bush',fa:'روی بوته کلیک کنید'},
  sky:{en:'Click the ghast',fa:'روی گست کلیک کنید'},
  copper:{en:'Click to oxidize the copper',fa:'برای اکسید شدن مس کلیک کنید'},
  neon:{en:'Move your cursor over the grid',fa:'نشانگر را روی شبکه ببرید'}
};

// Every Minecraft version belongs to exactly one group. A group shares a panel, but each
// version inside it still gets its own hue, particle layout and animation timing.
export const groups:Group[]=[
  {key:'g17',versions:['1.7.10'],name:{en:'The Classic',fa:'کلاسیک'},motif:'blocks',fx:'none',hue:105},
  {key:'g18',versions:['1.8','1.8.9'],name:{en:'Bountiful Update',fa:'آپدیت فراوانی'},motif:'prism',fx:'bubbles',hue:150},
  {key:'g19',versions:['1.9.4'],name:{en:'Combat Update',fa:'آپدیت نبرد'},motif:'combat',fx:'stars',hue:240},
  {key:'g110',versions:['1.10.2'],name:{en:'Frostburn Update',fa:'آپدیت فراست‌برن'},motif:'frost',fx:'snow',hue:204},
  {key:'g111',versions:['1.11.2'],name:{en:'Exploration Update',fa:'آپدیت اکتشاف'},motif:'shulker',fx:'spores',hue:285},
  {key:'g112',versions:['1.12.2'],name:{en:'World of Color',fa:'دنیای رنگ‌ها'},motif:'colors',fx:'petals',hue:300},
  {key:'g113',versions:['1.13.2'],name:{en:'Update Aquatic',fa:'آپدیت آبی'},motif:'water',fx:'bubbles',hue:184},
  {key:'g114',versions:['1.14.4'],name:{en:'Village & Pillage',fa:'روستا و غارت'},motif:'village',fx:'fireflies',hue:68},
  {key:'g115',versions:['1.15.2'],name:{en:'Buzzy Bees',fa:'زنبورهای وزوزی'},motif:'bees',fx:'fireflies',hue:46},
  {key:'g116',versions:['1.16.1','1.16.2','1.16.3','1.16.4','1.16.5'],name:{en:'Nether Update',fa:'آپدیت نِدر'},motif:'portal',fx:'embers',hue:6},
  {key:'g117',versions:['1.17','1.17.1'],name:{en:'Caves & Cliffs: Part I',fa:'غارها و صخره‌ها: بخش اول'},motif:'geode',fx:'stars',hue:274},
  {key:'g118',versions:['1.18','1.18.1','1.18.2'],name:{en:'Caves & Cliffs: Part II',fa:'غارها و صخره‌ها: بخش دوم'},motif:'depth',fx:'spores',hue:138},
  {key:'g119',versions:['1.19','1.19.1','1.19.2','1.19.3','1.19.4'],name:{en:'The Wild Update',fa:'آپدیت دنیای وحشی'},motif:'sculk',fx:'spores',hue:172},
  {key:'g120',versions:['1.20','1.20.1','1.20.2','1.20.3','1.20.4'],name:{en:'Trails & Tales',fa:'ردپاها و داستان‌ها'},motif:'cherry',fx:'petals',hue:336},
  {key:'g1205',versions:['1.20.5','1.20.6'],name:{en:'Armored Paws',fa:'پنجه‌های زره‌پوش'},motif:'cherry',fx:'fireflies',hue:22},
  {key:'g121',versions:['1.21','1.21.1'],name:{en:'Tricky Trials',fa:'آزمون‌های حیله‌گر'},motif:'vault',fx:'embers',hue:28},
  {key:'g1212',versions:['1.21.2','1.21.3'],name:{en:'Bundles of Bravery',fa:'بسته‌های شجاعت'},motif:'bundle',fx:'petals',hue:58},
  {key:'g1214',versions:['1.21.4'],name:{en:'Pale Garden',fa:'باغ رنگ‌پریده'},motif:'pale',fx:'spores',hue:200,sat:16},
  {key:'g1215',versions:['1.21.5'],name:{en:'Spring to Life',fa:'بهار زنده'},motif:'garden',fx:'fireflies',hue:96},
  {key:'g1216',versions:['1.21.6','1.21.7','1.21.8'],name:{en:'Chase the Skies',fa:'تعقیب آسمان‌ها'},motif:'sky',fx:'bubbles',hue:198},
  {key:'g1219',versions:['1.21.9','1.21.10'],name:{en:'The Copper Age',fa:'عصر مس'},motif:'copper',fx:'embers',hue:16},
  {key:'g12111',versions:['1.21.11'],name:{en:'Winter Drop',fa:'آپدیت زمستانی'},motif:'copper',fx:'snow',hue:252},
  {key:'g26',versions:['26.1','26.1.1','26.2','26.3'],name:{en:'Next Generation',fa:'نسل بعدی'},motif:'neon',fx:'stars',hue:226}
];

// Default look, used for All versions. The colors match the base site theme.
export const allEra:Era={id:'all',version:'All versions',name:{en:'All versions',fa:'همه نسخه‌ها'},range:'1.7.10 – 26.3',motif:'all',fx:'none',fxCount:0,seed:0,hint:hints.all,accent:'#5f55c9',accent2:'#8178df',deep:'#4d43b3',glow:'#d8d3fa'};

const hsl=(h:number,s:number,l:number)=>`hsl(${Math.round(((h%360)+360)%360)} ${s}% ${l}%)`;
const hashOf=(v:string)=>v.split('').reduce((a,c)=>(a*31+c.charCodeAt(0))%9973,7);

// Maps a version such as 1.16.3 to its own look: group panel plus a per-version hue and seed.
export function eraFor(version:string):Era{
  const group=groups.find(g=>g.versions.indexOf(version)>=0);
  if(!group)return allEra;
  const idx=group.versions.indexOf(version),n=group.versions.length;
  const step=n>1?Math.min(10,60/(n-1)):0;
  const h=group.hue+idx*step,s=group.sat===undefined?62:group.sat;
  const seed=hashOf(version);
  return {
    id:'v-'+version.split('.').join('_'),version,name:group.name,range:version,motif:group.motif,fx:group.fx,
    fxCount:group.fx==='none'?0:14+(seed%10),seed,hint:hints[group.motif],
    accent:hsl(h,s,42),accent2:hsl(h+14,s,56),deep:hsl(h-8,Math.min(100,s+4),28),glow:hsl(h,Math.min(90,s+16),82)
  };
}

// CSS variables that re-color the whole site for the selected version.
export function eraVars(era:Era):CSSProperties{
  if(era.id==='all')return {};
  return {'--accent':era.accent,'--accent-2':era.accent2,'--deep':era.deep,'--glow':era.glow} as CSSProperties;
}
