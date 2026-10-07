/** UI state regression tests with a small DOM substitute. No browser/layout claims. */
import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import fs from 'node:fs';
import * as E from './engine.js';

const source=fs.readFileSync(new URL('./app.js',import.meta.url),'utf8').replace(/^import .*;\n/gm,'');
function harness({metadata=null,storageFailure=false}={}) {
  const nodes=new Map(),windowEvents=new Map(),documentEvents=new Map(),frames=new Map(),timeouts=new Map();
  let nextId=0;
  class Element {
    constructor(name){this.name=name;this.innerHTML='';this.textContent='';this.value='audit';this.dataset={};this.style={};this.children=[];this.listeners=new Map();this.removed=false;this.open=false;this.classes=new Set();this.classList={add:(...v)=>v.forEach(s=>this.classes.add(s)),remove:(...v)=>v.forEach(s=>this.classes.delete(s))};}
    addEventListener(type,fn){this.listeners.set(type,fn);}
    getBoundingClientRect(){return {left:0,top:0,width:600,height:500};}
    append(child){this.children.push(child);}
    remove(){this.removed=true;}
    showModal(){this.open=true;}
    close(){this.open=false;}
    matches(){return false;}
    closest(){return null;}
    focus(){}
    setAttribute(name,value){this[name]=String(value);}
    insertAdjacentHTML(_position,html){this.innerHTML+=html;}
  }
  const node=s=>{if(!nodes.has(s))nodes.set(s,new Element(s));return nodes.get(s);};
  const cells=Array.from({length:30},(_,i)=>node(`.grid-cell[data-x="${i%6}"][data-y="${Math.floor(i/6)}"]`));
  const document={body:node('body'),activeElement:node('body'),hidden:false,querySelector:node,querySelectorAll:s=>s==='.grid-cell'?cells:[],createElement:name=>new Element(name),addEventListener:(t,fn)=>documentEvents.set(t,fn)};
  const store=new Map(metadata?[['mosslight-caravan-meta-v1',JSON.stringify(metadata)]]:[]);
  const context=vm.createContext({E,icon:()=>'<svg></svg>',document,window:{addEventListener:(t,fn)=>windowEvents.set(t,fn)},localStorage:{getItem:k=>store.get(k)||null,setItem:(k,v)=>{if(storageFailure)throw new Error('Quota exceeded');store.set(k,v);}},requestAnimationFrame:fn=>{const id=++nextId;frames.set(id,fn);return id;},cancelAnimationFrame:id=>frames.delete(id),setTimeout:(fn,ms)=>{const id=++nextId;timeouts.set(id,{fn,ms});return id;},clearTimeout:id=>timeouts.delete(id),Date,console});
  vm.runInContext(source,context,{filename:'app.js'});
  const run=js=>vm.runInContext(js,context);
  const get=js=>JSON.parse(JSON.stringify(run(js)));
  const event=(x=0,y=0,pointerId=1)=>({clientX:x,clientY:y,pointerId,button:0,isPrimary:pointerId===1,preventDefault(){},target:node('body')});
  const pointerDown=(id,x,y,pointerId=1)=>{const e=event(x,y,pointerId);e.target={closest:()=>({dataset:{item:id}})};node('#app').listeners.get('pointerdown')(e);};
  const move=(x,y,pointerId=1)=>windowEvents.get('pointermove')(event(x,y,pointerId));
  const up=(x,y,pointerId=1)=>windowEvents.get('pointerup')(event(x,y,pointerId));
  const key=k=>documentEvents.get('keydown')({...event(),key:k,code:k===' '?'Space':k});
  const reset=()=>run("game=E.createGame('ranger','ui-audit');menu=false;selected=null;mergeMode=false;paused=false;render();");
  const frame=now=>{const entry=frames.entries().next().value;if(!entry)return;frames.delete(entry[0]);entry[1](now);};
  return {nodes,node,run,get,event,pointerDown,move,up,key,reset,frames,frame,windowEvents,documentEvents,store,timeouts};
}

