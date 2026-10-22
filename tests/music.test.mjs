import test from "node:test";
import assert from "node:assert/strict";
import {transposeChord,transposeText,normalizeSearch,searchSongs,validateSong,extractChords} from "../src/music.mjs";
import {songs} from "../src/catalog.mjs";

test("transposição positiva e negativa, acidente e baixo", () => {
  assert.equal(transposeChord("C",2),"D");
  assert.equal(transposeChord("Am",-2),"Gm");
  assert.equal(transposeChord("Bbmaj7",2),"Cmaj7");
  assert.equal(transposeChord("C#m7/G#",1),"Dm7/A");
  assert.equal(transposeChord("F#sus4",12),"F#sus4");
});
test("não modificar cifragem inválida ou texto normal", () => {
  assert.equal(transposeChord("Hello",3),"Hello");
  assert.equal(transposeText("[C]Olá [Am]mundo",2),"[D]Olá [Bm]mundo");
  assert.equal(transposeText("sem acordes",6),"sem acordes");
});
test("pesquisa ignora acentos, maiúsculas e filtra gênero", () => {
  assert.equal(normalizeSearch("  Música  "),"musica");
  assert.equal(searchSongs(songs,"primeiro sol")[0].id,"aurora");
  assert.equal(searchSongs(songs,"estudio sonora","Rock").length,1);
  assert.equal(searchSongs(songs,"inexistente").length,0);
});
test("validar adição de músicas autorais", () => {
  assert.ok(validateSong({title:"X",artist:"Artista",body:"muita letra escrita"}));
  assert.ok(validateSong({title:"Título",artist:"A",body:"muita letra escrita"}));
  assert.equal(validateSong({title:"Título",artist:"Autor",body:"[C]uma canção autoral"}),null);
});
test("catalogo de demonstração original e acordes extraídos", () => {
  assert.ok(songs.length >= 6);
  for (const song of songs) assert.equal(validateSong(song),null);
  assert.deepEqual(extractChords("[C]Oi [G]tchau [C]novo"),["C","G"]);
});
