/** 苔光行囊 · Mosslight Caravan. Dependency-free deterministic game rules. */
export const VERSION = 1;
export const BAG_WIDTH = 6;
export const BAG_HEIGHT = 5;
const freeze = o => { Object.freeze(o); Object.values(o).forEach(v => { if (v && typeof v === 'object' && !Object.isFrozen(v)) freeze(v); }); return o; };
export const CLASSES = freeze({
  ranger: {id:'ranger',name:'逐風遊俠',subtitle:'箭簇指向武器，連成風的路徑',description:'弓造成額外 20% 傷害。箭簇朝向的三格內，每把武器獲得 25% 傷害加成。',icon:'➶',color:'#9dc677',hp:115,primary:'bow',support:'quiver'},
  toxin: {id:'toxin',name:'蕈語藥師',subtitle:'讓毒蕈相鄰，靜候森林回應',description:'中毒傷害提高 25%。毒蕈與毒瓶相鄰時，毒瓶施毒量提高 35%。',icon:'✿',color:'#bc91cf',hp:120,primary:'vial',support:'mushroom'},
  guardian: {id:'guardian',name:'磐根守衛',subtitle:'盾牌護住兵刃，以守勢反擊',description:'獲得 3 點護甲。與盾牌相鄰的武器傷害提高 25%，盾牌帶來反傷。',icon:'⬡',color:'#c7ad72',hp:145,primary:'hammer',support:'shield'}
});
export const ITEMS = freeze({
  bow:{id:'bow',name:'枝角長弓',icon:'➶',color:'#91b96e',shape:[[0,0],[0,1],[0,2]],category:'weapon',classId:'ranger',cost:6,damage:9,cooldown:1.65,description:'每 1.65 秒射擊；遊俠的主力武器。'},
  quiver:{id:'quiver',name:'棘羽箭簇',icon:'➤',color:'#d3be7e',shape:[[0,0]],category:'support',classId:'ranger',cost:4,description:'朝箭頭方向三格內的武器，傷害 +25%。旋轉可改變方向。'},
  feather:{id:'feather',name:'風行羽葉',icon:'❧',color:'#afd6b4',shape:[[0,0],[0,1],[1,1]],category:'support',classId:'ranger',cost:5,haste:0.08,description:'全隊攻速 +8%；升階提高效果。'},
  vial:{id:'vial',name:'微光毒瓶',icon:'⚗',color:'#b798cd',shape:[[0,0],[1,0]],category:'weapon',classId:'toxin',cost:6,damage:4,cooldown:1.8,poison:1.2,description:'投擲毒液並疊加中毒。中毒每秒造成傷害，逐漸衰減。'},
  mushroom:{id:'mushroom',name:'月露毒蕈',icon:'♠',color:'#c6a4ce',shape:[[0,0],[0,1],[1,1]],category:'support',classId:'toxin',cost:4,poison:0.65,cooldown:2.8,description:'散播孢子；相鄰毒瓶施毒量 +35%。'},
  fang:{id:'fang',name:'暮蛇獠牙',icon:'⌁',color:'#9bb3a5',shape:[[0,0]],category:'support',classId:'toxin',cost:5,poisonBonus:0.15,description:'全隊中毒傷害 +15%；升階提高效果。'},
  hammer:{id:'hammer',name:'橡根戰鎚',icon:'⚒',color:'#bea173',shape:[[0,0],[1,0],[1,1]],category:'weapon',classId:'guardian',cost:6,damage:10,cooldown:1.9,description:'每 1.9 秒重擊，適合放在盾牌旁。'},
  shield:{id:'shield',name:'苔石圓盾',icon:'⬡',color:'#929f8f',shape:[[0,0],[1,0],[0,1],[1,1]],category:'armor',classId:'guardian',cost:5,armor:1.7,shield:12,thorns:2,description:'提供護甲、開場護盾與反傷。相鄰武器傷害 +25%。'},
  stone:{id:'stone',name:'暖心礦石',icon:'◆',color:'#cfb984',shape:[[0,0]],category:'armor',classId:'guardian',cost:4,hp:18,description:'最大生命 +18；升階提高效果。'},
  dagger:{id:'dagger',name:'旅人短刃',icon:'†',color:'#c2cac2',shape:[[0,0],[0,1]],category:'weapon',classId:null,cost:4,damage:5,cooldown:1.4,description:'輕巧可靠，每 1.4 秒攻擊。'},
  herb:{id:'herb',name:'晨露藥草',icon:'✤',color:'#8fbd9a',shape:[[0,0]],category:'support',classId:null,cost:4,heal:5,cooldown:3.5,description:'每 3.5 秒恢復 5 點生命；升階提高效果。'},
  lantern:{id:'lantern',name:'螢火提燈',icon:'✧',color:'#dfc987',shape:[[0,0],[0,1]],category:'support',classId:null,cost:5,damageBonus:0.09,description:'所有武器傷害 +9%；升階提高效果。'}
});
export const BLESSINGS = freeze({
  oak:{id:'oak',name:'古木庇蔭',icon:'♧',description:'最大生命 +24',hp:24},
  ember:{id:'ember',name:'不熄螢火',icon:'✧',description:'所有武器傷害 +12%',damageBonus:0.12},
  spring:{id:'spring',name:'林泉回響',icon:'≈',description:'每秒恢復 1.2 點生命',regen:1.2},
  breeze:{id:'breeze',name:'順風之約',icon:'❧',description:'所有物品觸發速度 +10%',haste:0.1},
  fortune:{id:'fortune',name:'拾光口袋',icon:'◈',description:'立即獲得 12 枚金幣',gold:12},
  bark:{id:'bark',name:'樹皮護符',icon:'⬡',description:'護甲 +2，開場護盾 +16',armor:2,shield:16},
  venom:{id:'venom',name:'幽蕈之吻',icon:'✿',description:'中毒傷害 +20%，武器傷害 +5%',poisonBonus:0.2,damageBonus:0.05}
});
export const STAGES = freeze([
  {name:'苔徑入口',enemy:'迷途木偶',icon:'♟',hp:380,damage:8,interval:1.85},
  {name:'風鈴草原',enemy:'荊棘野豬',icon:'♜',hp:750,damage:11,interval:1.8},
  {name:'古根石門',enemy:'盤根巨像',icon:'♛',hp:1350,damage:15,interval:1.9,boss:true},
  {name:'月露沼澤',enemy:'薄暮飛蛾',icon:'♝',hp:1900,damage:16,interval:1.75},
  {name:'銀蕈密林',enemy:'孢霧獵手',icon:'♞',hp:2450,damage:19,interval:1.8},
  {name:'回聲深谷',enemy:'霧角守望者',icon:'♛',hp:3250,damage:23,interval:1.9,boss:true},
  {name:'螢火斷橋',enemy:'空殼騎士',icon:'♜',hp:4000,damage:24,interval:1.75},
  {name:'星落庭院',enemy:'噬光藤獸',icon:'♞',hp:4900,damage:28,interval:1.8},
  {name:'苔光聖所',enemy:'黯冠森王',icon:'♛',hp:6000,damage:33,interval:1.9,boss:true}
]);
const scale = t => [0,1,2.15,4.6][t] || 1;
const fail = error => ({ok:false,error});
const ok = extra => ({ok:true,...extra});
const isInt = Number.isInteger;
const owns = (object,key) => Object.hasOwn(object,key);
const mod4 = n => ((n%4)+4)%4;
const clone = o => JSON.parse(JSON.stringify(o));
function hashSeed(seed) { const s=String(seed); let h=2166136261; for(let i=0;i<s.length;i++) h=Math.imul(h^s.charCodeAt(i),16777619); return h>>>0 || 1; }
function random(game) { let x=game.rngState>>>0; x^=x<<13; x^=x>>>17; x^=x<<5; game.rngState=x>>>0 || 1; return game.rngState/4294967296; }
function uid(game,prefix='item') { return `${prefix}-${game.nextId++}`; }
function log(game,text) { game.log.push(text); if(game.log.length>40)game.log.shift(); }
function actionable(game) { return game && game.phase==='shop'; }
export function getItemStats(item) { const d=ITEMS[item.kind]; if(!owns(ITEMS,item.kind))return null; const s=scale(item.tier); const out={...d,tier:item.tier,scale:s}; for(const k of ['damage','poison','heal','armor','shield','thorns','hp','haste','damageBonus','poisonBonus']) if(d[k])out[k]=d[k]*s; return out; }
/** Rotation is clockwise; returned cells are local, normalized to top-left. */
export function getCells(item) {
 const d=ITEMS[item?.kind]; if(!owns(ITEMS,item?.kind))return [];
 let cells=d.shape.map(([x,y])=>[x,y]);
 for(let i=0;i<mod4(item.rotation||0);i++)cells=cells.map(([x,y])=>[-y,x]);
 const minX=Math.min(...cells.map(c=>c[0])),minY=Math.min(...cells.map(c=>c[1]));
 return cells.map(([x,y])=>[x-minX,y-minY]);
}
export function getBagCells(game) { const cells=Array.from({length:BAG_HEIGHT},()=>Array(BAG_WIDTH).fill(null)); for(const item of game.bag.items) for(const [x,y] of getCells(item)) if(cells[item.y+y] && item.x+x>=0 && item.x+x<BAG_WIDTH)cells[item.y+y][item.x+x]=item.id; return cells; }
export function canPlace(game,item,x=item.x,y=item.y,rotation=item.rotation||0,ignoreIds=[]) {
 if(!game?.bag || !owns(ITEMS,item?.kind) || !isInt(x)||!isInt(y)||!isInt(rotation))return false;
 const ignored=new Set([item.id,...ignoreIds]); const occupied=new Set();
 for(const other of game.bag.items)if(!ignored.has(other.id))for(const [cx,cy]of getCells(other))occupied.add(`${other.x+cx},${other.y+cy}`);
 return getCells({...item,rotation}).every(([cx,cy])=>x+cx>=0&&y+cy>=0&&x+cx<BAG_WIDTH&&y+cy<BAG_HEIGHT&&!occupied.has(`${x+cx},${y+cy}`));
}
export function findPlacement(game,item) { for(let r=0;r<4;r++)for(let y=0;y<BAG_HEIGHT;y++)for(let x=0;x<BAG_WIDTH;x++)if(canPlace(game,item,x,y,r))return {x,y,rotation:r}; return null; }
export function canMerge(a,b) {return Boolean(a&&b&&a.id!==b.id&&a.kind===b.kind&&a.tier===b.tier&&a.tier<3);}
export function moveItem(game,id,x,y,rotation) { if(!actionable(game))return fail('僅能在營地整理行囊'); const item=game.bag.items.find(i=>i.id===id); if(!item)return fail('找不到物品'); const r=rotation===undefined?item.rotation:rotation; if(!canPlace(game,item,x,y,r))return fail('此處空間不足或與物品重疊'); Object.assign(item,{x,y,rotation:mod4(r)}); return ok({item}); }
export function rotateItem(game,id) {const item=game?.bag?.items.find(i=>i.id===id); if(!item)return fail('找不到物品');return moveItem(game,id,item.x,item.y,mod4(item.rotation+1));}
export function mergeItems(game,sourceId,targetId) {if(!actionable(game))return fail('僅能在營地合成'); const a=game.bag.items.find(i=>i.id===sourceId),b=game.bag.items.find(i=>i.id===targetId); if(!canMerge(a,b))return fail('需要兩件同種類、同階級的物品；最高為 III 階'); b.tier++;game.bag.items=game.bag.items.filter(i=>i.id!==a.id);game.stats.merges++;log(game,`${ITEMS[b.kind].name} 升至 ${b.tier} 階`);return ok({item:b});}
function fillShop(game) {
 const cls=CLASSES[game.classId]; const classKinds=Object.keys(ITEMS).filter(k=>ITEMS[k].classId===game.classId);
 const pool=[...classKinds,...classKinds,'dagger','herb','lantern','stone'];
 const kinds=[cls.primary,game.shop.rerolls===0?cls.primary:classKinds[Math.floor(random(game)*classKinds.length)],cls.support,pool[Math.floor(random(game)*pool.length)],pool[Math.floor(random(game)*pool.length)]];
 game.shop.offers=kinds.map((kind,i)=>{const tier=game.stage>=5&&i===4&&random(game)<0.3?2:1;return {id:uid(game,'offer'),kind,tier,price:ITEMS[kind].cost*(tier===2?2:1)};});
}
export function getRerollCost(game) {return Math.min(5,2+game.shop.rerolls);}
export function rerollShop(game) {if(!actionable(game))return fail('目前無法刷新商店');const cost=getRerollCost(game);if(game.gold<cost)return fail('金幣不足');game.gold-=cost;game.shop.rerolls++;fillShop(game);return ok({cost});}
export function buyItem(game,offerId,placement=null) {
 if(!actionable(game))return fail('目前無法購買'); const offer=game.shop.offers.find(o=>o.id===offerId);if(!offer)return fail('商品已售出');if(game.gold<offer.price)return fail('金幣不足');
 const item={id:`item-${game.nextId}`,kind:offer.kind,tier:offer.tier,x:0,y:0,rotation:0};
 const spot=placement || findPlacement(game,item);
 if(spot&&!canPlace(game,item,spot.x,spot.y,spot.rotation||0))return fail('選擇的格子無法放入物品');
 if(!spot){const target=game.bag.items.find(i=>canMerge(item,i));if(!target)return fail('行囊已滿：先整理、合成或出售物品');game.gold-=offer.price;game.shop.offers=game.shop.offers.filter(o=>o.id!==offerId);target.tier++;game.stats.merges++;game.stats.purchases++;log(game,`購入並合成 ${ITEMS[item.kind].name}`);return ok({item:target,merged:true});}
 game.nextId++;Object.assign(item,spot,{rotation:mod4(spot.rotation||0)});game.bag.items.push(item);game.gold-=offer.price;game.shop.offers=game.shop.offers.filter(o=>o.id!==offerId);game.stats.purchases++;log(game,`購入 ${ITEMS[item.kind].name}`);return ok({item});
}
export function getSellPrice(item) {return Math.max(1,Math.floor(ITEMS[item.kind].cost*(2**(item.tier-1))*0.6));}
export function sellItem(game,id) {if(!actionable(game))return fail('目前無法出售');const item=game.bag.items.find(i=>i.id===id);if(!item)return fail('找不到物品');const price=getSellPrice(item);game.bag.items=game.bag.items.filter(i=>i.id!==id);game.gold+=price;log(game,`出售 ${ITEMS[item.kind].name}，獲得 ${price} 金幣`);return ok({price});}
function absoluteCells(item) {return getCells(item).map(([x,y])=>[item.x+x,item.y+y]);}
function adjacent(a,b) {return absoluteCells(a).some(([x,y])=>absoluteCells(b).some(([u,v])=>Math.abs(x-u)+Math.abs(y-v)===1));}
export function getSynergies(game) {
 const edges=[]; for(const source of game.bag.items){for(const target of game.bag.items){if(source.id===target.id)continue;const d=ITEMS[target.kind];
  if(source.kind==='quiver'&&d.category==='weapon'){const [dx,dy]=[[1,0],[0,1],[-1,0],[0,-1]][mod4(source.rotation)];const hit=absoluteCells(target).some(([x,y])=>[1,2,3].some(n=>source.x+dx*n===x&&source.y+dy*n===y));if(hit)edges.push({sourceId:source.id,targetId:target.id,type:'directional',label:'箭簇共鳴',stat:'damage',bonus:0.25*scale(source.tier)});}
  if(source.kind==='mushroom'&&target.kind==='vial'&&adjacent(source,target))edges.push({sourceId:source.id,targetId:target.id,type:'adjacent',label:'孢子共生',stat:'poison',bonus:0.35*scale(source.tier)});
  if(source.kind==='shield'&&d.category==='weapon'&&adjacent(source,target))edges.push({sourceId:source.id,targetId:target.id,type:'adjacent',label:'磐根守勢',stat:'damage',bonus:0.25*scale(source.tier)});
 }}return edges;
}
export function getPlayerStats(game) {
 const stats={maxHp:CLASSES[game.classId].hp+(game.stage-1)*5,armor:game.classId==='guardian'?3:0,shield:0,thorns:0,haste:0,damageBonus:0,poisonBonus:game.classId==='toxin'?0.25:0,regen:0,dps:0,synergies:getSynergies(game)};
 for(const item of game.bag.items){const d=getItemStats(item);for(const k of ['armor','shield','thorns','haste','damageBonus','poisonBonus'])stats[k]+=d[k]||0;stats.maxHp+=d.hp||0;}
 for(const id of game.blessings){const b=BLESSINGS[id];for(const k of ['armor','shield','haste','damageBonus','poisonBonus','regen'])stats[k]+=b[k]||0;stats.maxHp+=b.hp||0;}
 stats.haste=Math.min(1.5,stats.haste);stats.armor=Math.min(20,stats.armor);
 for(const item of game.bag.items){const d=getItemStats(item);if(d.damage)stats.dps+=d.damage*(1+stats.damageBonus+(game.classId==='ranger'&&item.kind==='bow'?0.2:0)+stats.synergies.filter(s=>s.targetId===item.id&&s.stat==='damage').reduce((n,s)=>n+s.bonus,0))*(1+stats.haste)/d.cooldown;}
 return stats;
}
export function getEnemy(stage) {const d=STAGES[Math.max(0,Math.min(8,stage-1))];return {id:`enemy-${stage}`,name:d.enemy,icon:d.icon,location:d.name,hp:d.hp,maxHp:d.hp,damage:d.damage,interval:d.interval,boss:!!d.boss,poison:0};}
export function createGame(classId='ranger',seed=Date.now()) {
 if(!owns(CLASSES,classId))classId='ranger'; const seedValue=String(seed);const game={version:VERSION,id:`run-${hashSeed(seedValue).toString(36)}-${classId}`,seed:seedValue,rngState:hashSeed(seedValue),nextId:1,classId,stage:1,phase:'shop',gold:24,bag:{width:BAG_WIDTH,height:BAG_HEIGHT,items:[]},shop:{offers:[],rerolls:0},blessings:[],blessingChoices:[],battle:null,lastBattle:null,log:[],stats:{wins:0,merges:0,purchases:0}};
 const starters=classId==='ranger'?[['bow',1,0,0],['quiver',0,1,0],['herb',4,0,0]]:classId==='toxin'?[['vial',2,1,0],['mushroom',0,0,0],['herb',4,0,0]]:[['hammer',2,0,0],['shield',0,0,0],['herb',4,0,0]];
 for(const [kind,x,y,rotation]of starters)game.bag.items.push({id:uid(game),kind,tier:1,x,y,rotation});fillShop(game);log(game,'旅途開始：整理行囊，讓相鄰的物品互相照應。');return game;
}
export function startBattle(game) {
 if(!actionable(game))return fail('目前無法出發'); if(!game.bag.items.some(i=>ITEMS[i.kind].category==='weapon'))return fail('至少需要一件武器才能出發');
 const stats=getPlayerStats(game);game.phase='battle';game.blessingChoices=[];
 game.battle={time:0,step:0,accumulator:0,player:{hp:stats.maxHp,maxHp:stats.maxHp,shield:stats.shield},enemy:getEnemy(game.stage),events:[],result:null,stats,timers:Object.fromEntries(game.bag.items.filter(i=>ITEMS[i.kind].cooldown).map((i,index)=>[i.id,0.35+(index%4)*0.12])),enemyTimer:1.25,poisonTimer:1,damageDealt:0,damageTaken:0,healing:0};log(game,`進入 ${STAGES[game.stage-1].name}`);return ok({battle:game.battle});
}
function emit(b,event) {const e={...event,time:Math.round(b.time*100)/100};b.events.push(e);if(b.events.length>80)b.events.shift();return e;}
function damageEnemy(b,amount,type,sourceId,events) {amount=Math.max(0,amount);b.enemy.hp=Math.max(0,b.enemy.hp-amount);b.damageDealt+=amount;events.push(emit(b,{type,sourceId,amount,target:'enemy'}));}
function finishBattle(game,result,events) {
 const b=game.battle;b.result=result;game.lastBattle={stage:game.stage,result,time:b.time,damageDealt:b.damageDealt,damageTaken:b.damageTaken,healing:b.healing};
 if(result==='loss'){game.phase='lost';log(game,'微光暫歇。帶著學到的搭配，再踏上旅途。');events.push(emit(b,{type:'defeat',amount:0}));return;}
 game.stats.wins++;const reward=15+game.stage*2+(b.enemy.boss?5:0);game.gold+=reward;
 if(game.stage===9){game.phase='won';log(game,'苔光重新點亮聖所。你完成了這段旅途！');}
 else{game.phase='blessing';const pool=Object.keys(BLESSINGS);game.blessingChoices=[];while(game.blessingChoices.length<3){const index=Math.floor(random(game)*pool.length);game.blessingChoices.push(pool.splice(index,1)[0]);}log(game,`獲勝！獲得 ${reward} 金幣，選擇一份林間祝福。`);}
 events.push(emit(b,{type:'victory',amount:reward}));
}
function battleStep(game,events) {
 const b=game.battle,s=b.stats,dt=0.05;b.step++;b.time=b.step*dt;
 if(s.regen&&b.player.hp>0)b.player.hp=Math.min(b.player.maxHp,b.player.hp+s.regen*dt);
 for(const item of game.bag.items){const d=getItemStats(item);if(!d.cooldown)continue;b.timers[item.id]-=dt;if(b.timers[item.id]>1e-8)continue;b.timers[item.id]+=d.cooldown/(1+s.haste);
  if(d.damage){const bonus=s.synergies.filter(edge=>edge.targetId===item.id&&edge.stat==='damage').reduce((n,edge)=>n+edge.bonus,0);damageEnemy(b,d.damage*(1+s.damageBonus+bonus+(game.classId==='ranger'&&item.kind==='bow'?0.2:0)),'attack',item.id,events);}
  if(d.poison){const bonus=s.synergies.filter(edge=>edge.targetId===item.id&&edge.stat==='poison').reduce((n,edge)=>n+edge.bonus,0);const amount=d.poison*(1+bonus);b.enemy.poison+=amount;events.push(emit(b,{type:'apply-poison',sourceId:item.id,amount,target:'enemy'}));}
  if(d.heal){const amount=Math.min(d.heal,b.player.maxHp-b.player.hp);b.player.hp+=amount;b.healing+=amount;events.push(emit(b,{type:'heal',sourceId:item.id,amount,target:'player'}));}
  if(b.enemy.hp<=0){finishBattle(game,'win',events);return;}
 }
 b.poisonTimer-=dt;if(b.poisonTimer<=1e-8){b.poisonTimer+=1;if(b.enemy.poison>0.01){damageEnemy(b,b.enemy.poison*(1+s.poisonBonus),'poison',null,events);b.enemy.poison*=0.88;if(b.enemy.hp<=0){finishBattle(game,'win',events);return;}}}
 b.enemyTimer-=dt;if(b.enemyTimer<=1e-8){b.enemyTimer+=b.enemy.interval;const enrage=b.time>32?1+(b.time-32)*0.075:1;const damage=Math.max(1,b.enemy.damage*enrage-s.armor);const absorbed=Math.min(b.player.shield,damage);b.player.shield-=absorbed;const amount=damage-absorbed;b.player.hp=Math.max(0,b.player.hp-amount);b.damageTaken+=amount;events.push(emit(b,{type:'enemy-attack',amount,absorbed,target:'player'}));if(s.thorns)damageEnemy(b,s.thorns,'thorns',null,events);if(b.player.hp<=0){finishBattle(game,'loss',events);return;}if(b.enemy.hp<=0){finishBattle(game,'win',events);return;}}
 if(b.time>=90){finishBattle(game,'loss',events);}
}
/** Fixed 50 ms simulation: equivalent elapsed time produces identical results at any UI FPS. */
export function tickBattle(game,dtSeconds=0.05) {if(game.phase!=='battle'||!game.battle)return fail('戰鬥尚未開始或已結束');if(!Number.isFinite(dtSeconds)||dtSeconds<0||dtSeconds>60)return fail('無效的時間間隔');const events=[];const b=game.battle;b.accumulator+=dtSeconds;while(b.accumulator+1e-9>=0.05&&game.phase==='battle'){b.accumulator=Math.max(0,b.accumulator-0.05);battleStep(game,events);}return ok({events,result:b.result});}
export function chooseBlessing(game,id) {if(game.phase!=='blessing'||!game.blessingChoices.includes(id))return fail('請選擇本次出現的祝福');const b=BLESSINGS[id];game.blessings.push(id);game.gold+=b.gold||0;game.stage++;game.phase='shop';game.shop={offers:[],rerolls:0};game.blessingChoices=[];game.battle=null;fillShop(game);log(game,`獲得祝福：${b.name}`);return ok();}
export function serializeGame(game) {return JSON.stringify(game);}
/** Saves are treated as untrusted input. Runtime combat is never accepted from a save. */
export function restoreGame(input) {
 try{if(typeof input!=='string'||input.length>100000)return fail('存檔格式不正確');const raw=JSON.parse(input);if(!raw||raw.version!==VERSION||!owns(CLASSES,raw.classId)||!isInt(raw.stage)||raw.stage<1||raw.stage>9||!['shop','battle','blessing','won','lost'].includes(raw.phase))return fail('存檔版本或旅程資料無效');
 if(typeof raw.id!=='string'||!/^run-[A-Za-z0-9_-]{1,120}$/.test(raw.id))return fail('旅程識別碼無效');
 if(typeof raw.seed!=='string'||raw.seed.length>200||!isInt(raw.rngState)||raw.rngState<1||raw.rngState>4294967295||!isInt(raw.nextId)||raw.nextId<1||raw.nextId>1000000||!isInt(raw.gold)||raw.gold<0||raw.gold>100000)return fail('存檔數值無效');
 if(!raw.bag||raw.bag.width!==BAG_WIDTH||raw.bag.height!==BAG_HEIGHT||!Array.isArray(raw.bag.items)||raw.bag.items.length>30||!Array.isArray(raw.blessings)||raw.blessings.length>8||raw.blessings.some(id=>!owns(BLESSINGS,id)))return fail('行囊或祝福資料無效');
 if(!raw.shop||!Array.isArray(raw.shop.offers)||raw.shop.offers.length>5||!isInt(raw.shop.rerolls)||raw.shop.rerolls<0||raw.shop.rerolls>10000)return fail('商店資料無效');
 if(!raw.stats||['wins','merges','purchases'].some(k=>!isInt(raw.stats[k])||raw.stats[k]<0||raw.stats[k]>100000)||!Array.isArray(raw.log)||raw.log.length>40||raw.log.some(s=>typeof s!=='string'||s.length>300))return fail('旅程紀錄無效');
 const game={version:VERSION,id:raw.id,seed:raw.seed,rngState:raw.rngState,nextId:raw.nextId,classId:raw.classId,stage:raw.stage,phase:raw.phase,gold:raw.gold,bag:{width:BAG_WIDTH,height:BAG_HEIGHT,items:[]},shop:{offers:[],rerolls:raw.shop.rerolls},blessings:[...raw.blessings],blessingChoices:[],battle:null,lastBattle:null,log:[...raw.log],stats:{wins:raw.stats.wins,merges:raw.stats.merges,purchases:raw.stats.purchases}};
 const ids=new Set();for(const i of raw.bag.items){if(!i||typeof i.id!=='string'||!/^item-\d+$/.test(i.id)||ids.has(i.id)||Number(i.id.slice(5))>=game.nextId||!owns(ITEMS,i.kind)||!isInt(i.tier)||i.tier<1||i.tier>3||!isInt(i.rotation)||i.rotation<0||i.rotation>3||!canPlace(game,i,i.x,i.y,i.rotation))return fail('行囊物品不合法');ids.add(i.id);game.bag.items.push({id:i.id,kind:i.kind,tier:i.tier,x:i.x,y:i.y,rotation:i.rotation});}
 for(const o of raw.shop.offers){if(!o||typeof o.id!=='string'||!/^offer-\d+$/.test(o.id)||ids.has(o.id)||Number(o.id.slice(6))>=game.nextId||!owns(ITEMS,o.kind)||![1,2].includes(o.tier)||o.price!==ITEMS[o.kind].cost*(o.tier===2?2:1))return fail('商店商品不合法');ids.add(o.id);game.shop.offers.push({id:o.id,kind:o.kind,tier:o.tier,price:o.price});}
 const expectedBlessings=game.stage-1;if(game.blessings.length!==expectedBlessings||game.stats.wins!==(game.phase==='blessing'||game.phase==='won'?game.stage:game.stage-1)||game.phase==='won'&&game.stage!==9||game.phase==='blessing'&&game.stage===9)return fail('旅程進度不一致');
 if(game.phase==='blessing'){if(!Array.isArray(raw.blessingChoices)||raw.blessingChoices.length!==3||new Set(raw.blessingChoices).size!==3||raw.blessingChoices.some(id=>!owns(BLESSINGS,id)))return fail('祝福選項無效');game.blessingChoices=[...raw.blessingChoices];}
 if(raw.lastBattle!==undefined&&raw.lastBattle!==null){const b=raw.lastBattle;if(!b||!isInt(b.stage)||b.stage<1||b.stage>game.stage||!['win','loss'].includes(b.result)||!Number.isFinite(b.time)||b.time<0||b.time>91||['damageDealt','damageTaken','healing'].some(k=>!Number.isFinite(b[k])||b[k]<0||b[k]>10000000))return fail('戰鬥摘要無效');game.lastBattle={stage:b.stage,result:b.result,time:b.time,damageDealt:b.damageDealt,damageTaken:b.damageTaken,healing:b.healing};}
 const resumedFromBattle=game.phase==='battle';
 if(resumedFromBattle){game.phase='shop';log(game,'戰鬥前的營地已恢復。整理好後可重新出發。');}
 return ok({game,resumedFromBattle});
 }catch{return fail('無法讀取存檔，請開始新的旅途');}
}