test('drag rotate followed by Escape leaves original position and rotation unchanged',()=>{
  const h=harness();h.reset();const before=h.get('game.bag.items[0]');
  h.pointerDown(before.id,150,150);h.move(350,350);h.key('r');h.key('Escape');h.up(350,350);
  assert.deepEqual(h.get('game.bag.items[0]'),before);assert.equal(h.get('drag'),null);
  assert.equal(h.node('body').children.filter(n=>!n.removed).length,0);
});
test('invalid rotated drop leaves item unchanged and removes its ghost',()=>{
  const h=harness();h.reset();const before=h.get('game.bag.items[0]');
  h.pointerDown(before.id,150,150);h.move(550,450);h.key('r');h.up(550,450);
  assert.deepEqual(h.get('game.bag.items[0]'),before);assert.equal(h.node('body').children.filter(n=>!n.removed).length,0);
});
test('outside drop cancels without item mutation',()=>{
  const h=harness();h.reset();const before=h.get('game.bag.items[0]');
  h.pointerDown(before.id,150,50);h.move(700,400);h.up(700,400);
  assert.deepEqual(h.get('game.bag.items[0]'),before);
});
test('explicit merge selects surviving target and clears merge mode',()=>{
  const h=harness();h.reset();h.run('selected=game.bag.items[0].id;var bought=E.buyItem(game,game.shop.offers[0].id);mergeMode=true;selectItem(bought.item.id);');
  assert.equal(h.get('game.bag.items.length'),3);assert.equal(h.get('game.bag.items.find(i=>i.id===selected).tier'),2);assert.equal(h.get('mergeMode'),false);
});
test('selling a selected item exits merge mode and permits later selection',()=>{
  const h=harness();h.reset();h.run('selected=game.bag.items[0].id;mergeMode=true;actions.sell();selectItem(game.bag.items[0].id);');
  assert.equal(h.get('mergeMode'),false);assert.equal(h.get('selected'),h.get('game.bag.items[0].id'));
});
test('duplicate run calls maintain only one animation frame',()=>{
  const h=harness();h.reset();h.run('actions.battle();run();run();');assert.equal(h.frames.size,1);
  h.frame(1000);h.frame(1100);assert.equal(h.frames.size,1);assert.ok(h.get('game.battle.time')>0);
});
test('pause blocks simulation and menu cancels animation frames',()=>{
  const h=harness();h.reset();h.run('actions.battle();');h.frame(1000);h.frame(1100);h.run('actions.pause();');
  const elapsed=h.get('game.battle.time');h.frame(1300);h.frame(1400);assert.equal(h.get('game.battle.time'),elapsed);
  h.run('actions.menu();');assert.equal(h.frames.size,0);assert.equal(h.get('menu'),true);
});
test('combat mutations fail without changing the bag',()=>{
  const h=harness();h.reset();h.run('actions.battle();selected=game.bag.items[0].id;');const before=h.get('game.bag.items');
  h.run('actions.sell();actions.rotate();');assert.deepEqual(h.get('game.bag.items'),before);
});
test('saved metadata rejects malformed completed lists before game completion',()=>{
  const h=harness({metadata:{wins:0,classes:[],completed:null,runs:'broken',best:-1}});h.reset();
  assert.doesNotThrow(()=>h.run("game.phase='lost';finish();"));assert.ok(Array.isArray(h.get('meta.completed')));
  assert.ok(Number.isSafeInteger(h.get('meta.runs')));assert.ok(h.get('meta.best')>=0);
});
test('explicit Save reports write failure rather than success',()=>{
  const h=harness({storageFailure:true});h.reset();h.run('actions.save();');assert.match(h.node('#toast').textContent,/無法|失敗/);
});
test('a second pointer cannot replace an active drag and orphan its ghost',()=>{
  const h=harness();h.reset();const [first,second]=h.get('game.bag.items');
  h.pointerDown(first.id,150,50);h.move(350,250);h.pointerDown(second.id,50,150,2);h.up(450,250);h.up(450,250,2);
  assert.equal(h.node('body').children.filter(n=>!n.removed).length,0);
});
test('opening menu during drag cancels the drag',()=>{
  const h=harness();h.reset();const first=h.get('game.bag.items[0]');h.pointerDown(first.id,150,50);h.move(350,250);h.run('actions.menu();');
  assert.equal(h.get('drag'),null);assert.equal(h.node('body').children.filter(n=>!n.removed).length,0);
});
