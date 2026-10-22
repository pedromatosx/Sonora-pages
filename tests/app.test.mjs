import test from "node:test";
import assert from "node:assert/strict";

test("interface renderiza catálogo, leitor, transposição e escapa conteúdo local", async () => {
  const elements = new Map();
  const mockElement = id => {
    if (!elements.has(id)) elements.set(id,{
      innerHTML:"", textContent:"", value:"", dataset:{},
      classList:{add(){},remove(){},toggle(){}},
      addEventListener(){},setAttribute(){}, showModal(){},close(){},reset(){}
    });
    return elements.get(id);
  };
  const listeners = {};
  const windowListeners = {};
  const store = new Map([["sonora_v2_songs",JSON.stringify([{
    id:"local-inseguro",title:"<img src=x onerror=alert(1)>",
    artist:"Minha autoria",genre:"Pop",key:"C",
    body:"[C]Minha composição de teste",cover:"♫",color:"#ff0000"
  }])]]);
  globalThis.document = {
    title:"",
    querySelector:selector=>selector==="#app"?mockElement("app"):null,
    querySelectorAll:()=>[],
    getElementById:mockElement,
    addEventListener:(name,callback)=>{listeners[name]=callback;}
  };
  globalThis.window = {
    addEventListener:(name,callback)=>{windowListeners[name]=callback;},
    scrollTo(){},scrollBy(){},innerHeight:1000,scrollY:0
  };
  globalThis.location = {hash:"#inicio"};
  globalThis.localStorage = {
    getItem:key=>store.has(key)?store.get(key):null,
    setItem:(key,value)=>store.set(key,value)
  };
  await import("../src/app.mjs?render-smoke-test");
  const app = mockElement("app");
  assert.match(app.innerHTML,/Sinta a música/);
  assert.match(app.innerHTML,/Primeiro Sol/);

  location.hash="#musica/aurora";
  windowListeners.hashchange();
  assert.match(app.innerHTML,/A cidade acordou/);
  assert.match(app.innerHTML,/Tom 0/);
  assert.match(app.innerHTML,/class="chord">C</);
  listeners.click({target:{closest:selector => selector==="[data-action]"?{dataset:{action:"transpose",step:"1"}}:null}});
  assert.match(app.innerHTML,/Tom \+1/);
  assert.match(app.innerHTML,/class="chord">C#/);

  location.hash="#minhas";
  windowListeners.hashchange();
  assert.match(app.innerHTML,/&lt;img/);
  assert.doesNotMatch(app.innerHTML,/<img src=x/);
});
