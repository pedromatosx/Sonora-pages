// Todas as posições são para violão em afinação padrão, cordas 6ª -> 1ª.
export const GUITAR_TUNING = Object.freeze([
  {label:"6ª",note:"Mi grave",pitch:"E2",frequency:82.4069},
  {label:"5ª",note:"Lá",pitch:"A2",frequency:110},
  {label:"4ª",note:"Ré",pitch:"D3",frequency:146.8324},
  {label:"3ª",note:"Sol",pitch:"G3",frequency:195.9977},
  {label:"2ª",note:"Si",pitch:"B3",frequency:246.9417},
  {label:"1ª",note:"Mi aguda",pitch:"E4",frequency:329.6276}
]);
export const GUITAR_CHORDS = Object.freeze([
  {name:"C",label:"Dó maior",frets:[-1,3,2,0,1,0]},
  {name:"D",label:"Ré maior",frets:[-1,-1,0,2,3,2]},
  {name:"E",label:"Mi maior",frets:[0,2,2,1,0,0]},
  {name:"F",label:"Fá maior",frets:[1,3,3,2,1,1]},
  {name:"G",label:"Sol maior",frets:[3,2,0,0,0,3]},
  {name:"A",label:"Lá maior",frets:[-1,0,2,2,2,0]},
  {name:"Am",label:"Lá menor",frets:[-1,0,2,2,1,0]},
  {name:"Bm",label:"Si menor",frets:[-1,2,4,4,3,2]},
  {name:"Dm",label:"Ré menor",frets:[-1,-1,0,2,3,1]},
  {name:"Em",label:"Mi menor",frets:[0,2,2,0,0,0]},
  {name:"E7",label:"Mi com sétima",frets:[0,2,0,1,0,0]},
  {name:"G7",label:"Sol com sétima",frets:[3,2,0,0,0,1]},
  {name:"Fmaj7",label:"Fá com sétima maior",frets:[-1,-1,3,2,1,0]},
  {name:"Cmaj7",label:"Dó com sétima maior",frets:[-1,3,2,0,0,0]},
  {name:"F#m",label:"Fá sustenido menor",frets:[2,4,4,2,2,2]}
]);

export function parseBpm(input) {
  const bpm = Number(input);
  return Number.isInteger(bpm) && bpm >= 40 && bpm <= 240 ? bpm : null;
}
export function beatIntervalMs(bpm) {
  if (parseBpm(bpm) === null) return null;
  return 60000 / bpm;
}
export function validShape(chord) {
  return !!chord && typeof chord.name === "string" && Array.isArray(chord.frets) &&
    chord.frets.length === 6 && chord.frets.every(f => Number.isInteger(f) && f >= -1 && f <= 16);
}
export function chordByName(name) {
  return GUITAR_CHORDS.find(c => c.name.toLowerCase() === String(name ?? "").trim().toLowerCase()) ?? null;
}
export function tuningNote(pitch) {
  return GUITAR_TUNING.find(n => n.pitch === pitch) ?? null;
}
