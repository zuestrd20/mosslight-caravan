import test from 'node:test';
import assert from 'node:assert/strict';
import * as E from './engine.js';

const copy = o => JSON.parse(JSON.stringify(o));
function validBag(g) {
 const cells=new Set();
 for(const i of g.bag.items){assert.ok(i.tier>=1&&i.tier<=3);for(const [dx,dy]of E.getCells(i)){const x=i.x+dx,y=i.y+dy;assert.ok(x>=0&&x<6&&y>=0&&y<5);assert.ok(!cells.has(`${x},${y}`),'items must never overlap');cells.add(`${x},${y}`);}}
 assert.ok(g.gold>=0&&Number.isInteger(g.gold));
}
function mergeAll(g) {while(true){let pair;for(const a of g.bag.items){const b=g.bag.items.find(i=>E.canMerge(a,i));if(b){pair=[a,b];break;}}if(!pair)break;assert.ok(E.mergeItems(g,pair[0].id,pair[1].id).ok);validBag(g);}}
function invest(g) {
 for(let round=0;round<3;round++){
  const offers=[...g.shop.offers].sort((a,b)=>(E.ITEMS[b.kind].category==='weapon')-(E.ITEMS[a.kind].category==='weapon'));
  for(const o of offers){const result=E.buyItem(g,o.id);if(result.ok)mergeAll(g);validBag(g);}
  if(round<2&&g.gold>=10){assert.ok(E.rerollShop(g).ok);}else break;
 }
}
function fight(g,chunk=0.5) {assert.ok(E.startBattle(g).ok);let calls=0;while(g.phase==='battle'){assert.ok(E.tickBattle(g,chunk).ok);assert.ok(++calls<20000,'battle must terminate');}return g.battle.result;}
function pickBlessing(g) {const id=['ember','breeze','bark','spring','oak','venom','fortune'].find(i=>g.blessingChoices.includes(i));assert.ok(E.chooseBlessing(g,id).ok);}
function finishCampaign(classId,investing,seed='test-seed') {const g=E.createGame(classId,seed);let count=0;while(g.phase==='shop'){if(investing)invest(g);fight(g);validBag(g);if(g.phase==='blessing')pickBlessing(g);assert.ok(++count<=9);}return g;}

