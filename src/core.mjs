const chromatic=['C','C#','D','D#','E','F','F#','G','G#','A','A#','B'];
const pitches={C:0,'C#':1,Db:1,D:2,'D#':3,Eb:3,E:4,F:5,'F#':6,Gb:6,G:7,'G#':8,Ab:8,A:9,'A#':10,Bb:10,B:11};
export function transposeChord(chord,semitones=0){
 if(typeof chord!=='string'||!Number.isInteger(semitones))return chord;
 return chord.replace(/\b([A-G])([#b]?)([^\s/]*)((?:\/)([A-G])([#b]?))?/g,(all,root,acc,suffix,slash,bass,bassAcc)=>{
 const pitch=pitches[root+acc];if(pitch===undefined)return all;
 const shifted=chromatic[((pitch+semitones)%12+12)%12];
 const newBass=bass?'/'+chromatic[((pitches[bass+(bassAcc||'')]+semitones)%12+12)%12]:'';
 return shifted+suffix+newBass;
 });
}
export function findLocalTrack(tracks,query){const q=String(query||'').trim().toLocaleLowerCase('pt-BR');return q?tracks.find(t=>(t.title+' '+t.artist).toLocaleLowerCase('pt-BR').includes(q)):undefined}
export function safeParseFavorites(value){try{const v=JSON.parse(value);return Array.isArray(v)?[...new Set(v.filter(x=>typeof x==='string'))]:[]}catch{return []}}
