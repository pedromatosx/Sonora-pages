import test from "node:test";
import assert from "node:assert/strict";
import {GUITAR_CHORDS,GUITAR_TUNING,parseBpm,beatIntervalMs,validShape,chordByName,tuningNote} from "../src/practice.mjs";

test("métronome valida BPM e define intervalos", () => {
  assert.equal(parseBpm(120),120);
  assert.equal(beatIntervalMs(120),500);
  assert.equal(beatIntervalMs(60),1000);
  assert.equal(parseBpm(39),null);
  assert.equal(parseBpm(241),null);
  assert.equal(parseBpm("abc"),null);
  assert.equal(parseBpm(60.5),null);
});
test("dicionário de acordes contém posições válidas em seis cordas", () => {
  assert.ok(GUITAR_CHORDS.length>=15);
  for(const shape of GUITAR_CHORDS) assert.ok(validShape(shape),shape.name);
  assert.deepEqual(chordByName("Am")?.frets,[-1,0,2,2,1,0]);
  assert.equal(chordByName("???"),null);
});
test("afinação padrão fornece seis notas e frequências", () => {
  assert.deepEqual(GUITAR_TUNING.map(n=>n.pitch),["E2","A2","D3","G3","B3","E4"]);
  assert.ok(GUITAR_TUNING.every(n=>n.frequency>=80&&n.frequency<=330));
  assert.equal(tuningNote("A2")?.frequency,110);
  assert.equal(tuningNote("C1"),null);
});
