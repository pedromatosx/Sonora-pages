import {songs as demoSongs} from "./catalog.mjs";
import {transposeChord, normalizeSearch, searchSongs, validateSong, extractChords} from "./music.mjs";

const KEY = "sonora_v2_";
const app = document.querySelector("#app");
const byId = id => document.getElementById(id);
const esc = value => String(value ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const read = (key, fallback) => { try { const value = JSON.parse(localStorage.getItem(KEY + key)); return value ?? fallback; } catch { return fallback; } };
const state = {
  userSongs: read("songs", []).filter(s => s && typeof s.id === "string" && !validateSong(s)).slice(0,100),
  favorites: read("favorites", []).filter?.(v => typeof v === "string") ?? [],
  lists: read("lists", []).filter?.(v => v && typeof v.id === "string" && typeof v.name === "string" && Array.isArray(v.songs)) ?? [],
  query:"", genre:"Todos", semitones:0, font:19, scrollTimer:null, speed:2, pendingSong:null
};
const save = (key,value) => { try { localStorage.setItem(KEY + key,JSON.stringify(value)); return true; } catch { showToast("Armazenamento indisponível. Libere espaço no navegador."); return false; } };
const allSongs = () => [...demoSongs, ...state.userSongs];
const findSong = id => allSongs().find(s => s.id === id);
const route = () => decodeURIComponent(location.hash.replace(/^#/,"") || "inicio");
let toastTimer = null;
function showToast(message) {
  const el = byId("toast"); el.textContent = message; el.classList.add("show");
  clearTimeout(toastTimer); toastTimer = setTimeout(() => el.classList.remove("show"), 3300);
}
const pageTitle = (eyebrow,title,description,actions="") => '<div class="page-header"><div><small class="eyebrow">'+eyebrow+'</small><h1>'+title+'</h1><p class="muted">'+description+'</p></div>'+actions+'</div>';
const button = (label,action,extra="") => '<button class="btn btn-outline" type="button" data-action="'+action+'" '+extra+'>'+label+'</button>';
function card(song) {
  const isFav = state.favorites.includes(song.id);
  return '<article class="song-card"><a href="#musica/'+encodeURIComponent(song.id)+'" aria-label="Abrir cifra de '+esc(song.title)+'"><div class="song-cover" style="background:linear-gradient(135deg,'+esc(song.color || "#996b59")+',#25222f)"><span>'+esc(song.cover || "♫")+'</span></div></a><div class="song-card-body"><a href="#musica/'+encodeURIComponent(song.id)+'"><h3>'+esc(song.title)+'</h3><p>'+esc(song.artist)+'</p></a><div class="song-card-bottom"><span class="tag">'+esc(song.genre)+'</span><button class="fav-button'+(isFav?' active':'')+'" data-action="favorite" data-id="'+esc(song.id)+'" aria-label="'+(isFav?"Remover dos":"Adicionar aos")+' favoritos" aria-pressed="'+isFav+'">'+(isFav?"♥":"♡")+'</button></div></div></article>';
}
function cards(items) { return items.length ? '<div class="song-grid">'+items.map(card).join("")+'</div>' : empty("Nenhuma música encontrada","Experimente outro termo de busca ou adicione sua própria cifra."); }
function empty(title,subtitle) {
  return '<div class="empty-state"><div class="empty-icon">♫</div><h3>'+title+'</h3><p>'+subtitle+'</p><button class="btn btn-accent" data-action="new-song" type="button">＋ Adicionar minha cifra</button></div>';
}
function home() {
  return '<section class="hero"><div class="hero-text"><small class="eyebrow">♫ SEU ESPAÇO MUSICAL</small><h1>Sinta a música.<br><em>Viva cada acorde.</em></h1><p>Encontre sua próxima canção, explore acordes e organize tudo o que você ama tocar em um só lugar.</p><a href="#descobrir" class="btn btn-accent">Explorar cifras <span aria-hidden="true">↗</span></a></div><div class="hero-art" aria-hidden="true">🎸<span>♪</span></div></section>'+
  '<div class="section-heading"><div><h2>Para começar a tocar <span style="color:var(--accent)">✦</span></h2><p>Seleção de músicas de demonstração do Sonora</p></div><a href="#descobrir">Ver todas ↗</a></div>'+
  cards(demoSongs.slice(0,3))+
  '<div class="section-heading"><div><h2>Seu ritmo, suas regras</h2><p>Seu cantinho para organizar e praticar</p></div></div>'+
  '<div class="shortcut-row"><a class="shortcut" href="#favoritos"><span class="shortcut-icon">♡</span><div><strong>Seus favoritos</strong><small>As cifras que você mais ama</small></div></a><a class="shortcut" href="#repertorios"><span class="shortcut-icon">▤</span><div><strong>Meus repertórios</strong><small>Organize seus ensaios e shows</small></div></a><a class="shortcut" href="#minhas"><span class="shortcut-icon">♫</span><div><strong>Minhas cifras</strong><small>Suas próprias composições</small></div></a></div>';
}
const genres = ["Todos","Pop","MPB","Rock","Sertanejo","Gospel","Outros"];
function discover() {
  const found = searchSongs(allSongs(),state.query,state.genre);
  return pageTitle("DESCUBRA O PRÓXIMO ACORDE","Explore cifras","Busque, descubra e escolha o som do seu dia.")+
    '<div class="genre-row" aria-label="Filtrar por estilo">'+genres.map(g => '<button class="genre-button'+(state.genre === g?' active':'')+'" type="button" data-action="genre" data-genre="'+esc(g)+'" aria-pressed="'+(state.genre === g)+'">'+esc(g)+'</button>').join("")+'</div>'+
    '<div class="section-heading"><div><h2 id="result-count">'+found.length+' cifra'+(found.length === 1?'':'s')+' encontrada'+(found.length === 1?'':'s')+'</h2><p>Conteúdo demonstrativo original + suas próprias cifras</p></div></div><div id="search-results">'+cards(found)+'</div>';
}
function favorites() {
  const found = allSongs().filter(s => state.favorites.includes(s.id));
  return pageTitle("SUA BIBLIOTECA","Músicas favoritas","Aquelas cifras que merecem estar sempre por perto.")+cards(found);
}
function mySongs() {
  return pageTitle("SUAS COMPOSIÇÕES","Minhas cifras","Cadastre e edite seu acervo pessoal neste navegador.",'<button class="btn btn-accent" data-action="new-song" type="button">＋ Nova cifra</button>')+cards(state.userSongs);
}
function setlists() {
  const body = state.lists.length ? '<div class="list-grid">'+state.lists.map(list => '<article class="list-card"><div class="list-symbol">♫</div><h3>'+esc(list.name)+'</h3><p>'+list.songs.length+' música'+(list.songs.length===1?'':'s')+' no repertório</p><div class="list-actions"><a class="mini-link" href="#repertorio/'+encodeURIComponent(list.id)+'">Abrir repertório ↗</a><button class="mini-link" data-action="delete-list" data-id="'+esc(list.id)+'">Excluir</button></div></article>').join("")+'</div>' : empty("Seu primeiro repertório começa aqui","Monte listas de músicas para tocar em casa, na igreja ou com sua banda.");
  return pageTitle("CADA MÚSICA NO SEU LUGAR","Meus repertórios","Suas músicas organizadas para o próximo momento.",'<button class="btn btn-accent" data-action="new-list" type="button">＋ Novo repertório</button>')+body;
}
function setlistDetail(id) {
  const list = state.lists.find(l => l.id === id);
  if (!list) return empty("Repertório não encontrado","Volte à sua biblioteca.");
  const found = list.songs.map(findSong).filter(Boolean);
  return '<div class="reader-header"><a href="#repertorios">← Voltar aos repertórios</a></div>'+
    pageTitle("REPERTÓRIO","♫ "+esc(list.name),found.length+" músicas organizadas")+
    (found.length ? '<div class="song-list">'+found.map(song => '<div class="song-row"><span class="row-emoji" style="background:'+esc(song.color || "#55414a")+'">'+esc(song.cover || "♫")+'</span><a href="#musica/'+encodeURIComponent(song.id)+'"><strong>'+esc(song.title)+'</strong><small>'+esc(song.artist)+'</small></a><button class="mini-link" data-action="remove-from-list" data-list="'+esc(id)+'" data-id="'+esc(song.id)+'">Remover</button></div>').join("")+'</div>' : empty("Nenhuma cifra na lista","Abra uma cifra e clique em Adicionar ao repertório."));
}
function lyricLine(line) {
  if (!line.includes("[")) return '<div class="lyric-line plain">'+(line ? esc(line) : '&nbsp;')+'</div>';
  const parts = line.split(/(\[[^\]\n]{1,24}\])/g);
  let chord = null; let content = "";
  for (const part of parts) {
    if (!part) continue;
    if (/^\[[^\]\n]{1,24}\]$/.test(part)) {
      if (chord !== null) content += '<span class="lyric-segment"><span class="chord">'+esc(transposeChord(chord,state.semitones))+'</span><span class="lyric">&nbsp;</span></span>';
      chord = part.slice(1,-1);
    } else {
      const transposed = chord ? transposeChord(chord,state.semitones) : "";
      content += '<span class="lyric-segment"><span class="chord">'+(transposed ? esc(transposed):'&nbsp;')+'</span><span class="lyric">'+esc(part)+'</span></span>'; chord = null;
    }
  }
  if (chord) content += '<span class="lyric-segment"><span class="chord">'+esc(transposeChord(chord,state.semitones))+'</span><span class="lyric">&nbsp;</span></span>';
  return '<div class="lyric-line">'+content+'</div>';
}
function reader(song) {
  const uniqueChords = extractChords(song.body).map(c => transposeChord(c,state.semitones));
  const fav = state.favorites.includes(song.id);
  return '<div class="reader-header"><a href="#descobrir">← Explorar cifras</a><span>/</span><span>'+esc(song.title)+'</span></div>'+
    '<section class="reader-top"><div class="reader-cover" style="background:linear-gradient(135deg,'+esc(song.color || "#764d48")+',#242330)">'+esc(song.cover||"♫")+'</div><div class="reader-title"><small class="eyebrow">CIFRA • '+esc(song.genre)+'</small><h1>'+esc(song.title)+'</h1><p>'+esc(song.artist)+'</p></div></section>'+
    '<div class="reader-layout"><div class="reader-main"><div class="reader-toolbar">'+
      '<div class="tool-group" aria-label="Transpor tom"><button class="tool-btn" data-action="transpose" data-step="-1" aria-label="Baixar meio tom">−</button><span>Tom '+(state.semitones>0?'+':'')+state.semitones+'</span><button class="tool-btn" data-action="transpose" data-step="1" aria-label="Subir meio tom">＋</button></div>'+
      '<div class="tool-group" aria-label="Tamanho da letra"><button class="tool-btn" data-action="font" data-step="-1" aria-label="Diminuir letra">A−</button><button class="tool-btn" data-action="font" data-step="1" aria-label="Aumentar letra">A＋</button></div>'+
      '<button class="tool-btn'+(state.scrollTimer?' active':'')+'" data-action="scroll" aria-pressed="'+Boolean(state.scrollTimer)+'">'+(state.scrollTimer?"◼ Parar rolagem":"▶ Rolar")+'</button>'+
      '<span class="grow"></span><button class="tool-btn" data-action="print">⎙ Imprimir</button></div>'+
      '<div class="reader-body" id="lyric-body" style="font-size:'+state.font+'px">'+song.body.split("\n").map(lyricLine).join("")+'</div></div>'+
      '<aside class="reader-aside"><div class="info-panel"><h3>Sobre esta cifra</h3><div class="info-row"><span>Tom original</span><strong>'+esc(song.key)+'</strong></div><div class="info-row"><span>Dificuldade</span><strong>'+esc(song.level||"—")+'</strong></div><div class="info-row"><span>Estilo</span><strong>'+esc(song.genre)+'</strong></div><div class="info-row"><span>Andamento</span><strong>'+(Number.isFinite(song.bpm)?song.bpm+" BPM":"—")+'</strong></div><button class="btn '+(fav?'btn-accent':'btn-outline')+'" data-action="favorite" data-id="'+esc(song.id)+'">'+(fav?"♥ Salvo nos favoritos":"♡ Salvar favorito")+'</button><button class="btn btn-outline" data-action="add-to-list" data-id="'+esc(song.id)+'">＋ Adicionar ao repertório</button></div>'+
      '<div class="info-panel"><h3>Acordes nesta música</h3><div class="chord-chips">'+(uniqueChords.map(c => '<span class="chord-chip">'+esc(c)+'</span>').join("")||'<span class="hint">Sem acordes identificados</span>')+'</div><p class="hint" style="margin-top:15px">Use + e − para transpor cada acorde em meio tom.</p></div></aside></div>';
}
function render() {
  const current=route(); const [page,id] = current.split("/");
  document.querySelectorAll("[data-nav]").forEach(link => link.classList.toggle("active",link.dataset.nav === (page === "musica" ? "descobrir" : page === "repertorio" ? "repertorios" : page)));
  if(page==="musica"){const song=findSong(id);app.innerHTML=song?reader(song):empty("Cifra não encontrada","Tente outra música no catálogo.");}
  else if(page==="descobrir")app.innerHTML=discover();
  else if(page==="favoritos")app.innerHTML=favorites();
  else if(page==="repertorios")app.innerHTML=setlists();
  else if(page==="repertorio")app.innerHTML=setlistDetail(id);
  else if(page==="minhas")app.innerHTML=mySongs();
  else app.innerHTML=home();
  document.title = (page==="musica" && findSong(id) ? findSong(id).title+" — " : "")+"Sonora — Seu som, seu ritmo.";
}
function stopScroll() { if(state.scrollTimer){clearInterval(state.scrollTimer);state.scrollTimer=null;} }
function toggleScroll() {
  if(state.scrollTimer){stopScroll();render();return;}
  state.scrollTimer=setInterval(()=>{window.scrollBy(0,state.speed);if(window.innerHeight+window.scrollY>=document.body.scrollHeight-5){stopScroll();render();}},90);
  render();
}
function openDialog(id){byId(id).showModal();}
function openAdd(id) {
  state.pendingSong=id;
  if (!state.lists.length) { showToast("Crie primeiro um repertório."); openDialog("list-dialog"); return; }
  byId("song-to-add").value=id;
  byId("target-list").innerHTML=state.lists.map(l => '<option value="'+esc(l.id)+'">'+esc(l.name)+'</option>').join("");
  openDialog("add-dialog");
}
document.addEventListener("click",event=>{
  const close=event.target.closest("[data-close]");
  if(close){byId(close.dataset.close).close();return;}
  const btn=event.target.closest("[data-action]");
  if(!btn)return;
  const action=btn.dataset.action; const id=btn.dataset.id;
  if(action==="new-song"){openDialog("song-dialog");return;}
  if(action==="new-list"){openDialog("list-dialog");return;}
  if(action==="genre"){state.genre=btn.dataset.genre;render();return;}
  if(action==="favorite"){
    state.favorites = state.favorites.includes(id)?state.favorites.filter(v=>v!==id):[...state.favorites,id];
    save("favorites",state.favorites);render();return;
  }
  if(action==="transpose"){state.semitones=Math.max(-12,Math.min(12,state.semitones+Number(btn.dataset.step)));render();return;}
  if(action==="font"){state.font=Math.max(14,Math.min(30,state.font+Number(btn.dataset.step)));render();return;}
  if(action==="scroll"){toggleScroll();return;}
  if(action==="print"){window.print();return;}
  if(action==="add-to-list"){openAdd(id);return;}
  if(action==="delete-list" && confirm("Excluir este repertório?")){
    state.lists=state.lists.filter(l=>l.id!==id);save("lists",state.lists);render();showToast("Repertório excluído.");return;
  }
  if(action==="remove-from-list"){
    const list=state.lists.find(l=>l.id===btn.dataset.list);if(!list)return;
    list.songs=list.songs.filter(v=>v!==id);save("lists",state.lists);render();showToast("Música removida.");return;
  }
});
byId("global-search").addEventListener("submit",event=>{
  event.preventDefault();state.query=byId("search-input").value.trim();state.genre="Todos";
  if(route()!=="descobrir")location.hash="#descobrir";else render();
});
byId("search-input").addEventListener("input",event=>{
  state.query=event.target.value;
  if(route()==="descobrir"){
    const found=searchSongs(allSongs(),state.query,state.genre);
    byId("result-count").textContent=found.length+" cifra"+(found.length===1?"":"s")+" encontrada"+(found.length===1?"":"s");
    byId("search-results").innerHTML=cards(found);
  }
});
byId("song-form").addEventListener("submit",event=>{
  event.preventDefault();const form=new FormData(event.target);
  const song={id:"local-"+Date.now().toString(36),title:String(form.get("title")||"").trim(),artist:String(form.get("artist")||"").trim(),genre:String(form.get("genre")||"Outros"),key:String(form.get("key")||"C"),body:String(form.get("body")||"").trim(),level:"Personalizada",bpm:null,cover:"🎵",color:"#B5787C"};
  const error=validateSong(song);if(error){showToast(error);return;}
  if(state.userSongs.length>=100){showToast("Limite de 100 cifras locais atingido.");return;}
  state.userSongs.push(song);
  if(!save("songs",state.userSongs)){state.userSongs.pop();return;}
  byId("song-dialog").close();event.target.reset();state.semitones=0;location.hash="#musica/"+song.id;showToast("Sua cifra foi salva neste navegador!");
});
byId("list-form").addEventListener("submit",event=>{
  event.preventDefault();const name=String(new FormData(event.target).get("name")||"").trim();
  if(name.length<2||name.length>60){showToast("Use de 2 a 60 caracteres.");return;}
  const list={id:"list-"+Date.now().toString(36),name,songs:[]};state.lists.push(list);
  if(!save("lists",state.lists)){state.lists.pop();return;}
  byId("list-dialog").close();event.target.reset();render();
  if(state.pendingSong){const pending=state.pendingSong;state.pendingSong=null;openAdd(pending);}else showToast("Repertório criado!");
});
byId("add-form").addEventListener("submit",event=>{
  event.preventDefault();const data=new FormData(event.target);const list=state.lists.find(l=>l.id===data.get("list"));const song=findSong(data.get("song"));
  if(!list||!song){showToast("Escolha um repertório válido.");return;}
  if(!list.songs.includes(song.id))list.songs.push(song.id);
  save("lists",state.lists);byId("add-dialog").close();showToast("Música adicionada ao repertório.");
});
document.addEventListener("keydown",event=>{if(event.key==="/"&&!["INPUT","TEXTAREA"].includes(document.activeElement?.tagName)&&!document.querySelector("dialog[open]")){event.preventDefault();byId("search-input").focus();}});
window.addEventListener("hashchange",()=>{stopScroll();state.semitones=0;render();window.scrollTo(0,0);});
render();
