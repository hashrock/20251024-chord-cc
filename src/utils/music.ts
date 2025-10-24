/**
 * 音名と周波数を変換するユーティリティ関数
 * 基準: A4 = 440 Hz
 * 半音上がるごとに周波数は 2^(1/12) 倍になる
 */

// 音名から半音番号へのマップ (C = 0)
const NOTE_TO_SEMITONE: Record<string, number> = {
  'C': 0,
  'C#': 1,
  'Db': 1,
  'D': 2,
  'D#': 3,
  'Eb': 3,
  'E': 4,
  'F': 5,
  'F#': 6,
  'Gb': 6,
  'G': 7,
  'G#': 8,
  'Ab': 8,
  'A': 9,
  'A#': 10,
  'Bb': 10,
  'B': 11,
}

// 半音番号から音名へのマップ (シャープ優先)
const SEMITONE_TO_NOTE_SHARP = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']

// 半音番号から音名へのマップ (フラット優先)
const SEMITONE_TO_NOTE_FLAT = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B']

/**
 * 音名+オクターブを周波数に変換
 * @param note 音名 (例: "C", "C#", "Db")
 * @param octave オクターブ (例: 4)
 * @returns 周波数 (Hz)
 * @example
 * noteToFrequency("A", 4) // => 440
 * noteToFrequency("C", 4) // => 261.63
 */
export function noteToFrequency(note: string, octave: number): number {
  const semitone = NOTE_TO_SEMITONE[note]
  if (semitone === undefined) {
    throw new Error(`Invalid note: ${note}`)
  }

  // A4 = 440 Hz を基準とする
  // A4 はオクターブ4の9番目の半音
  const a4Semitone = 9 // A
  const a4Octave = 4
  const a4Frequency = 440

  // 基準音からの半音差を計算
  const semitoneDistance = (octave - a4Octave) * 12 + (semitone - a4Semitone)

  // 周波数を計算: f = 440 * 2^(n/12)
  const frequency = a4Frequency * Math.pow(2, semitoneDistance / 12)

  return Math.round(frequency * 100) / 100 // 小数点第2位まで
}

/**
 * 周波数を音名+オクターブに変換
 * @param frequency 周波数 (Hz)
 * @param preferFlat フラット記号を優先するか (デフォルト: false)
 * @returns { note: 音名, octave: オクターブ }
 * @example
 * frequencyToNote(440) // => { note: "A", octave: 4 }
 * frequencyToNote(261.63) // => { note: "C", octave: 4 }
 */
export function frequencyToNote(frequency: number, preferFlat: boolean = false): { note: string, octave: number } {
  // A4 = 440 Hz を基準とする
  const a4Frequency = 440
  const a4Semitone = 9 // A
  const a4Octave = 4

  // 周波数から半音差を計算: n = 12 * log2(f / 440)
  const semitoneDistance = Math.round(12 * Math.log2(frequency / a4Frequency))

  // 半音差からオクターブと音名を計算
  const totalSemitones = a4Octave * 12 + a4Semitone + semitoneDistance
  const octave = Math.floor(totalSemitones / 12)
  const semitone = totalSemitones % 12

  // 負の剰余に対応
  const normalizedSemitone = semitone >= 0 ? semitone : semitone + 12
  const normalizedOctave = semitone >= 0 ? octave : octave - 1

  const noteMap = preferFlat ? SEMITONE_TO_NOTE_FLAT : SEMITONE_TO_NOTE_SHARP
  const note = noteMap[normalizedSemitone]

  return { note, octave: normalizedOctave }
}

/**
 * 文字列から音名+オクターブを周波数に変換
 * @param noteString 音名文字列 (例: "C4", "A#5", "Bb3")
 * @returns 周波数 (Hz)
 * @example
 * noteStringToFrequency("A4") // => 440
 * noteStringToFrequency("C#4") // => 277.18
 */
export function noteStringToFrequency(noteString: string): number {
  // 音名とオクターブを分離
  const match = noteString.match(/^([A-G][#b]?)(\d+)$/)
  if (!match) {
    throw new Error(`Invalid note string: ${noteString}`)
  }

  const note = match[1]
  const octave = parseInt(match[2], 10)

  return noteToFrequency(note, octave)
}

/**
 * 周波数を音名文字列に変換
 * @param frequency 周波数 (Hz)
 * @param preferFlat フラット記号を優先するか (デフォルト: false)
 * @returns 音名文字列 (例: "C4", "A#5")
 * @example
 * frequencyToNoteString(440) // => "A4"
 * frequencyToNoteString(261.63) // => "C4"
 */
export function frequencyToNoteString(frequency: number, preferFlat: boolean = false): string {
  const { note, octave } = frequencyToNote(frequency, preferFlat)
  return `${note}${octave}`
}

/**
 * MIDIノート番号を周波数に変換
 * @param midiNote MIDIノート番号 (0-127, C-1 = 0, A4 = 69)
 * @returns 周波数 (Hz)
 * @example
 * midiNoteToFrequency(69) // => 440 (A4)
 * midiNoteToFrequency(60) // => 261.63 (C4)
 */
export function midiNoteToFrequency(midiNote: number): number {
  if (midiNote < 0 || midiNote > 127) {
    throw new Error(`Invalid MIDI note: ${midiNote}`)
  }

  // A4 = MIDI 69 = 440 Hz
  const a4MidiNote = 69
  const a4Frequency = 440

  const semitoneDistance = midiNote - a4MidiNote
  const frequency = a4Frequency * Math.pow(2, semitoneDistance / 12)

  return Math.round(frequency * 100) / 100
}

/**
 * 周波数をMIDIノート番号に変換
 * @param frequency 周波数 (Hz)
 * @returns MIDIノート番号 (0-127)
 * @example
 * frequencyToMidiNote(440) // => 69 (A4)
 * frequencyToMidiNote(261.63) // => 60 (C4)
 */
export function frequencyToMidiNote(frequency: number): number {
  const a4MidiNote = 69
  const a4Frequency = 440

  const semitoneDistance = Math.round(12 * Math.log2(frequency / a4Frequency))
  const midiNote = a4MidiNote + semitoneDistance

  if (midiNote < 0 || midiNote > 127) {
    throw new Error(`Frequency out of MIDI range: ${frequency} Hz`)
  }

  return midiNote
}