test('three classes start with valid, connected tutorial loadouts and deterministic shops',()=>{
 for(const c of Object.keys(E.CLASSES)){const a=E.createGame(c,'repeat'),b=E.createGame(c,'repeat');assert.deepEqual(a,b);validBag(a);assert.equal(a.bag.width,6);assert.equal(a.bag.height,5);assert.ok(E.getSynergies(a).length);assert.equal(a.shop.offers.length,5);assert.equal(a.gold,24);}
 assert.equal(E.createGame('__proto__','safe').classId,'ranger');
 assert.notDeepEqual(E.createGame('ranger','a').rngState,E.createGame('ranger','b').rngState);
});
test('rotated cells preserve shape, normalize coordinates, and return after four turns',()=>{
 for(const kind of Object.keys(E.ITEMS)){const base=E.getCells({kind,rotation:0});for(let rotation=0;rotation<4;rotation++){const cells=E.getCells({kind,rotation});assert.equal(cells.length,base.length);assert.equal(new Set(cells.map(c=>c.join(','))).size,cells.length);assert.equal(Math.min(...cells.map(c=>c[0])),0);assert.equal(Math.min(...cells.map(c=>c[1])),0);}assert.deepEqual(E.getCells({kind,rotation:4}),base);}
 assert.deepEqual(E.getCells({kind:'__proto__'}),[]);
});
test('movement rejects overlap, boundaries, fractional positions, and unsafe rotations atomically',()=>{
 const g=E.createGame('ranger','move');const bow=g.bag.items.find(i=>i.kind==='bow');const before=E.serializeGame(g);
 for(const args of [[0,1,0],[-1,0,0],[6,0,0],[0,5,0],[0.5,0,0],[0,0,NaN],[0,0,1.5]]){assert.equal(E.moveItem(g,bow.id,...args).ok,false);assert.equal(E.serializeGame(g),before);}
 assert.ok(E.moveItem(g,bow.id,1,4,1).ok);validBag(g);assert.equal(E.rotateItem(g,bow.id).ok,false);assert.ok(E.moveItem(g,bow.id,1,0,0).ok);validBag(g);
});
test('buy, merge, tier cap, and sell conserve intended costs and instance identity',()=>{
 const g=E.createGame('ranger','economy');const original=g.bag.items.find(i=>i.kind==='bow');const offer=g.shop.offers.find(i=>i.kind==='bow');const gold=g.gold;
 const buy=E.buyItem(g,offer.id);assert.ok(buy.ok);assert.equal(g.gold,gold-offer.price);assert.equal(E.buyItem(g,offer.id).ok,false);assert.equal(g.bag.items.length,4);
 assert.ok(E.mergeItems(g,buy.item.id,original.id).ok);assert.equal(original.tier,2);assert.equal(g.bag.items.length,3);assert.equal(g.stats.merges,1);
 assert.equal(E.mergeItems(g,original.id,original.id).ok,false);const wrong=g.bag.items.find(i=>i.kind==='herb');assert.equal(E.mergeItems(g,wrong.id,original.id).ok,false);
 assert.equal(E.canMerge({id:'a',kind:'bow',tier:3},{id:'b',kind:'bow',tier:3}),false);
 const sellPrice=E.getSellPrice(original),before=g.gold;assert.ok(E.sellItem(g,original.id).ok);assert.equal(g.gold,before+sellPrice);assert.equal(E.sellItem(g,original.id).ok,false);
});
test('failed purchases and rerolls do not mutate state',()=>{
 const g=E.createGame('ranger','poor');g.gold=0;const before=E.serializeGame(g);assert.equal(E.buyItem(g,g.shop.offers[0].id).ok,false);assert.equal(E.rerollShop(g).ok,false);assert.equal(E.serializeGame(g),before);
 g.gold=24;const beforePlacement=E.serializeGame(g);assert.equal(E.buyItem(g,g.shop.offers[0].id,{x:9,y:9,rotation:0}).ok,false);assert.equal(E.serializeGame(g),beforePlacement);
});
test('full bags permit an automatic purchase merge, otherwise preserve all state',()=>{
 const g=E.createGame('ranger','full');g.bag.items=[];g.gold=100;
 for(let y=0;y<5;y++)for(let x=0;x<6;x++)g.bag.items.push({id:`item-${g.nextId++}`,kind:'herb',tier:1,x,y,rotation:0});
 const offer={id:`offer-${g.nextId++}`,kind:'herb',tier:1,price:4};g.shop.offers=[offer];const r=E.buyItem(g,offer.id);assert.ok(r.ok&&r.merged);assert.equal(g.bag.items.length,30);assert.equal(r.item.tier,2);validBag(g);
 const bad={id:`offer-${g.nextId++}`,kind:'bow',tier:1,price:6};g.shop.offers=[bad];const before=E.serializeGame(g);assert.equal(E.buyItem(g,bad.id).ok,false);assert.equal(E.serializeGame(g),before);
});
test('seeded rerolls match and charge a capped, visible cost',()=>{
 const a=E.createGame('toxin','shop'),b=copy(a);a.gold=b.gold=100;
 for(let i=0;i<7;i++){const before=a.gold,cost=E.getRerollCost(a);assert.ok(cost>=2&&cost<=5);assert.ok(E.rerollShop(a).ok);assert.ok(E.rerollShop(b).ok);assert.equal(a.gold,before-cost);assert.deepEqual(a,b);}
});
test('directional ranger synergy changes when the arrow rotates',()=>{
 const g=E.createGame('ranger','arrow');const q=g.bag.items.find(i=>i.kind==='quiver');const bow=g.bag.items.find(i=>i.kind==='bow');assert.ok(E.getSynergies(g).some(s=>s.sourceId===q.id&&s.targetId===bow.id));
 assert.ok(E.rotateItem(g,q.id).ok);assert.equal(E.getSynergies(g).length,0);assert.ok(E.rotateItem(g,q.id).ok);assert.equal(E.getSynergies(g).length,0);
});
test('toxin adjacency and guardian adjacency are geometric and class distinct',()=>{
 const t=E.createGame('toxin','adj'),g=E.createGame('guardian','adj');assert.equal(E.getSynergies(t)[0].stat,'poison');assert.equal(E.getSynergies(g)[0].stat,'damage');assert.ok(E.getPlayerStats(g).armor>3);assert.ok(E.getPlayerStats(g).shield>0);
 const mushroom=t.bag.items.find(i=>i.kind==='mushroom');assert.ok(E.moveItem(t,mushroom.id,0,3,0).ok);assert.equal(E.getSynergies(t).length,0);
});
test('fixed-step battle is independent of render frame size and freezes shop actions',()=>{
 const a=E.createGame('toxin','determinism');invest(a);const b=copy(a);assert.ok(E.startBattle(a).ok);assert.ok(E.startBattle(b).ok);
 const frozen=E.serializeGame(a);assert.equal(E.buyItem(a,a.shop.offers[0]?.id).ok,false);assert.equal(E.rerollShop(a).ok,false);assert.equal(E.sellItem(a,a.bag.items[0].id).ok,false);assert.equal(E.moveItem(a,a.bag.items[0].id,0,0).ok,false);assert.equal(E.startBattle(a).ok,false);assert.equal(E.serializeGame(a),frozen);
 while(a.phase==='battle')E.tickBattle(a,0.01);while(b.phase==='battle')E.tickBattle(b,0.5);
 assert.equal(a.phase,b.phase);assert.equal(a.battle.time,b.battle.time);assert.equal(a.battle.player.hp,b.battle.player.hp);assert.equal(a.battle.enemy.hp,b.battle.enemy.hp);assert.deepEqual(a.battle.events,b.battle.events);
 assert.equal(E.tickBattle(a,1).ok,false);
});
test('battle validates elapsed time and refuses departures without weapons',()=>{
 const g=E.createGame('ranger','time');E.startBattle(g);for(const dt of [-1,NaN,Infinity,61,'1']){const before=E.serializeGame(g);assert.equal(E.tickBattle(g,dt).ok,false);assert.equal(E.serializeGame(g),before);}assert.ok(E.tickBattle(g,0).ok);
 const empty=E.createGame('ranger','empty');for(const i of [...empty.bag.items])E.sellItem(empty,i.id);assert.equal(E.startBattle(empty).ok,false);
});
test('boss encounters, blessing choices, and campaign rewards have valid transitions',()=>{
 assert.deepEqual(E.STAGES.map((s,i)=>s.boss?i+1:null).filter(Boolean),[3,6,9]);const g=E.createGame('ranger','test-seed');invest(g);fight(g);assert.equal(g.phase,'blessing');assert.equal(new Set(g.blessingChoices).size,3);assert.equal(g.stats.wins,1);const before=E.serializeGame(g);assert.equal(E.chooseBlessing(g,'invalid').ok,false);assert.equal(E.serializeGame(g),before);const chosen=g.blessingChoices[0];assert.ok(E.chooseBlessing(g,chosen).ok);assert.equal(g.stage,2);assert.equal(g.phase,'shop');assert.equal(g.blessings[0],chosen);assert.equal(g.shop.rerolls,0);assert.equal(g.battle,null);assert.equal(E.chooseBlessing(g,chosen).ok,false);
});
for(const classId of Object.keys(E.CLASSES)){
 test(`${classId}: legal investments, merges, and blessings can win all nine stages`,()=>{const g=finishCampaign(classId,true);assert.equal(g.phase,'won');assert.equal(g.stage,9);assert.equal(g.stats.wins,9);assert.equal(g.blessings.length,8);assert.ok(g.stats.merges>0);assert.ok(g.stats.purchases>0);assert.ok(g.battle.time>=10&&g.battle.time<35);assert.ok(E.restoreGame(E.serializeGame(g)).ok);});
 test(`${classId}: refusing all investment eventually loses`,()=>{const g=finishCampaign(classId,false);assert.equal(g.phase,'lost');assert.ok(g.stage<9);assert.equal(g.stats.purchases,0);assert.equal(g.stats.merges,0);});
}
test('save round trip preserves shop state; in-progress combat safely resumes in camp',()=>{
 const g=E.createGame('toxin','save');invest(g);const out=E.restoreGame(E.serializeGame(g));assert.ok(out.ok);assert.deepEqual(out.game,g);E.startBattle(g);E.tickBattle(g,1);const battle=E.restoreGame(E.serializeGame(g));assert.ok(battle.ok);assert.equal(battle.resumedFromBattle,true);assert.equal(out.resumedFromBattle,false);assert.equal(battle.game.phase,'shop');assert.equal(battle.game.battle,null);assert.deepEqual(battle.game.bag,g.bag);assert.ok(E.startBattle(battle.game).ok);
});
test('save validation rejects corrupt, overlapping, injected, and inconsistent states',()=>{
 const base=E.createGame('ranger','validation');const mutations=[
  g=>g.version=9,g=>g.classId='__proto__',g=>g.stage=0,g=>g.stage=10,g=>g.gold=-1,g=>g.gold=1.5,g=>g.rngState=0,g=>g.nextId=1,g=>g.phase='cheat',g=>g.bag.width=7,g=>g.bag.items[0].kind='toString',g=>g.bag.items[0].tier=4,g=>g.bag.items[0].x=-1,g=>g.bag.items[0].rotation=9,g=>g.bag.items[0].x=0,g=>g.bag.items[1].id=g.bag.items[0].id,g=>g.shop.offers[0].price=0,g=>g.shop.offers[0].tier=3,g=>g.blessings.push('ember'),g=>g.stats.wins=1,g=>g.log.push({attack:true}),g=>g.phase='won',g=>g.shop.rerolls=-2
 ];
 for(const mutate of mutations){const g=copy(base);mutate(g);assert.equal(E.restoreGame(JSON.stringify(g)).ok,false,mutate.toString());}
 for(const input of ['',null,'null','[]','{','x'.repeat(100001)])assert.equal(E.restoreGame(input).ok,false);
 const clean=copy(base);clean.unknown={prototype:'discarded'};const restored=E.restoreGame(JSON.stringify(clean));assert.ok(restored.ok);assert.equal(restored.game.unknown,undefined);
});
test('random legal shop and placement operations always preserve spatial invariants',()=>{
 for(const cls of Object.keys(E.CLASSES)){const g=E.createGame(cls,'fuzz');g.gold=300;for(let n=0;n<80;n++){if(n%3===0)E.rerollShop(g);const offer=g.shop.offers[n%Math.max(1,g.shop.offers.length)];if(offer)E.buyItem(g,offer.id);mergeAll(g);const item=g.bag.items[n%g.bag.items.length];if(item){E.rotateItem(g,item.id);E.moveItem(g,item.id,(n*7)%8-1,(n*3)%7-1,n%4);}validBag(g);}}
});


