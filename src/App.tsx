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
  const [selectedMode, setSelectedMode] = useState<string>('aeolian')
  const [lastAddedChord, setLastAddedChord] = useState<string>('')
  const [closedVoicing, setClosedVoicing] = useState(false)
  const [lastChordFrequencies, setLastChordFrequencies] = useState<number[]>([])

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

  const playSingleChord = (chord: Chord) => {
    const audioContext = new AudioContext()
    const frequencies = getChordFrequencies(chord)
    setLastChordFrequencies(frequencies) // 次のコードのために保存
    const startTime = audioContext.currentTime
    const duration = 0.5

    // ベーストーンを2オクターブ下で追加（周波数を1/4に）
    const bassFreq = frequencies[0] / 4
    const bassOscillator = audioContext.createOscillator()
    const bassGain = audioContext.createGain()

    bassOscillator.type = 'sine'
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

      oscillator.type = 'sine'
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
      'Db': 277.18, 'Eb': 311.13, 'F#': 369.99, 'Ab': 415.30, 'Bb': 466.16,
    }

    const root = chord.root.includes('b') || chord.root.includes('#') ? chord.root : chord.root
    const rootFreq = noteFrequencies[root] || 261.63

    let frequencies: number[] = []

    // シンプルな和音構成
    if (chord.quality === 'm') {
      frequencies = [rootFreq, rootFreq * 1.189, rootFreq * 1.498] // マイナー
    } else if (chord.quality === '7') {
      frequencies = [rootFreq, rootFreq * 1.26, rootFreq * 1.498, rootFreq * 1.782] // 7th
    } else if (chord.quality === 'M7') {
      frequencies = [rootFreq, rootFreq * 1.26, rootFreq * 1.498, rootFreq * 1.888] // M7
    } else if (chord.quality === 'm7') {
      frequencies = [rootFreq, rootFreq * 1.189, rootFreq * 1.498, rootFreq * 1.782] // m7
    } else if (chord.quality === 'dim') {
      frequencies = [rootFreq, rootFreq * 1.189, rootFreq * 1.414] // dim
    } else if (chord.quality === 'aug') {
      frequencies = [rootFreq, rootFreq * 1.26, rootFreq * 1.587] // aug
    } else {
      frequencies = [rootFreq, rootFreq * 1.26, rootFreq * 1.498] // メジャー
    }

    // Closed voicing: 前のコードから各音が最小限の距離で移動する（ボイスリーディング）
    if (closedVoicing && lastChordFrequencies.length > 0) {
      // 音域の範囲制限（C3 = 130.81 Hz ~ C6 = 1046.50 Hz）
      const minFreq = 130.81
      const maxFreq = 1046.50

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
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
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

        {/* 利用方法 */}
        <div style={{
          marginBottom: '15px',
          padding: '12px',
          background: '#e3f2fd',
          borderRadius: '4px',
          fontSize: '13px',
          lineHeight: '1.6'
        }}>
          <strong>使い方:</strong>
          <ol style={{ margin: '8px 0 0 0', paddingLeft: '20px' }}>
            <li>モードを選択して親スケールを決定</li>
            <li>トニック（C）から開始</li>
            <li>コードをクリックすると、次につながりの良いコードが赤いボーダーでハイライトされます</li>
            <li>ハイライトされたコードを選ぶと自然な進行が作れます</li>
          </ol>
        </div>

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
      </div>
    </div>
  )
}

export default App
