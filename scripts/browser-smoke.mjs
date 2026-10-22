import {createServer} from "node:http";
import {readFile} from "node:fs/promises";
import {resolve, sep} from "node:path";
import {spawn} from "node:child_process";
import assert from "node:assert/strict";

const root = process.cwd();
const types = {".html":"text/html", ".css":"text/css", ".mjs":"text/javascript", ".svg":"image/svg+xml"};
const server = createServer(async(req,res)=>{
  try {
    const url = new URL(req.url,"http://localhost");
    const relative = decodeURIComponent(url.pathname === "/" ? "/index.html" : url.pathname);
    const path = resolve(root,"."+relative);
    if(path !== root && !path.startsWith(root+sep)){res.writeHead(403);res.end();return;}
    const data = await readFile(path);
    const ext = path.slice(path.lastIndexOf("."));
    res.writeHead(200,{"Content-Type":types[ext] || "application/octet-stream"});
    res.end(data);
  } catch {res.writeHead(404);res.end("Not found");}
});
await new Promise(done=>server.listen(0,"127.0.0.1",done));
const port = server.address().port;
const chrome = process.env.CHROME_BIN || "google-chrome";
function render(hash,windowSize="1280,900"){
  return new Promise((done,reject)=>{
    const child = spawn(chrome,["--headless=new","--no-sandbox","--disable-dev-shm-usage","--disable-gpu","--disable-background-networking","--no-first-run","--window-size="+windowSize,"--virtual-time-budget=3500","--dump-dom","http://127.0.0.1:"+port+"/"+hash],{stdio:["ignore","pipe","pipe"]});
    let html="",errors="";
    child.stdout.on("data",v=>html+=v);
    child.stderr.on("data",v=>errors+=v);
    child.on("error",reject);
    child.on("close",code=>code===0?done(html):reject(new Error("Chrome code "+code+": "+errors.slice(-500))));
  });
}
try {
  const home = await render("#inicio");
  assert.match(home,/Sinta a música/);
  assert.match(home,/Primeiro Sol/);
  const reader = await render("#musica\/aurora","390,844");
  assert.match(reader,/A cidade acordou/);
  assert.match(reader,/class="chord">C</);
  const search = await render("#descobrir");
  assert.match(search,/Explore cifras/);
  const practice = await render("#ferramentas","390,844");
  assert.match(practice,/Ferramentas musicais/);
  assert.match(practice,/Metrônomo/);
  assert.match(practice,/Dicionário de acordes/);
  assert.match(practice,/Notas de afinação/);
  console.log("Chrome headless: home, leitor e descoberta renderizados com sucesso.");
} finally {await new Promise(done=>server.close(done));}