test('restore preserves unique run IDs across repeated resumes and terminal reloads',()=>{
 const g=finishCampaign('ranger',true);g.id+='-unique123';const first=E.restoreGame(E.serializeGame(g));assert.ok(first.ok);assert.equal(first.game.id,g.id);assert.deepEqual(first.game.lastBattle,g.lastBattle);assert.equal(first.resumedFromBattle,false);
 const second=E.restoreGame(E.serializeGame(first.game));assert.ok(second.ok);assert.equal(second.game.id,g.id);const completed=new Set([g.id]);assert.equal(completed.has(second.game.id),true);
 for(const id of ['',null,'<script>','run-'+ 'a'.repeat(121)]){const raw=copy(g);raw.id=id;assert.equal(E.restoreGame(E.serializeGame(raw)).ok,false);}
});
test('restore retains validated loss summaries and rejects malformed statistics',()=>{
 const g=finishCampaign('ranger',false);const result=E.restoreGame(E.serializeGame(g));assert.ok(result.ok);assert.deepEqual(result.game.lastBattle,g.lastBattle);assert.ok(result.game.lastBattle.time>0);
 for(const change of [b=>b.time=-1,b=>b.time=100,b=>b.healing='5',b=>b.result='cheat',b=>b.stage=10]){const raw=copy(g);change(raw.lastBattle);assert.equal(E.restoreGame(E.serializeGame(raw)).ok,false);}
});
