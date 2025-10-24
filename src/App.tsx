import { useState } from 'react'
import './App.css'
import { noteToFrequency, frequencyToNote } from './utils/music'

interface Chord {
  root: string
  quality: string
  isBorrowed?: boolean
}

function App() {
  const [chords, setChords] = useState<Chord[]>([])
  const [isPlaying, setIsPlaying] = useState(false)
  const [selectedMode, setSelectedMode] = useState<string>('aeolian')
  const [lastAddedChord, setLastAddedChord] = useState<string>('')
  const [closedVoicing, setClosedVoicing] = useState(false)
  const [lastChordFrequencies, setLastChordFrequencies] = useState<number[]>([])
  const [waveformType, setWaveformType] = useState<OscillatorType>('sine')
  const [showExplanation, setShowExplanation] = useState(false)
  const [playingNotes, setPlayingNotes] = useState<string[]>([])

  // 選択中のモードで使用される音階を取得
  const getScaleNotes = (mode: string): string[] => {
    const modeKey = mode as keyof typeof modes
    if (!modes[modeKey]) return ['C']

    // トニックのCと、cushChordsのroot音を集める
    const scaleNotes = new Set<string>(['C'])
    modes[modeKey].cushChords.forEach(chord => {
      scaleNotes.add(chord.root)
    })

    return Array.from(scaleNotes)
  }

  // 音名順に並べる
  const roots = [
    { note: 'C', degree: 'I', diatonic: '' },      // メジャー
    { note: 'D', degree: 'IIm', diatonic: 'm' },   // マイナー
    { note: 'E', degree: 'IIIm', diatonic: 'm' },  // マイナー
    { note: 'F', degree: 'IV', diatonic: '' },     // メジャー
    { note: 'G', degree: 'V', diatonic: '' },      // メジャー
    { note: 'A', degree: 'VIm', diatonic: 'm' },   // マイナー
    { note: 'B', degree: 'VIIdim', diatonic: 'dim' }, // ディミニッシュ
  ]
  const qualities = [
    { label: 'メジャー', value: '' },
    { label: 'マイナー', value: 'm' },
    { label: '7th', value: '7' },
    { label: 'm7', value: 'm7' },
    { label: 'M7', value: 'M7' },
    { label: 'dim', value: 'dim' },
    { label: 'aug', value: 'aug' },
  ]

  // モード定義：各モードと親スケールの関係
  const modes = {
    aeolian: {
      name: 'Aeolian (エオリアン)',
      parentKey: 'Eb Major',
      description: 'C Aeolian = Eb Majorの6番目のモード（暗め・マイナー的）',
      cushChords: [
        { root: 'Eb', quality: '', degree: 'I', function: 'トニック' },
        { root: 'Eb', quality: 'M7', degree: 'IM7', function: 'トニック' },
        { root: 'F', quality: 'm', degree: 'II', function: 'サブドミナント' },
        { root: 'F', quality: 'm7', degree: 'IIm7', function: 'サブドミナント' },
        { root: 'G', quality: 'm', degree: 'III', function: 'メディアント' },
        { root: 'G', quality: 'm7', degree: 'IIIm7', function: 'メディアント' },
        { root: 'Ab', quality: '', degree: 'IV', function: 'サブドミナント' },
        { root: 'Ab', quality: 'M7', degree: 'IVM7', function: 'サブドミナント' },
        { root: 'Bb', quality: '', degree: 'V', function: 'ドミナント' },
        { root: 'Bb', quality: '7', degree: 'V7', function: 'ドミナント' },
        { root: 'D', quality: 'dim', degree: 'VII', function: 'リーディングトーン' },
      ]
    },
    dorian: {
      name: 'Dorian (ドリアン)',
      parentKey: 'Bb Major',
      description: 'C Dorian = Bb Majorの2番目のモード（明るめのマイナー）',
      cushChords: [
        { root: 'Bb', quality: '', degree: 'I', function: 'トニック' },
        { root: 'Bb', quality: 'M7', degree: 'IM7', function: 'トニック' },
        { root: 'D', quality: 'm', degree: 'III', function: 'メディアント' },
        { root: 'D', quality: 'm7', degree: 'IIIm7', function: 'メディアント' },
        { root: 'Eb', quality: '', degree: 'IV', function: 'サブドミナント' },
        { root: 'Eb', quality: 'M7', degree: 'IVM7', function: 'サブドミナント' },
        { root: 'F', quality: '', degree: 'V', function: 'ドミナント' },
        { root: 'F', quality: '7', degree: 'V7', function: 'ドミナント' },
        { root: 'G', quality: 'm', degree: 'VI', function: 'サブメディアント' },
        { root: 'G', quality: 'm7', degree: 'VIm7', function: 'サブメディアント' },
        { root: 'A', quality: 'dim', degree: 'VII', function: 'リーディングトーン' },
      ]
    },
    phrygian: {
      name: 'Phrygian (フリジアン)',
      parentKey: 'Ab Major',
      description: 'C Phrygian = Ab Majorの3番目のモード（エキゾチック・暗い）',
      cushChords: [
        { root: 'Ab', quality: '', degree: 'I', function: 'トニック' },
        { root: 'Ab', quality: 'M7', degree: 'IM7', function: 'トニック' },
        { root: 'Bb', quality: 'm', degree: 'II', function: 'サブドミナント' },
        { root: 'Bb', quality: 'm7', degree: 'IIm7', function: 'サブドミナント' },
        { root: 'Db', quality: '', degree: 'IV', function: 'サブドミナント' },
        { root: 'Db', quality: 'M7', degree: 'IVM7', function: 'サブドミナント' },
        { root: 'Eb', quality: '', degree: 'V', function: 'ドミナント' },
        { root: 'Eb', quality: '7', degree: 'V7', function: 'ドミナント' },
        { root: 'F', quality: 'm', degree: 'VI', function: 'サブメディアント' },
        { root: 'F', quality: 'm7', degree: 'VIm7', function: 'サブメディアント' },
        { root: 'G', quality: 'dim', degree: 'VII', function: 'リーディングトーン' },
      ]
    },
    lydian: {
      name: 'Lydian (リディアン)',
      parentKey: 'G Major',
      description: 'C Lydian = G Majorの4番目のモード（明るく浮遊感）',
      cushChords: [
        { root: 'G', quality: '', degree: 'I', function: 'トニック' },
        { root: 'G', quality: 'M7', degree: 'IM7', function: 'トニック' },
        { root: 'A', quality: 'm', degree: 'II', function: 'サブドミナント' },
        { root: 'A', quality: 'm7', degree: 'IIm7', function: 'サブドミナント' },
        { root: 'B', quality: 'm', degree: 'III', function: 'メディアント' },
        { root: 'B', quality: 'm7', degree: 'IIIm7', function: 'メディアント' },
        { root: 'D', quality: '', degree: 'V', function: 'ドミナント' },
        { root: 'D', quality: '7', degree: 'V7', function: 'ドミナント' },
        { root: 'E', quality: 'm', degree: 'VI', function: 'サブメディアント' },
        { root: 'E', quality: 'm7', degree: 'VIm7', function: 'サブメディアント' },
        { root: 'F#', quality: 'dim', degree: 'VII', function: 'リーディングトーン' },
      ]
    },
    mixolydian: {
      name: 'Mixolydian (ミクソリディアン)',
      parentKey: 'F Major',
      description: 'C Mixolydian = F Majorの5番目のモード（明るくブルージー）',
      cushChords: [
        { root: 'F', quality: '', degree: 'I', function: 'トニック' },
        { root: 'F', quality: 'M7', degree: 'IM7', function: 'トニック' },
        { root: 'G', quality: 'm', degree: 'II', function: 'サブドミナント' },
        { root: 'G', quality: 'm7', degree: 'IIm7', function: 'サブドミナント' },
        { root: 'A', quality: 'm', degree: 'III', function: 'メディアント' },
        { root: 'A', quality: 'm7', degree: 'IIIm7', function: 'メディアント' },
        { root: 'Bb', quality: '', degree: 'IV', function: 'サブドミナント' },
        { root: 'Bb', quality: 'M7', degree: 'IVM7', function: 'サブドミナント' },
        { root: 'D', quality: 'm', degree: 'VI', function: 'サブメディアント' },
        { root: 'D', quality: 'm7', degree: 'VIm7', function: 'サブメディアント' },
        { root: 'E', quality: 'dim', degree: 'VII', function: 'リーディングトーン' },
      ]
    },
    jazz: {
      name: 'Jazz (ジャズ)',
      parentKey: 'C Major Jazz',
      description: 'ジャズの典型的な7thコードを使用（II-V-I進行が基本）',
      cushChords: [
        { root: 'D', quality: 'm7', degree: 'IIm7', function: 'サブドミナント' },
        { root: 'G', quality: '7', degree: 'V7', function: 'ドミナント' },
        { root: 'C', quality: 'M7', degree: 'IM7', function: 'トニック' },
        { root: 'E', quality: 'm7', degree: 'IIIm7', function: 'メディアント' },
        { root: 'A', quality: 'm7', degree: 'VIm7', function: 'サブメディアント' },
        { root: 'F', quality: 'M7', degree: 'IVM7', function: 'サブドミナント' },
        { root: 'B', quality: 'dim', degree: 'VIIdim', function: 'リーディングトーン' },
      ]
    }
  }

  // コード進行のつながり（トニック → サブドミナント → ドミナント → トニック）
  const chordProgressions: Record<string, string[]> = {
    // トニック（I）から
    'C': ['Dm', 'Em', 'F', 'G', 'Am'],
    // サブドミナント（IV, IIm, VIm）から
    'F': ['G', 'Dm', 'Em', 'Am', 'C'],
    'Dm': ['G', 'F', 'Em', 'Am', 'C'],
    'Am': ['F', 'Dm', 'G', 'C', 'Em'],
    // ドミナント（V）から
    'G': ['C', 'Am', 'F'],
    // メディアント（IIIm）から
    'Em': ['Am', 'F', 'Dm', 'G'],
    // ディミニッシュから
    'Bdim': ['C', 'Em', 'G'],
  }

  // Cush Chordsのコード進行も追加
  const getCushProgressions = (mode: keyof typeof modes): Record<string, string[]> => {
    const cushChords = modes[mode].cushChords
    // 親スケールのコードからのつながり
    const progressions: Record<string, string[]> = {
      'C': cushChords.map(c => `${c.root}${c.quality}`)
    }

    cushChords.forEach(chord => {
      const chordName = `${chord.root}${chord.quality}`
      // 基本的な進行: サブドミナント → ドミナント → トニック
      if (chord.function === 'サブドミナント') {
        progressions[chordName] = cushChords
          .filter(c => c.function === 'ドミナント' || c.function === 'メディアント')
          .map(c => `${c.root}${c.quality}`)
        progressions[chordName].push('C')
      } else if (chord.function === 'ドミナント') {
        progressions[chordName] = ['C']
        cushChords
          .filter(c => c.function === 'サブドミナント')
          .forEach(c => progressions[chordName].push(`${c.root}${c.quality}`))
      } else {
        progressions[chordName] = cushChords.map(c => `${c.root}${c.quality}`)
        progressions[chordName].push('C')
      }
    })

    return progressions
  }

  const addChord = (root: string, quality: string, isBorrowed = false) => {
    setChords([...chords, { root, quality, isBorrowed }])
    setLastAddedChord(`${root}${quality}`)
    // ボタンを押したときに音を鳴らす
    playSingleChord({ root, quality, isBorrowed })
  }

  // 周波数から音名を取得
  const getNoteName = (freq: number): string => {
    const { note } = frequencyToNote(freq, true) // フラット優先
    return note
  }

  const playSingleChord = (chord: Chord) => {
    const audioContext = new AudioContext()
    const frequencies = getChordFrequencies(chord)
    setLastChordFrequencies(frequencies) // 次のコードのために保存

    // 再生中の音名を設定
    const noteNames = frequencies.map(freq => getNoteName(freq))
    setPlayingNotes(noteNames)

    const startTime = audioContext.currentTime
    const duration = 0.5

    // duration後に再生中の音をクリア
    setTimeout(() => {
      setPlayingNotes([])
    }, duration * 1000)

    // ベーストーンを2オクターブ下で追加（周波数を1/4に）
    const bassFreq = frequencies[0] / 4
    const bassOscillator = audioContext.createOscillator()
    const bassGain = audioContext.createGain()

    bassOscillator.type = waveformType
    bassOscillator.frequency.value = bassFreq
    bassGain.gain.setValueAtTime(0.2, startTime)
    bassGain.gain.exponentialRampToValueAtTime(0.01, startTime + duration)

    bassOscillator.connect(bassGain)
    bassGain.connect(audioContext.destination)
    bassOscillator.start(startTime)
    bassOscillator.stop(startTime + duration)

    // 和音の各音
    frequencies.forEach(freq => {
      const oscillator = audioContext.createOscillator()
      const gainNode = audioContext.createGain()

      oscillator.type = waveformType
      oscillator.frequency.value = freq

      gainNode.gain.setValueAtTime(0.12, startTime)
      gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + duration)

      oscillator.connect(gainNode)
      gainNode.connect(audioContext.destination)

      oscillator.start(startTime)
      oscillator.stop(startTime + duration)
    })
  }

  const removeChord = (index: number) => {
    setChords(chords.filter((_, i) => i !== index))
  }

  const clearChords = () => {
    setChords([])
    setLastChordFrequencies([])
  }

  const exportToText = () => {
    const text = chords.map(c => `${c.root}${c.quality}${c.isBorrowed ? ' (借用)' : ''}`).join(' - ')
    console.log(text)
    navigator.clipboard.writeText(text)
    alert('コード進行をクリップボードにコピーしました:\n' + text)
  }

  const playChords = async () => {
    if (isPlaying || chords.length === 0) return

    setIsPlaying(true)
    const audioContext = new AudioContext()

    for (let i = 0; i < chords.length; i++) {
      await playChord(audioContext, chords[i])
    }

    setIsPlaying(false)
  }

  const playChord = (audioContext: AudioContext, chord: Chord) => {
    return new Promise<void>((resolve) => {
      const frequencies = getChordFrequencies(chord)

      // 再生中の音名を設定
      const noteNames = frequencies.map(freq => getNoteName(freq))
      setPlayingNotes(noteNames)

      const startTime = audioContext.currentTime
      const duration = 1.0

      frequencies.forEach(freq => {
        const oscillator = audioContext.createOscillator()
        const gainNode = audioContext.createGain()

        oscillator.type = waveformType
        oscillator.frequency.value = freq

        gainNode.gain.setValueAtTime(0.2, startTime)
        gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + duration)

        oscillator.connect(gainNode)
        gainNode.connect(audioContext.destination)

        oscillator.start(startTime)
        oscillator.stop(startTime + duration)
      })

      setTimeout(() => {
        setPlayingNotes([])
        resolve()
      }, duration * 1000)
    })
  }

  const getChordFrequencies = (chord: Chord): number[] => {
    // noteToFrequencyを使用して周波数を計算（オクターブ4を基準）
    const rootFreq = noteToFrequency(chord.root, 4)

    // 半音を追加する関数
    const addSemitones = (freq: number, semitones: number): number => {
      return freq * Math.pow(2, semitones / 12)
    }

    let frequencies: number[] = []

    // 和音構成を音程（半音数）で定義
    if (chord.quality === 'm') {
      // マイナー: root, minor 3rd (3半音), perfect 5th (7半音)
      frequencies = [rootFreq, addSemitones(rootFreq, 3), addSemitones(rootFreq, 7)]
    } else if (chord.quality === '7') {
      // 7th: root, major 3rd (4半音), perfect 5th (7半音), minor 7th (10半音)
      frequencies = [rootFreq, addSemitones(rootFreq, 4), addSemitones(rootFreq, 7), addSemitones(rootFreq, 10)]
    } else if (chord.quality === 'M7') {
      // M7: root, major 3rd (4半音), perfect 5th (7半音), major 7th (11半音)
      frequencies = [rootFreq, addSemitones(rootFreq, 4), addSemitones(rootFreq, 7), addSemitones(rootFreq, 11)]
    } else if (chord.quality === 'm7') {
      // m7: root, minor 3rd (3半音), perfect 5th (7半音), minor 7th (10半音)
      frequencies = [rootFreq, addSemitones(rootFreq, 3), addSemitones(rootFreq, 7), addSemitones(rootFreq, 10)]
    } else if (chord.quality === 'dim') {
      // dim: root, minor 3rd (3半音), diminished 5th (6半音)
      frequencies = [rootFreq, addSemitones(rootFreq, 3), addSemitones(rootFreq, 6)]
    } else if (chord.quality === 'aug') {
      // aug: root, major 3rd (4半音), augmented 5th (8半音)
      frequencies = [rootFreq, addSemitones(rootFreq, 4), addSemitones(rootFreq, 8)]
    } else {
      // メジャー: root, major 3rd (4半音), perfect 5th (7半音)
      frequencies = [rootFreq, addSemitones(rootFreq, 4), addSemitones(rootFreq, 7)]
    }

    // Closed voicing: 前のコードから各音が最小限の距離で移動する（ボイスリーディング）
    if (closedVoicing && lastChordFrequencies.length > 0) {
      // 音域の範囲制限（C3 ~ C6）
      const minFreq = noteToFrequency('C', 3)
      const maxFreq = noteToFrequency('C', 6)

      // 各音を前のコードの対応する音に最も近いオクターブに配置
      frequencies = frequencies.map((freq, index) => {
        // 前のコードの対応する音（なければ中央の音）
        const targetFreq = lastChordFrequencies[index] || lastChordFrequencies[Math.floor(lastChordFrequencies.length / 2)]

        // 最も近いオクターブを探す
        let bestFreq = freq
        let minDistance = Math.abs(freq - targetFreq)

        // 上下2オクターブ分探索
        for (let octave = -2; octave <= 2; octave++) {
          const testFreq = freq * Math.pow(2, octave)
          // 範囲内の音のみを候補にする
          if (testFreq >= minFreq && testFreq <= maxFreq) {
            const distance = Math.abs(testFreq - targetFreq)
            if (distance < minDistance) {
              minDistance = distance
              bestFreq = testFreq
            }
          }
        }

        // 範囲内に収める（念のための安全策）
        if (bestFreq < minFreq) bestFreq = freq * 2
        if (bestFreq > maxFreq) bestFreq = freq / 2

        return bestFreq
      })

      // 周波数順にソート
      frequencies.sort((a, b) => a - b)
    }

    return frequencies
  }

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto', paddingBottom: '280px' }}>
      <h1>コード進行作成ツール</h1>

      <div style={{ marginBottom: '20px' }}>
        <h2>現在のコード進行:</h2>
        <div style={{
          minHeight: '60px',
          maxHeight: '120px',
          overflowX: 'auto',
          overflowY: 'hidden',
          padding: '15px',
          border: '2px solid #ccc',
          borderRadius: '5px',
          display: 'flex',
          gap: '10px',
          alignItems: 'center',
          whiteSpace: 'nowrap'
        }}>
          {chords.length === 0 ? (
            <span style={{ color: '#999' }}>コードを追加してください</span>
          ) : (
            chords.map((chord, index) => (
              <div
                key={index}
                style={{
                  padding: '8px 12px',
                  background: '#ffffff',
                  color: '#000',
                  border: chord.isBorrowed ? '2px solid #666' : '2px solid #333',
                  borderRadius: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  flexShrink: 0,
                  boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                }}
              >
                <span>{chord.root}{chord.quality}</span>
                <button
                  onClick={() => removeChord(index)}
                  style={{
                    background: '#f0f0f0',
                    border: '1px solid #ccc',
                    color: '#333',
                    borderRadius: '3px',
                    cursor: 'pointer',
                    padding: '2px 6px'
                  }}
                >
                  ×
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* 鍵盤ビジュアライゼーション - 画面下部に固定 */}
      <div style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: '#fff',
        borderTop: '2px solid #333',
        boxShadow: '0 -4px 10px rgba(0,0,0,0.1)',
        zIndex: 1000,
        padding: '10px 20px'
      }}>
        <h3 style={{ margin: '0 0 10px 0', fontSize: '16px' }}>鍵盤プレビュー</h3>
        <div style={{
          padding: '10px',
          backgroundColor: '#f9f9f9',
          overflowX: 'auto',
          borderRadius: '5px',
          display: 'flex',
          justifyContent: 'center'
        }}>
          <div style={{ position: 'relative', height: '120px', width: '1050px' }}>
            {/* 白鍵 - 3オクターブ */}
            {[3, 4, 5].map((octave, octaveIndex) =>
              ['C', 'D', 'E', 'F', 'G', 'A', 'B'].map((note, noteIndex) => {
                const noteWithOctave = `${note}${octave}`
                const isPlaying = playingNotes.includes(note)
                const isInScale = getScaleNotes(selectedMode).includes(note)

                // 白鍵の位置を計算: 各白鍵は50px幅、7つで1オクターブ（350px）
                const left = noteIndex * 50 + octaveIndex * 350

                return (
                  <div
                    key={noteWithOctave}
                    style={{
                      position: 'absolute',
                      left: `${left}px`,
                      width: '50px',
                      height: '120px',
                      backgroundColor: isPlaying ? '#ff6b6b' : isInScale ? '#e3f2fd' : '#fff',
                      border: '2px solid #333',
                      borderRadius: '0 0 5px 5px',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'flex-end',
                      paddingBottom: '5px',
                      fontSize: '9px',
                      fontWeight: 'bold',
                      color: isPlaying ? '#fff' : isInScale ? '#000' : '#666',
                      transition: 'all 0.1s ease',
                      boxShadow: isPlaying ? '0 0 15px rgba(255, 107, 107, 0.8)' : 'none',
                      transform: isPlaying ? 'translateY(2px)' : 'none',
                      zIndex: 1
                    }}
                  >
                    <div style={{ fontSize: '10px' }}>{note}</div>
                    <div style={{ fontSize: '7px', opacity: 0.5 }}>{octave}</div>
                  </div>
                )
              })
            ).flat()}
            {/* 黒鍵 - 3オクターブ */}
            {[3, 4, 5].map((octave, octaveIndex) =>
              [
                { note: 'Db', offset: 35 },   // CとDの間
                { note: 'Eb', offset: 85 },   // DとEの間
                { note: 'F#', offset: 185 },  // FとGの間
                { note: 'Ab', offset: 235 },  // GとAの間
                { note: 'Bb', offset: 285 },  // AとBの間
              ].map(({ note, offset }) => {
                const noteWithOctave = `${note}${octave}`
                const left = offset + (octaveIndex * 350)
                const isPlaying = playingNotes.includes(note)
                const isInScale = getScaleNotes(selectedMode).includes(note)

                return (
                  <div
                    key={noteWithOctave}
                    style={{
                      position: 'absolute',
                      left: `${left}px`,
                      width: '30px',
                      height: '70px',
                      backgroundColor: isPlaying ? '#ff6b6b' : isInScale ? '#666' : '#000',
                      border: '2px solid #333',
                      borderRadius: '0 0 3px 3px',
                      zIndex: 2,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'flex-end',
                      paddingBottom: '3px',
                      fontSize: '7px',
                      fontWeight: 'bold',
                      color: '#fff',
                      transition: 'all 0.1s ease',
                      boxShadow: isPlaying ? '0 0 15px rgba(255, 107, 107, 0.8)' : 'none',
                      transform: isPlaying ? 'translateY(2px)' : 'none'
                    }}
                  >
                    <div style={{ fontSize: '8px' }}>{note}</div>
                    <div style={{ fontSize: '6px', opacity: 0.7 }}>{octave}</div>
                  </div>
                )
              })
            ).flat()}
          </div>
        </div>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <h3>コードを追加:</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '5px', marginBottom: '10px' }}>
          {roots.map(root => (
            <div key={root.note}>
              <div style={{ fontWeight: 'bold', marginBottom: '5px', textAlign: 'center' }}>
                {root.note}
                <div style={{ fontSize: '10px', color: '#666' }}>{root.degree}</div>
              </div>
              {/* スケールに合った基本コード */}
              <button
                onClick={() => addChord(root.note, root.diatonic)}
                style={{
                  width: '100%',
                  padding: '8px 2px',
                  marginBottom: '5px',
                  fontSize: '12px',
                  cursor: 'pointer',
                  background: '#ffffff',
                  color: '#000000',
                  border: lastAddedChord && chordProgressions[lastAddedChord]?.includes(`${root.note}${root.diatonic}`) ? '3px solid #ff6b6b' : '2px solid #333333',
                  fontWeight: 'bold',
                  transition: 'all 0.2s ease',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                }}
              >
                {root.note}{root.diatonic}
              </button>
              {qualities.map(quality => {
                const chordName = `${root.note}${quality.value}`
                const isHighlighted = lastAddedChord && chordProgressions[lastAddedChord]?.includes(chordName)

                return (
                  <button
                    key={`${root.note}-${quality.value}`}
                    onClick={() => addChord(root.note, quality.value)}
                    style={{
                      width: '100%',
                      padding: '5px 2px',
                      marginBottom: '3px',
                      fontSize: '11px',
                      cursor: 'pointer',
                      background: 'white',
                      color: 'inherit',
                      border: isHighlighted ? '3px solid #ff6b6b' : '1px solid #ccc',
                      fontWeight: isHighlighted ? 'bold' : 'normal',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    {quality.label}
                  </button>
                )
              })}
            </div>
          ))}
        </div>
      </div>

      <div style={{ marginBottom: '20px', padding: '15px', background: '#f5f5f5', borderRadius: '8px' }}>
        <h3>Cush Chords (モーダル・インターチェンジ)</h3>

        {/* オプション */}
        <div style={{ marginBottom: '15px', display: 'flex', gap: '20px', alignItems: 'center', flexWrap: 'wrap' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={closedVoicing}
              onChange={(e) => setClosedVoicing(e.target.checked)}
              style={{ cursor: 'pointer' }}
            />
            <span>ボイスリーディング（前のコードから最小限の音程移動）</span>
          </label>
          {closedVoicing && (
            <button
              onClick={() => setLastChordFrequencies([])}
              style={{
                padding: '6px 12px',
                background: '#ffffff',
                color: '#000',
                border: '2px solid #666',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '13px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
              }}
            >
              リセット
            </button>
          )}
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontWeight: 'bold' }}>波形:</span>
            <select
              value={waveformType}
              onChange={(e) => setWaveformType(e.target.value as OscillatorType)}
              style={{
                padding: '6px 12px',
                fontSize: '13px',
                borderRadius: '4px',
                border: '1px solid #ccc',
                cursor: 'pointer'
              }}
            >
              <option value="sine">正弦波 (Sine)</option>
              <option value="triangle">三角波 (Triangle)</option>
              <option value="square">矩形波 (Square)</option>
              <option value="sawtooth">のこぎり波 (Sawtooth)</option>
            </select>
          </label>
        </div>

        {/* モード選択 */}
        <div style={{ marginBottom: '15px' }}>
          <label style={{ fontWeight: 'bold', marginRight: '10px' }}>モード選択:</label>
          <select
            value={selectedMode}
            onChange={(e) => setSelectedMode(e.target.value)}
            style={{
              padding: '8px 12px',
              fontSize: '14px',
              borderRadius: '4px',
              border: '1px solid #ccc',
              cursor: 'pointer'
            }}
          >
            {Object.entries(modes).map(([key, mode]) => (
              <option key={key} value={key}>{mode.name}</option>
            ))}
          </select>
        </div>

        {/* 親スケール情報 */}
        <div style={{
          marginBottom: '15px',
          padding: '10px',
          background: 'white',
          borderRadius: '4px',
          fontSize: '13px'
        }}>
          <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>
            親スケール: {modes[selectedMode as keyof typeof modes].parentKey}
          </div>
          <div style={{ color: '#666' }}>
            {modes[selectedMode as keyof typeof modes].description}
          </div>
        </div>

        {/* トニック（C）のバリエーション */}
        <div style={{ marginBottom: '10px' }}>
          <div style={{ fontWeight: 'bold', marginBottom: '8px' }}>トニック（C）のバリエーション:</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: '8px' }}>
            {[
              { quality: '', label: 'C', degree: 'I' },
              { quality: 'm', label: 'Cm', degree: 'Im' },
              { quality: 'M7', label: 'CM7', degree: 'IM7' },
              { quality: 'm7', label: 'Cm7', degree: 'Im7' },
              { quality: '7', label: 'C7', degree: 'I7' },
              { quality: 'dim', label: 'Cdim', degree: 'Idim' },
              { quality: 'aug', label: 'Caug', degree: 'Iaug' },
            ].map((chord, index) => {
              const chordName = `C${chord.quality}`
              const cushProgressions = getCushProgressions(selectedMode as keyof typeof modes)
              const isHighlighted = lastAddedChord && (cushProgressions[lastAddedChord]?.includes(chordName) || chordProgressions[lastAddedChord]?.includes(chordName))

              return (
                <button
                  key={index}
                  onClick={() => addChord('C', chord.quality)}
                  style={{
                    padding: '12px 8px',
                    background: '#ffffff',
                    color: '#000000',
                    border: isHighlighted ? '3px solid #ff6b6b' : '2px solid #333',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontWeight: 'bold',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '4px',
                    transition: 'all 0.2s ease',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                  }}
                >
                  <div style={{ fontSize: '16px' }}>{chord.label}</div>
                  <div style={{ fontSize: '10px', color: '#666' }}>{chord.degree}</div>
                </button>
              )
            })}
          </div>
        </div>

        {/* Cush Chords パレット */}
        <div style={{ marginBottom: '10px' }}>
          <div style={{ fontWeight: 'bold', marginBottom: '8px' }}>
            借用コード（{modes[selectedMode as keyof typeof modes].parentKey}から）:
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: '8px' }}>
            {modes[selectedMode as keyof typeof modes].cushChords.map((chord, index) => {
              const chordName = `${chord.root}${chord.quality}`
              const cushProgressions = getCushProgressions(selectedMode as keyof typeof modes)
              const isHighlighted = lastAddedChord && cushProgressions[lastAddedChord]?.includes(chordName)

              return (
                <button
                  key={index}
                  onClick={() => addChord(chord.root, chord.quality, true)}
                  style={{
                    padding: '12px 8px',
                    background: '#ffffff',
                    color: '#000000',
                    border: isHighlighted ? '3px solid #ff6b6b' : '2px solid #666',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontWeight: 'bold',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '4px',
                    transition: 'all 0.2s ease',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                  }}
                >
                  <div style={{ fontSize: '16px' }}>{chord.root}{chord.quality}</div>
                  <div style={{ fontSize: '10px', color: '#666' }}>{chord.degree} ({chord.function})</div>
                </button>
              )
            })}
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
        <button
          onClick={playChords}
          disabled={isPlaying || chords.length === 0}
          style={{
            padding: '12px 24px',
            background: isPlaying || chords.length === 0 ? '#f5f5f5' : '#ffffff',
            color: isPlaying || chords.length === 0 ? '#999' : '#000',
            border: '2px solid #333',
            borderRadius: '4px',
            cursor: isPlaying || chords.length === 0 ? 'not-allowed' : 'pointer',
            fontSize: '16px',
            fontWeight: 'bold',
            boxShadow: isPlaying || chords.length === 0 ? 'none' : '0 2px 4px rgba(0,0,0,0.1)'
          }}
        >
          {isPlaying ? '再生中...' : '再生'}
        </button>

        <button
          onClick={exportToText}
          disabled={chords.length === 0}
          style={{
            padding: '12px 24px',
            background: chords.length === 0 ? '#f5f5f5' : '#ffffff',
            color: chords.length === 0 ? '#999' : '#000',
            border: '2px solid #333',
            borderRadius: '4px',
            cursor: chords.length === 0 ? 'not-allowed' : 'pointer',
            fontSize: '16px',
            boxShadow: chords.length === 0 ? 'none' : '0 2px 4px rgba(0,0,0,0.1)'
          }}
        >
          テキスト出力
        </button>

        <button
          onClick={clearChords}
          disabled={chords.length === 0}
          style={{
            padding: '12px 24px',
            background: chords.length === 0 ? '#f5f5f5' : '#ffffff',
            color: chords.length === 0 ? '#999' : '#000',
            border: '2px solid #333',
            borderRadius: '4px',
            cursor: chords.length === 0 ? 'not-allowed' : 'pointer',
            fontSize: '16px',
            boxShadow: chords.length === 0 ? 'none' : '0 2px 4px rgba(0,0,0,0.1)'
          }}
        >
          クリア
        </button>

        <button
          onClick={() => setShowExplanation(true)}
          style={{
            padding: '12px 24px',
            background: '#ffffff',
            color: '#000',
            border: '2px solid #333',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '16px',
            fontWeight: 'bold',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
          }}
        >
          Cush Chordsとは？
        </button>
      </div>

      {/* Cush Chords説明モーダル */}
      {showExplanation && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '20px'
          }}
          onClick={() => setShowExplanation(false)}
        >
          <div
            style={{
              background: '#ffffff',
              borderRadius: '8px',
              padding: '30px',
              maxWidth: '800px',
              maxHeight: '80vh',
              overflowY: 'auto',
              boxShadow: '0 4px 20px rgba(0,0,0,0.3)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 style={{ marginTop: 0, marginBottom: '20px' }}>Cush Chords（クッシュ・コード）とは</h2>

            <section style={{ marginBottom: '20px' }}>
              <h3 style={{ color: '#333', marginBottom: '10px' }}>概要</h3>
              <p style={{ lineHeight: '1.8' }}>
                「Cush Chords」は、<strong>モーダル・インターチェンジ（modal interchange）</strong>の手法の一つです。
                トニック（I）をそのまま維持しながら、その他のコードを別の親キー（親スケール）から借用することで、
                <strong>「馴染みながらも少し色付いた／幻想的な響き」</strong>のコード進行を作ります。
              </p>
            </section>

            <section style={{ marginBottom: '20px' }}>
              <h3 style={{ color: '#333', marginBottom: '10px' }}>基本的な仕組み</h3>
              <ol style={{ lineHeight: '1.8', paddingLeft: '20px' }}>
                <li><strong>トニック（C）を固定</strong> - 常にCメジャーまたはCマイナーを維持</li>
                <li><strong>親スケールを選択</strong> - 例：C Aeolian（Ebメジャーの6番目のモード）</li>
                <li><strong>他のコードを親スケールから借用</strong> - トニック以外のコードを選んだ親スケール上で構築</li>
              </ol>
            </section>

            <section style={{ marginBottom: '20px' }}>
              <h3 style={{ color: '#333', marginBottom: '10px' }}>モードと親スケールの関係</h3>
              <div style={{ background: '#f5f5f5', padding: '15px', borderRadius: '4px', fontSize: '14px' }}>
                <p style={{ margin: '5px 0' }}><strong>Aeolian（エオリアン）</strong>：Ebメジャーの6番目のモード → 暗め・マイナー的</p>
                <p style={{ margin: '5px 0' }}><strong>Dorian（ドリアン）</strong>：Bbメジャーの2番目のモード → 明るめのマイナー</p>
                <p style={{ margin: '5px 0' }}><strong>Phrygian（フリジアン）</strong>：Abメジャーの3番目のモード → エキゾチック・暗い</p>
                <p style={{ margin: '5px 0' }}><strong>Lydian（リディアン）</strong>：Gメジャーの4番目のモード → 明るく浮遊感</p>
                <p style={{ margin: '5px 0' }}><strong>Mixolydian（ミクソリディアン）</strong>：Fメジャーの5番目のモード → 明るくブルージー</p>
              </div>
            </section>

            <section style={{ marginBottom: '20px' }}>
              <h3 style={{ color: '#333', marginBottom: '10px' }}>実践例：サンプル進行集</h3>
              <p style={{ marginBottom: '15px', fontSize: '14px', color: '#666' }}>
                <strong>コードをクリックすると音が聞けます！</strong>
              </p>

              {/* Aeolian */}
              <div style={{ marginBottom: '15px' }}>
                <h4 style={{ color: '#444', marginBottom: '8px' }}>Aeolian（エオリアン）- 暗め・マイナー的</h4>
                {[
                  { name: '基本進行', chords: ['C', 'Fm7', 'Gm7', 'Bb7'] },
                  { name: 'バックドア進行', chords: ['C', 'Fm7', 'Bb9', 'C'] },
                  { name: 'クラシックな進行', chords: ['C', 'Ab', 'Bb', 'C'] },
                ].map((prog, progIdx) => (
                  <div key={progIdx} style={{ marginBottom: '10px', padding: '10px', background: '#f9f9f9', borderRadius: '4px' }}>
                    <div style={{ fontSize: '13px', color: '#666', marginBottom: '5px' }}>{prog.name}</div>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                      {prog.chords.map((chord, idx) => {
                        const root = chord.match(/^[A-G][b#]?/)?.[0] || chord
                        const quality = chord.slice(root.length)
                        return (
                          <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <button
                              onClick={() => playSingleChord({ root, quality, isBorrowed: true })}
                              style={{
                                padding: '6px 12px',
                                background: '#ffffff',
                                color: '#000',
                                border: '2px solid #666',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                fontSize: '13px',
                                fontWeight: 'bold',
                                boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                              }}
                            >
                              {chord}
                            </button>
                            {idx < prog.chords.length - 1 && <span style={{ fontSize: '12px' }}>→</span>}
                          </div>
                        )
                      })}
                    </div>
                  </div>
                ))}
              </div>

              {/* Dorian */}
              <div style={{ marginBottom: '15px' }}>
                <h4 style={{ color: '#444', marginBottom: '8px' }}>Dorian（ドリアン）- 明るめのマイナー</h4>
                {[
                  { name: '基本進行', chords: ['C', 'Dm7', 'F', 'C'] },
                  { name: 'ジャズ風', chords: ['C', 'Dm7', 'Gm7', 'C'] },
                ].map((prog, progIdx) => (
                  <div key={progIdx} style={{ marginBottom: '10px', padding: '10px', background: '#f9f9f9', borderRadius: '4px' }}>
                    <div style={{ fontSize: '13px', color: '#666', marginBottom: '5px' }}>{prog.name}</div>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                      {prog.chords.map((chord, idx) => {
                        const root = chord.match(/^[A-G][b#]?/)?.[0] || chord
                        const quality = chord.slice(root.length)
                        return (
                          <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <button
                              onClick={() => playSingleChord({ root, quality, isBorrowed: true })}
                              style={{
                                padding: '6px 12px',
                                background: '#ffffff',
                                color: '#000',
                                border: '2px solid #666',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                fontSize: '13px',
                                fontWeight: 'bold',
                                boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                              }}
                            >
                              {chord}
                            </button>
                            {idx < prog.chords.length - 1 && <span style={{ fontSize: '12px' }}>→</span>}
                          </div>
                        )
                      })}
                    </div>
                  </div>
                ))}
              </div>

              {/* Phrygian */}
              <div style={{ marginBottom: '15px' }}>
                <h4 style={{ color: '#444', marginBottom: '8px' }}>Phrygian（フリジアン）- エキゾチック・暗い</h4>
                {[
                  { name: '基本進行', chords: ['C', 'Db', 'Eb', 'C'] },
                  { name: 'スパニッシュ風', chords: ['C', 'Db', 'Ab', 'C'] },
                ].map((prog, progIdx) => (
                  <div key={progIdx} style={{ marginBottom: '10px', padding: '10px', background: '#f9f9f9', borderRadius: '4px' }}>
                    <div style={{ fontSize: '13px', color: '#666', marginBottom: '5px' }}>{prog.name}</div>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                      {prog.chords.map((chord, idx) => {
                        const root = chord.match(/^[A-G][b#]?/)?.[0] || chord
                        const quality = chord.slice(root.length)
                        return (
                          <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <button
                              onClick={() => playSingleChord({ root, quality, isBorrowed: true })}
                              style={{
                                padding: '6px 12px',
                                background: '#ffffff',
                                color: '#000',
                                border: '2px solid #666',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                fontSize: '13px',
                                fontWeight: 'bold',
                                boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                              }}
                            >
                              {chord}
                            </button>
                            {idx < prog.chords.length - 1 && <span style={{ fontSize: '12px' }}>→</span>}
                          </div>
                        )
                      })}
                    </div>
                  </div>
                ))}
              </div>

              {/* Lydian */}
              <div style={{ marginBottom: '15px' }}>
                <h4 style={{ color: '#444', marginBottom: '8px' }}>Lydian（リディアン）- 明るく浮遊感</h4>
                {[
                  { name: '基本進行', chords: ['C', 'D', 'Em7', 'C'] },
                  { name: 'ドリーミーな進行', chords: ['C', 'D', 'Bm7', 'C'] },
                ].map((prog, progIdx) => (
                  <div key={progIdx} style={{ marginBottom: '10px', padding: '10px', background: '#f9f9f9', borderRadius: '4px' }}>
                    <div style={{ fontSize: '13px', color: '#666', marginBottom: '5px' }}>{prog.name}</div>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                      {prog.chords.map((chord, idx) => {
                        const root = chord.match(/^[A-G][b#]?/)?.[0] || chord
                        const quality = chord.slice(root.length)
                        return (
                          <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <button
                              onClick={() => playSingleChord({ root, quality, isBorrowed: true })}
                              style={{
                                padding: '6px 12px',
                                background: '#ffffff',
                                color: '#000',
                                border: '2px solid #666',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                fontSize: '13px',
                                fontWeight: 'bold',
                                boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                              }}
                            >
                              {chord}
                            </button>
                            {idx < prog.chords.length - 1 && <span style={{ fontSize: '12px' }}>→</span>}
                          </div>
                        )
                      })}
                    </div>
                  </div>
                ))}
              </div>

              {/* Mixolydian */}
              <div style={{ marginBottom: '15px' }}>
                <h4 style={{ color: '#444', marginBottom: '8px' }}>Mixolydian（ミクソリディアン）- 明るくブルージー</h4>
                {[
                  { name: '基本進行', chords: ['C', 'F', 'Bb', 'C'] },
                  { name: 'ブルース風', chords: ['C7', 'F7', 'Bb7', 'C7'] },
                ].map((prog, progIdx) => (
                  <div key={progIdx} style={{ marginBottom: '10px', padding: '10px', background: '#f9f9f9', borderRadius: '4px' }}>
                    <div style={{ fontSize: '13px', color: '#666', marginBottom: '5px' }}>{prog.name}</div>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                      {prog.chords.map((chord, idx) => {
                        const root = chord.match(/^[A-G][b#]?/)?.[0] || chord
                        const quality = chord.slice(root.length)
                        return (
                          <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <button
                              onClick={() => playSingleChord({ root, quality, isBorrowed: true })}
                              style={{
                                padding: '6px 12px',
                                background: '#ffffff',
                                color: '#000',
                                border: '2px solid #666',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                fontSize: '13px',
                                fontWeight: 'bold',
                                boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                              }}
                            >
                              {chord}
                            </button>
                            {idx < prog.chords.length - 1 && <span style={{ fontSize: '12px' }}>→</span>}
                          </div>
                        )
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section style={{ marginBottom: '20px' }}>
              <h3 style={{ color: '#333', marginBottom: '10px' }}>なぜ効果的なのか</h3>
              <ul style={{ lineHeight: '1.8', paddingLeft: '20px' }}>
                <li><strong>トニックを維持</strong>することで「キーの重心」が保たれ、聴きやすさを維持</li>
                <li><strong>親スケールの変更</strong>により、転調ほど強くなく、でも"色"が変わる</li>
                <li><strong>モード選択</strong>で「メジャー/マイナー」「明るい/暗い」のグラデーションが出せる</li>
                <li>モダンなジャズ／ポップ／R&B的な<strong>「浮遊感」「曖昧なキー感」</strong>を作りやすい</li>
              </ul>
            </section>

            <section style={{ marginBottom: '20px' }}>
              <h3 style={{ color: '#333', marginBottom: '10px' }}>使い方のコツ</h3>
              <ul style={{ lineHeight: '1.8', paddingLeft: '20px' }}>
                <li>基本進行（I → IV → V など）から始めて、親スケールを変えて試す</li>
                <li>トニック（C）は必ず維持する（変えると転調になる）</li>
                <li>ルート音の動きが滑らかになるように意識する</li>
                <li>7thコードを使うとジャズらしい響きが得られる</li>
                <li>モードの選択で雰囲気が大きく変わるので、曲の雰囲気に合わせて選ぶ</li>
              </ul>
            </section>

            <button
              onClick={() => setShowExplanation(false)}
              style={{
                padding: '12px 24px',
                background: '#000',
                color: '#fff',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '16px',
                fontWeight: 'bold',
                width: '100%',
                marginTop: '10px'
              }}
            >
              閉じる
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default App
