import {versionAtLeast} from "../engine/versionResolver";

const SELECTORS = `TARGET SELECTORS: @p nearest player, @r random player, @a all players, @e all entities, @s executor (the entity running the command).
Filters: type=<id>, sort=<nearest|furthest|random|arbitrary>, limit=<n>, distance=<..10|10..|5>, level=<n..m>, gamemode=<survival|creative|adventure|spectator>, name=<"name">, tag=<tag>, team=<team>, scores={<obj>=<range>}, nbt={}, predicate=<id>, advancements={}, x,y,z + dx,dy,dz volume.
Examples: @e[type=minecraft:creeper,distance=..20], @a[gamemode=survival,level=10..], @e[type=!minecraft:player,sort=nearest,limit=3].`;

const BASICS = `COORDINATES: absolute "100 64 -200", relative "~ ~1 ~" (offset from executor), local "^ ^ ^1" (facing direction). Rotation: yaw pitch in degrees (yaw 0 = south).
BLOCK STATES: block_id[state=value,...] e.g. oak_stairs[facing=east,half=bottom,waterlogged=false].
TIME VALUES: sunrise 23000, day 1000, noon 6000, sunset 12000, night 13000, midnight 18000 (/time set <value|named>, /time add, /time query daytime).
EFFECTS: duration is in SECONDS; amplifier starts at 0 so Speed II is amplifier 1. Since 1.19.4 duration can be "infinite".
VANILLA ENCHANT MAXIMA: sharpness 5, smite 5, bane_of_arthropods 5, protection 4, blast/fire/projectile_protection 4, efficiency 5, unbreaking 3, fortune 3, looting 3, power 5, feather_falling 4, thorns 3, mending 1, fire_aspect 2, knockback 2, sweep 3 (1.21.5+). Higher levels only via the enchantments component and may misbehave.
EXECUTE PATTERNS: /execute as @a at @s if block ~ ~-1 ~ minecraft:diamond_block run effect give @s minecraft:speed 5 1 · /execute store result score <target> <objective> run <cmd> · /execute if entity @e[type=minecraft:arrow,distance=..5] run <cmd>.
GAMERULES (common): keepInventory, doDaylightCycle, doMobSpawning, mobGriefing, doFireTick, randomTickSpeed, showCoordinates (1.19+), doImmediateRespawn, doInsomnia.`;

function componentsEra():string{
 return `ITEM COMPONENTS (this version, 1.20.5+): item data lives in [square brackets] after the item id, for /give, /item, /clear and loot. Entity data still uses NBT braces.
Examples:
 /give @p minecraft:netherite_sword[minecraft:enchantments={levels:{"minecraft:sharpness":5,"minecraft:unbreaking":3}},minecraft:custom_name='{"text":"Nightfall","italic":false}'] 1
 /give @p minecraft:diamond_pickaxe[minecraft:unbreakable={},minecraft:enchantments={levels:{"minecraft:efficiency":5}}] 1
Component ids: enchantments, custom_name, lore, unbreakable, enchantment_glint_override, attribute_modifiers, food, fire_resistant, max_damage.`;
}
function nbtEra():string{
 return `ITEM NBT (this version, before 1.20.5): item data uses {braces} after the item id. Entity data also uses NBT.
Example:
 /give @p minecraft:netherite_sword{Enchantments:[{id:"minecraft:sharpness",lvl:5},{id:"minecraft:unbreaking",lvl:3}],display:{Name:'{"text":"Nightfall"}'}} 1
Use /item (not /replaceitem) to change slots.`;
}
function oldEra():string{
 return `LEGACY VERSION (before 1.13): ids use the old format (stone, diamond_sword, spaces→underscores was NOT required yet) and damage values follow the id. /testfor, /stats and /blockdata exist; /execute has no if/unless/store. Item data uses NBT braces in /give.`;
}
function migrationMap():string{
 return `ERA MIGRATION (the player asked about all versions — match the one they finally name, else prefer newest):
- 1.13+: ids flattened to snake_case with the minecraft: namespace; /testfor → /execute if; /blockdata & /entitydata → /data; /toggledownfall → /weather.
- 1.17+: /replaceitem → /item.
- 1.20.5+: item NBT braces → item components in [brackets] for /give, /item, /clear; entity NBT unchanged.`;
}

function eraRules(version:string):string{
 if(version==="All versions")return migrationMap();
 if(versionAtLeast(version,"1.20.5"))return componentsEra();
 if(versionAtLeast(version,"1.17"))return nbtEra();
 return oldEra();
}

const FEW_SHOT = `EXAMPLES OF CORRECT REPLIES (match this shape, one fenced command + short explanation):
Request: "give me a sharpness 5 unbreaking 3 diamond sword named Nightfall"
\`\`\`/give @p minecraft:diamond_sword[minecraft:enchantments={levels:{"minecraft:sharpness":5,"minecraft:unbreaking":3}},minecraft:custom_name='{"text":"Nightfall","italic":false}'] 1\`\`\`
(uses components because the example targets a modern version — swap to NBT braces for pre-1.20.5)
Request: "reward players standing on a diamond block"
\`\`\`/execute as @a at @s if block ~ ~-1 ~ minecraft:diamond_block run give @s minecraft:emerald 1\`\`\`
Runs once per player standing there; mention pairing with /schedule or a repeating command block for continuous rewards.`;

const cache=new Map<string,string>();
export function buildKnowledge(version:string):string{
 const hit=cache.get(version);
 if(hit)return hit;
 const built=[SELECTORS,BASICS,eraRules(version),FEW_SHOT].join("\n\n");
 cache.set(version,built);
 return built;
}
