import '../scenery.css';

// Original painted scenery for each release. Colors that are not fixed follow the version's own palette.
function Sky({a,b}:{a:string;b:string}){
  return <><defs><linearGradient id='sk' x1='0' y1='0' x2='0' y2='1'><stop offset='0' style={{stopColor:a}}/><stop offset='1' style={{stopColor:b}}/></linearGradient></defs><rect width='400' height='300' fill='url(#sk)'/></>;
}

function Cloud({x,y,s=1,o=0.9}:{x:number;y:number;s?:number;o?:number}){
  return <g className='sc-drift' style={{animationDelay:`${-x/6}s`}}><g transform={`translate(${x} ${y}) scale(${s})`} opacity={o} fill='#fff'><ellipse rx='26' ry='9'/><ellipse cx='-14' cy='-6' rx='14' ry='9'/><ellipse cx='10' cy='-8' rx='16' ry='10'/></g></g>;
}

function scene(motif:string){
  switch(motif){
    case 'blocks':return <>
      <Sky a='#6fc0f0' b='#dff3fb'/>
      <rect x='312' y='34' width='34' height='34' fill='#ffe680' className='pulse'/>
      <Cloud x={80} y={64}/><Cloud x={250} y={96} s={0.8}/>
      <path d='M0 300V212H50V198H110V212H150V190H220V212H270V200H330V212H400V300Z' className='fb'/>
      <path d='M0 300V246H70V234H120V246H180V230H260V246H320V236H400V300Z' className='fa'/>
      <rect y='272' width='400' height='28' fill='#7a5030'/>
    </>;
    case 'prism':return <>
      <Sky a='var(--deep)' b='var(--accent)'/>
      <polygon points='120,0 170,0 260,300 60,300' fill='#fff' opacity='.08'/>
      <polygon points='250,0 290,0 380,300 290,300' fill='#fff' opacity='.07'/>
      <g className='fb' opacity='.85'><rect x='40' y='150' width='44' height='150'/><rect x='300' y='120' width='54' height='180'/><rect x='150' y='190' width='100' height='110'/></g>
      <g fill='#e8fff7' className='pulse'><rect x='56' y='170' width='12' height='12'/><rect x='320' y='140' width='14' height='14'/><rect x='190' y='214' width='16' height='16'/></g>
      <rect y='280' width='400' height='20' className='fd'/>
    </>;
    case 'combat':return <>
      <Sky a='#0d0716' b='#2a1745'/>
      <circle cx='320' cy='60' r='26' fill='#f4efd9' opacity='.9'/>
      <path d='M60 214Q120 188 200 200T360 206L350 236Q290 276 210 272T80 236Z' fill='#d9d49a'/>
      <path d='M110 224Q180 258 270 232L250 268Q190 290 140 262Z' fill='#a9a56a'/>
      <g fill='#e6e0a8'><rect x='160' y='150' width='16' height='60'/><rect x='156' y='144' width='24' height='10'/><rect x='250' y='170' width='14' height='42'/><rect x='246' y='164' width='22' height='9'/></g>
      <g className='fb pulse'><rect x='164' y='162' width='8' height='6'/><rect x='254' y='180' width='6' height='5'/></g>
    </>;
    case 'frost':return <>
      <Sky a='#0a1633' b='#1d3b6e'/>
      <path className='aurora fb' d='M-20 120Q60 50 140 100T300 70T420 110V150Q350 120 280 160T140 140T-20 160Z'/>
      <path d='M0 300V190L60 130L110 180L160 110L220 190L270 140L330 210L400 170V300Z' fill='#dfeaf7'/>
      <path d='M0 300V232L70 192L130 222L200 180L270 226L330 200L400 226V300Z' fill='#f4f9ff'/>
      <rect y='270' width='400' height='30' fill='#fff'/>
    </>;
    case 'shulker':return <>
      <Sky a='#2a1a4a' b='#c8643c'/>
      <circle cx='80' cy='190' r='34' fill='#ffd9a0' opacity='.85'/>
      <path d='M0 300V230L50 200L90 232L140 196L190 236L250 204L300 238L360 206L400 232V300Z' fill='#1b1530'/>
      <g fill='#150f26'><rect x='140' y='150' width='120' height='96'/><path d='M130 150L200 100L270 150Z'/><rect x='170' y='120' width='24' height='40'/><path d='M166 120L182 92L198 120Z'/></g>
      <g className='pulse' fill='#ffd36a'><rect x='156' y='170' width='10' height='14'/><rect x='186' y='170' width='10' height='14'/><rect x='216' y='170' width='10' height='14'/><rect x='236' y='196' width='10' height='14'/></g>
      <path d='M0 300V262H400V300Z' fill='#0e0a1c'/>
    </>;
    case 'colors':return <>
      <Sky a='#bfe4ff' b='#fdf2ff'/>
      {['#a12722','#f07613','#f8c627','#70b919','#3aafd9','#35399d','#792aac'].map((c,i)=><path key={c} d={`M${20+i*16} 300A${180-i*16} ${180-i*16} 0 0 1 ${380-i*16} 300`} fill='none' stroke={c} strokeWidth='16' opacity='.85'/>)}
      <Cloud x={70} y={250}/><Cloud x={330} y={250}/>
    </>;
    case 'water':return <>
      <Sky a='var(--glow)' b='var(--deep)'/>
      <polygon points='90,0 140,0 230,300 40,300' fill='#fff' opacity='.1'/>
      <polygon points='250,0 300,0 380,300 270,300' fill='#fff' opacity='.08'/>
      <path className='fa' opacity='.8' d='M0 300V262Q35 238 70 262T140 262T210 262T280 262T350 262T400 262V300Z'/>
      <g className='sc-sway' stroke='#2f8f57' strokeWidth='6' fill='none' strokeLinecap='round'><path d='M60 300Q46 260 60 220T60 180'/><path d='M96 300Q82 270 96 240T96 210'/><path d='M320 300Q334 256 320 214T320 168'/></g>
      <g fill='#ff7aa8'><circle cx='170' cy='284' r='10'/><circle cx='188' cy='290' r='8'/></g>
      <circle cx='240' cy='288' r='9' fill='#ffb84d'/>
    </>;
    case 'village':return <>
      <Sky a='#3a2a6a' b='#ff9a5a'/>
      <circle cx='300' cy='200' r='40' fill='#ffd9a0' opacity='.9'/>
      <path d='M0 300V236Q100 200 200 232T400 220V300Z' fill='#3d3a2a'/>
      <g fill='#2a2418'><rect x='40' y='200' width='60' height='50'/><path d='M34 200L70 168L106 200Z'/><rect x='140' y='214' width='50' height='40'/><path d='M134 214L165 190L196 214Z'/><rect x='250' y='206' width='70' height='52'/><path d='M244 206L285 172L326 206Z'/></g>
      <g className='pulse' fill='#ffd36a'><rect x='56' y='214' width='12' height='14'/><rect x='156' y='226' width='10' height='12'/><rect x='268' y='222' width='12' height='14'/><rect x='292' y='222' width='12' height='14'/></g>
    </>;
    case 'bees':return <>
      <Sky a='#8fd3f4' b='#f9f3c8'/>
      <circle cx='70' cy='60' r='26' fill='#fff1a8' className='pulse'/>
      <Cloud x={200} y={70}/>
      <path d='M0 300V220Q100 180 200 214T400 200V300Z' className='fb'/>
      <path d='M0 300V256Q120 226 240 252T400 244V300Z' className='fa'/>
      <path d='M300 150L314 142L328 150V166L314 174L300 166Z' fill='#f4c430'/>
      <path d='M288 166H340' stroke='#8a5a10' strokeWidth='3'/>
      {[40,90,150,210,270,330].map((x,i)=><circle key={x} cx={x} cy={262+(i%2)*10} r='4' fill={i%2?'#ff7aa8':'#fff'}/>)}
    </>;
    case 'portal':return <>
      <Sky a='#2a0a0a' b='#7a1c10'/>
      <path d='M0 0H400V36L370 62L340 30L300 70L250 28L200 64L150 30L100 66L60 34L20 62L0 40Z' fill='#1a0a0a'/>
      <rect y='232' width='400' height='68' className='lava'/>
      <path d='M0 232Q50 220 100 232T200 232T300 232T400 232V240H0Z' fill='#ffb23c' opacity='.7'/>
      <g fill='#1c0d0d'><rect x='30' y='150' width='34' height='100'/><rect x='84' y='176' width='26' height='76'/><rect x='300' y='140' width='40' height='112'/><rect x='352' y='180' width='28' height='72'/></g>
    </>;
    case 'geode':return <>
      <Sky a='#14101f' b='#2a2140'/>
      <path d='M0 0H400V40L370 90L340 38L300 110L260 40L220 96L180 36L140 104L100 40L60 92L30 38L0 70Z' fill='#0b0814'/>
      <circle cx='200' cy='230' r='90' className='fa pulse' opacity='.12'/>
      <path d='M70 300L90 230L110 300Z' className='fa'/><path d='M100 300L125 210L150 300Z' className='fb'/><path d='M150 300L168 244L186 300Z' className='fa'/>
      <path d='M260 300L285 220L310 300Z' className='fb'/><path d='M300 300L316 250L332 300Z' className='fa'/>
      <path d='M0 300V274H400V300Z' fill='#0b0814'/>
    </>;
    case 'depth':return <>
      <Sky a='#1b2150' b='#e08a6a'/>
      <circle cx='300' cy='110' r='30' fill='#ffe4b0' className='pulse'/>
      <path d='M0 300V200L50 140L90 180L150 90L210 190L260 130L320 200L360 160L400 190V300Z' fill='#41486e'/>
      <path d='M150 90L128 126L150 114L170 130Z' fill='#fff'/><path d='M260 130L246 156L262 146L276 158Z' fill='#fff'/>
      <path d='M0 300V240L70 200L140 236L220 196L300 240L400 214V300Z' fill='#262a48'/>
      <path d='M0 300V270L100 250L200 272L300 252L400 270V300Z' fill='#161933'/>
    </>;
    case 'sculk':return <>
      <Sky a='#04080c' b='#0b2a2e'/>
      <path d='M0 0H400V30Q370 70 340 34T280 40T220 30T160 50T100 32T40 52L0 36Z' fill='#02040a'/>
      <g className='fb pulse'><ellipse cx='60' cy='286' rx='70' ry='16'/><ellipse cx='200' cy='292' rx='90' ry='14'/><ellipse cx='340' cy='286' rx='70' ry='16'/></g>
      <g stroke='var(--accent-2)' strokeWidth='2' fill='none' opacity='.7'><path d='M40 276Q60 246 50 216'/><path d='M200 280Q182 240 194 200'/><path d='M330 276Q352 250 344 206'/></g>
      <g className='fa pulse'><circle cx='50' cy='214' r='6'/><circle cx='194' cy='198' r='7'/><circle cx='344' cy='206' r='6'/></g>
      <path d='M0 300V282H400V300Z' fill='#02060a'/>
    </>;
    case 'cherry':return <>
      <Sky a='#ffd6e6' b='#fff3f8'/>
      <circle cx='320' cy='60' r='24' fill='#fff' opacity='.85'/>
      <path d='M0 300V220Q110 186 220 218T400 206V300Z' fill='#9fd37a'/>
      <path d='M0 300V256Q120 230 240 254T400 246V300Z' fill='#7fbf5c'/>
      <g fill='#6b4426'><rect x='88' y='168' width='12' height='88'/><rect x='298' y='176' width='10' height='78'/></g>
      <g className='fb'><circle cx='94' cy='156' r='38'/><circle cx='70' cy='176' r='28'/><circle cx='120' cy='178' r='28'/><circle cx='303' cy='164' r='34'/><circle cx='326' cy='184' r='24'/></g>
      <g className='fg' opacity='.8'><circle cx='90' cy='150' r='18'/><circle cx='300' cy='158' r='16'/></g>
    </>;
    case 'vault':return <>
      <defs><pattern id='tiles' width='40' height='40' patternUnits='userSpaceOnUse'><rect width='40' height='40' fill='#2b3a3a'/><rect x='2' y='2' width='36' height='36' fill='#324545' stroke='#1c2828' strokeWidth='2'/></pattern></defs>
      <rect width='400' height='300' fill='url(#tiles)'/>
      <rect width='400' height='300' className='fd' opacity='.35'/>
      <path d='M120 300V150Q200 70 280 150V300Z' fill='#0f1717'/>
      <g className='fb pulse'><circle cx='40' cy='60' r='12'/><circle cx='360' cy='60' r='12'/><circle cx='40' cy='220' r='10'/><circle cx='360' cy='220' r='10'/></g>
      <rect y='276' width='400' height='24' className='fa' opacity='.6'/>
    </>;
    case 'bundle':return <>
      <Sky a='#ffb87a' b='#fff0d2'/>
      <circle cx='200' cy='214' r='70' fill='#ffe3a6' opacity='.9'/>
      <path d='M0 300V230Q100 200 200 226T400 214V300Z' className='fb'/>
      <path d='M0 300V262Q130 238 260 262T400 256V300Z' className='fa'/>
      <Cloud x={90} y={80}/><Cloud x={300} y={60} s={0.8}/>
    </>;
    case 'pale':return <>
      <Sky a='#b9bdbd' b='#e9ebea'/>
      {[40,120,210,300,370].map((x,i)=><g key={x} fill='#8d908c' opacity={0.5+i*0.08}><rect x={x} y={90+i*8} width='10' height='210'/><ellipse cx={x+5} cy={92+i*8} rx='44' ry='22'/></g>)}
      <ellipse className='mist' cx='120' cy='250' rx='160' ry='26' fill='#fff' opacity='.5'/>
      <ellipse className='mist' cx='300' cy='230' rx='140' ry='22' fill='#fff' opacity='.4'/>
      <circle cx='214' cy='210' r='5' fill='#ff9a3c' className='pulse'/>
      <rect y='282' width='400' height='18' fill='#6f726f'/>
    </>;
    case 'garden':return <>
      <Sky a='#1f3a5a' b='#8fd0a8'/>
      <circle cx='320' cy='70' r='20' fill='#fffbe0' opacity='.9'/>
      <path d='M0 300V226Q100 196 200 224T400 212V300Z' fill='#2f7a4a'/>
      <path d='M0 300V262Q130 238 260 262T400 252V300Z' fill='#215c38'/>
      <g className='fb'><ellipse cx='70' cy='262' rx='40' ry='18'/><ellipse cx='300' cy='258' rx='46' ry='20'/></g>
      {[30,110,170,240,350].map((x,i)=><circle key={x} cx={x} cy={270+(i%2)*8} r='3.5' fill={i%2?'#ffe066':'#ff9ec7'}/>)}
    </>;
    case 'sky':return <>
      <Sky a='#5fb4f0' b='#e9f7ff'/>
      <circle cx='320' cy='70' r='34' fill='#fff7c2' className='pulse'/>
      <Cloud x={60} y={110} s={1.4}/><Cloud x={220} y={170} s={1.8} o={0.95}/><Cloud x={340} y={240} s={1.5}/>
      <path d='M0 300V270Q100 250 200 268T400 258V300Z' fill='#fff' opacity='.9'/>
    </>;
    case 'copper':return <>
      <Sky a='#1d4a48' b='#e0a070'/>
      <circle cx='90' cy='170' r='40' fill='#ffd3a0' opacity='.85'/>
      <rect x='150' y='190' width='50' height='110' fill='#c8734a'/><rect x='200' y='160' width='50' height='140' fill='#a98a6b'/>
      <rect x='250' y='210' width='50' height='90' fill='#5e9f86'/><rect x='300' y='176' width='50' height='124' fill='#3f9f8e'/>
      <g opacity='.25' fill='#000'><rect x='150' y='190' width='50' height='10'/><rect x='200' y='160' width='50' height='10'/><rect x='250' y='210' width='50' height='10'/><rect x='300' y='176' width='50' height='10'/></g>
      <path d='M0 300V262Q100 240 200 262T400 250V300Z' fill='#2a1d14'/>
    </>;
    case 'neon':return <>
      <Sky a='#0b0720' b='#3a1060'/>
      <circle cx='200' cy='168' r='62' className='fa'/>
      <g fill='#0b0720'><rect x='130' y='150' width='140' height='6'/><rect x='130' y='170' width='140' height='8'/><rect x='130' y='192' width='140' height='10'/></g>
      <path d='M0 168L60 120L110 160L160 110L200 150L250 104L310 156L360 118L400 160' fill='none' stroke='var(--accent-2)' strokeWidth='2' opacity='.8'/>
      <rect y='200' width='400' height='100' fill='#10062a'/>
      <g className='pulse' stroke='var(--accent-2)' strokeWidth='1.5' opacity='.7'>
        {[-200,-100,0,100,200,300,400,500,600].map(x=><line key={x} x1={200+(x-200)*0.1} y1='200' x2={x} y2='300'/>)}
        {[212,226,244,268].map(y=><line key={y} x1='0' y1={y} x2='400' y2={y}/>)}
      </g>
    </>;
    case 'all':return <>
      <Sky a='var(--accent-soft)' b='var(--surface)'/>
      <path d='M0 300V230Q120 190 240 224T400 206V300Z' className='fb' opacity='.25'/>
      <path d='M0 300V262Q130 236 260 260T400 250V300Z' className='fa' opacity='.2'/>
    </>;
    default:return null;
  }
}

export default function Scenery({motif}:{motif:string}){
  return <svg className='scenery' viewBox='0 0 400 300' preserveAspectRatio='xMidYMid slice' aria-hidden='true'>{scene(motif)}</svg>;
}
