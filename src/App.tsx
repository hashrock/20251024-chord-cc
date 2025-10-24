import { useState } from 'react'
import './App.css'

interface Chord {
  root: string
  quality: string
  isBorrowed?: boolean
}

function App() {
  const [chords, setChords] = useState<Chord[]>([])
  const [isPlaying, setIsPlaying] = useState(false)

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

  const borrowedChords = [
    { root: 'A', quality: 'm' },
    { root: 'B', quality: 'b' },
    { root: 'E', quality: 'b' },
    { root: 'A', quality: 'b' },
  ]

  const addChord = (root: string, quality: string, isBorrowed = false) => {
    setChords([...chords, { root, quality, isBorrowed }])
    // ボタンを押したときに音を鳴らす
    playSingleChord({ root, quality, isBorrowed })
  }

  const playSingleChord = (chord: Chord) => {
    const audioContext = new AudioContext()
    const frequencies = getChordFrequencies(chord)
    const startTime = audioContext.currentTime
    const duration = 0.5

    frequencies.forEach(freq => {
      const oscillator = audioContext.createOscillator()
      const gainNode = audioContext.createGain()

      oscillator.type = 'sine'
      oscillator.frequency.value = freq

      gainNode.gain.setValueAtTime(0.15, startTime)
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
      await playChord(audioContext, chords[i], i)
    }

    setIsPlaying(false)
  }

  const playChord = (audioContext: AudioContext, chord: Chord, index: number) => {
    return new Promise<void>((resolve) => {
      const frequencies = getChordFrequencies(chord)
      const startTime = audioContext.currentTime
      const duration = 1.0

      frequencies.forEach(freq => {
        const oscillator = audioContext.createOscillator()
        const gainNode = audioContext.createGain()

        oscillator.type = 'sine'
        oscillator.frequency.value = freq

        gainNode.gain.setValueAtTime(0.2, startTime)
        gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + duration)

        oscillator.connect(gainNode)
        gainNode.connect(audioContext.destination)

        oscillator.start(startTime)
        oscillator.stop(startTime + duration)
      })

      setTimeout(() => resolve(), duration * 1000)
    })
  }

  const getChordFrequencies = (chord: Chord): number[] => {
    const noteFrequencies: Record<string, number> = {
      'C': 261.63, 'D': 293.66, 'E': 329.63, 'F': 349.23,
      'G': 392.00, 'A': 440.00, 'B': 493.88,
      'Eb': 311.13, 'Ab': 415.30, 'Bb': 466.16,
    }

    const root = chord.root.includes('b') ? chord.root : chord.root
    const rootFreq = noteFrequencies[root] || 261.63

    // シンプルな和音構成
    if (chord.quality === 'm') {
      return [rootFreq, rootFreq * 1.189, rootFreq * 1.498] // マイナー
    } else if (chord.quality === '7') {
      return [rootFreq, rootFreq * 1.26, rootFreq * 1.498, rootFreq * 1.782] // 7th
    } else if (chord.quality === 'M7') {
      return [rootFreq, rootFreq * 1.26, rootFreq * 1.498, rootFreq * 1.888] // M7
    } else if (chord.quality === 'm7') {
      return [rootFreq, rootFreq * 1.189, rootFreq * 1.498, rootFreq * 1.782] // m7
    } else if (chord.quality === 'dim') {
      return [rootFreq, rootFreq * 1.189, rootFreq * 1.414] // dim
    } else if (chord.quality === 'aug') {
      return [rootFreq, rootFreq * 1.26, rootFreq * 1.587] // aug
    }

    return [rootFreq, rootFreq * 1.26, rootFreq * 1.498] // メジャー
  }

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h1>コード進行作成ツール</h1>

      <div style={{ marginBottom: '20px' }}>
        <h2>現在のコード進行:</h2>
        <div style={{
          minHeight: '60px',
          padding: '15px',
          border: '2px solid #ccc',
          borderRadius: '5px',
          display: 'flex',
          gap: '10px',
          flexWrap: 'wrap',
          alignItems: 'center'
        }}>
          {chords.length === 0 ? (
            <span style={{ color: '#999' }}>コードを追加してください</span>
          ) : (
            chords.map((chord, index) => (
              <div
                key={index}
                style={{
                  padding: '8px 12px',
                  background: chord.isBorrowed ? '#ffeb3b' : '#2196f3',
                  color: chord.isBorrowed ? '#000' : '#fff',
                  borderRadius: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                <span>{chord.root}{chord.quality}</span>
                <button
                  onClick={() => removeChord(index)}
                  style={{
                    background: 'rgba(0,0,0,0.3)',
                    border: 'none',
                    color: 'white',
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
                  background: '#4caf50',
                  color: 'white',
                  border: '1px solid #45a049',
                  fontWeight: 'bold'
                }}
              >
                {root.note}{root.diatonic}
              </button>
              {qualities.map(quality => (
                <button
                  key={`${root.note}-${quality.value}`}
                  onClick={() => addChord(root.note, quality.value)}
                  style={{
                    width: '100%',
                    padding: '5px 2px',
                    marginBottom: '3px',
                    fontSize: '11px',
                    cursor: 'pointer'
                  }}
                >
                  {quality.label}
                </button>
              ))}
            </div>
          ))}
        </div>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <h3>借用和音:</h3>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          {borrowedChords.map((chord, index) => (
            <button
              key={index}
              onClick={() => addChord(chord.root, chord.quality, true)}
              style={{
                padding: '10px 15px',
                background: '#ffeb3b',
                border: '1px solid #fbc02d',
                borderRadius: '4px',
                cursor: 'pointer',
                fontWeight: 'bold'
              }}
            >
              {chord.root}{chord.quality}
            </button>
          ))}
        </div>
      </div>

      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
        <button
          onClick={playChords}
          disabled={isPlaying || chords.length === 0}
          style={{
            padding: '12px 24px',
            background: isPlaying ? '#ccc' : '#4caf50',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: isPlaying || chords.length === 0 ? 'not-allowed' : 'pointer',
            fontSize: '16px',
            fontWeight: 'bold'
          }}
        >
          {isPlaying ? '再生中...' : '再生'}
        </button>

        <button
          onClick={exportToText}
          disabled={chords.length === 0}
          style={{
            padding: '12px 24px',
            background: chords.length === 0 ? '#ccc' : '#2196f3',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: chords.length === 0 ? 'not-allowed' : 'pointer',
            fontSize: '16px'
          }}
        >
          テキスト出力
        </button>

        <button
          onClick={clearChords}
          disabled={chords.length === 0}
          style={{
            padding: '12px 24px',
            background: chords.length === 0 ? '#ccc' : '#f44336',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: chords.length === 0 ? 'not-allowed' : 'pointer',
            fontSize: '16px'
          }}
        >
          クリア
        </button>
      </div>
    </div>
  )
}

export default App
