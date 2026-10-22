export const SHARPS = ["C","C#","D","D#","E","F","F#","G","G#","A","A#","B"];
export const FLATS = ["C","Db","D","Eb","E","F","Gb","G","Ab","A","Bb","B"];
const INDEX = {C:0,"B#":0,"C#":1,Db:1,D:2,"D#":3,Eb:3,E:4,Fb:4,F:5,"E#":5,"F#":6,Gb:6,G:7,"G#":8,Ab:8,A:9,"A#":10,Bb:10,B:11,Cb:11};

export function transposeChord(chord, semitones = 0) {
  if (typeof chord !== "string" || !Number.isInteger(semitones)) return chord;
  const match = /^([A-G](?:#|b)?)([^/\s]*)(?:\/([A-G](?:#|b)?))?$/.exec(chord.trim());
  if (!match || !Object.hasOwn(INDEX, match[1]) || (match[3] && !Object.hasOwn(INDEX, match[3]))) return chord;
  if (semitones % 12 === 0) return chord;
  const names = chord.includes("b") && !chord.includes("#") ? FLATS : SHARPS;
  const shift = (note) => names[((INDEX[note] + semitones) % 12 + 12) % 12];
  return shift(match[1]) + match[2] + (match[3] ? "/" + shift(match[3]) : "");
}

export function transposeText(text, semitones = 0) {
  if (typeof text !== "string") return "";
  return text.replace(/\[([^\]\n]{1,24})\]/g, (whole, chord) => {
    const changed = transposeChord(chord, semitones);
    return "[" + changed + "]";
  });
}

export function normalizeSearch(value) {
  return String(value ?? "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
}

export function searchSongs(songs, query = "", genre = "Todos") {
  const q = normalizeSearch(query);
  return songs.filter(song => {
    if (genre !== "Todos" && song.genre !== genre) return false;
    const haystack = normalizeSearch([song.title, song.artist, song.genre, song.key].join(" "));
    return q.split(/\s+/).every(part => haystack.includes(part));
  });
}

export function validateSong(song) {
  if (!song || typeof song !== "object") return "Dados inválidos.";
  if (typeof song.title !== "string" || song.title.trim().length < 2 || song.title.trim().length > 90) return "Título deve ter de 2 a 90 caracteres.";
  if (typeof song.artist !== "string" || song.artist.trim().length < 2 || song.artist.trim().length > 90) return "Artista deve ter de 2 a 90 caracteres.";
  if (typeof song.body !== "string" || song.body.trim().length < 10 || song.body.length > 12000) return "Cifra deve ter de 10 a 12.000 caracteres.";
  return null;
}

export function extractChords(body) {
  if (typeof body !== "string") return [];
  return [...new Set([...body.matchAll(/\[([^\]\n]{1,24})\]/g)].map(m => m[1]).filter(c => transposeChord(c, 1) !== c))];
}
