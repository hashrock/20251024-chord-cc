/**
 * music.tsの動作確認用デモスクリプト
 * 実行方法: npx tsx src/utils/music-demo.ts
 */

import {
  noteToFrequency,
  frequencyToNote,
  noteStringToFrequency,
  frequencyToNoteString,
  midiNoteToFrequency,
  frequencyToMidiNote,
} from './music'

console.log('=== 音名と周波数の変換デモ ===\n')

// 1. 音名 → 周波数
console.log('1. 音名 + オクターブ → 周波数')
console.log(`  A4 → ${noteToFrequency('A', 4)} Hz`)
console.log(`  C4 → ${noteToFrequency('C', 4)} Hz`)
console.log(`  C#4 → ${noteToFrequency('C#', 4)} Hz`)
console.log(`  Db4 → ${noteToFrequency('Db', 4)} Hz (C#4と同じ)`)
console.log(`  E4 → ${noteToFrequency('E', 4)} Hz`)
console.log(`  G4 → ${noteToFrequency('G', 4)} Hz`)
console.log()

// 2. 周波数 → 音名
console.log('2. 周波数 → 音名 + オクターブ')
console.log(`  440 Hz → ${JSON.stringify(frequencyToNote(440))}`)
console.log(`  261.63 Hz → ${JSON.stringify(frequencyToNote(261.63))}`)
console.log(`  329.63 Hz → ${JSON.stringify(frequencyToNote(329.63))}`)
console.log(`  392 Hz → ${JSON.stringify(frequencyToNote(392))}`)
console.log()

// 3. 音名文字列 → 周波数
console.log('3. 音名文字列 → 周波数')
console.log(`  "A4" → ${noteStringToFrequency('A4')} Hz`)
console.log(`  "C4" → ${noteStringToFrequency('C4')} Hz`)
console.log(`  "C#5" → ${noteStringToFrequency('C#5')} Hz`)
console.log(`  "Bb3" → ${noteStringToFrequency('Bb3')} Hz`)
console.log()

// 4. 周波数 → 音名文字列
console.log('4. 周波数 → 音名文字列')
console.log(`  440 Hz → ${frequencyToNoteString(440)}`)
console.log(`  261.63 Hz → ${frequencyToNoteString(261.63)}`)
console.log(`  277.18 Hz → ${frequencyToNoteString(277.18)} (シャープ優先)`)
console.log(`  277.18 Hz → ${frequencyToNoteString(277.18, true)} (フラット優先)`)
console.log()

// 5. MIDI番号 → 周波数
console.log('5. MIDIノート番号 → 周波数')
console.log(`  MIDI 69 (A4) → ${midiNoteToFrequency(69)} Hz`)
console.log(`  MIDI 60 (C4) → ${midiNoteToFrequency(60)} Hz`)
console.log(`  MIDI 57 (A3) → ${midiNoteToFrequency(57)} Hz`)
console.log(`  MIDI 81 (A5) → ${midiNoteToFrequency(81)} Hz`)
console.log()

// 6. 周波数 → MIDI番号
console.log('6. 周波数 → MIDIノート番号')
console.log(`  440 Hz → MIDI ${frequencyToMidiNote(440)} (A4)`)
console.log(`  261.63 Hz → MIDI ${frequencyToMidiNote(261.63)} (C4)`)
console.log(`  220 Hz → MIDI ${frequencyToMidiNote(220)} (A3)`)
console.log(`  880 Hz → MIDI ${frequencyToMidiNote(880)} (A5)`)
console.log()

// 7. Cメジャートライアド (C-E-G) の周波数
console.log('7. Cメジャートライアド (C4-E4-G4) の周波数')
const cMajor = [
  { note: 'C', octave: 4 },
  { note: 'E', octave: 4 },
  { note: 'G', octave: 4 },
]
cMajor.forEach(({ note, octave }) => {
  const freq = noteToFrequency(note, octave)
  console.log(`  ${note}${octave} → ${freq} Hz`)
})
console.log()

// 8. オクターブごとのA音の周波数
console.log('8. オクターブごとのA音の周波数')
for (let octave = 0; octave <= 8; octave++) {
  const freq = noteToFrequency('A', octave)
  console.log(`  A${octave} → ${freq} Hz`)
}
console.log()

// 9. 相互変換の一貫性チェック
console.log('9. 相互変換の一貫性チェック')
const testNotes = ['C4', 'A4', 'G#5', 'Eb3']
testNotes.forEach(noteStr => {
  const freq = noteStringToFrequency(noteStr)
  const converted = frequencyToNoteString(freq)
  const match = noteStr === converted ? '✓' : '✗'
  console.log(`  ${noteStr} → ${freq} Hz → ${converted} ${match}`)
})
console.log()

console.log('=== デモ終了 ===')
