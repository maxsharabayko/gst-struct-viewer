import { useMemo, useState } from 'react'
import './App.css'
import { parseGstStructure, type GstStructure } from './parser/gstParser'
import { Tree } from './components/TreeView'

const SAMPLE = `stats, type=(MyType)typeEnum1, substruct=(structure)[stats, state=(MyState)error, error=(ErrorCode)unsupported, metrics=(structure)[metrics, count=(gulong)10, ratio=(double)1.5;];];`

function App() {
  const [text, setText] = useState<string>(SAMPLE)
  const [parsed, setParsed] = useState<GstStructure | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleParse = () => {
    try {
      const p = parseGstStructure(text)
      setParsed(p)
      setError(null)
    } catch (e: any) {
      setParsed(null)
      setError(e?.message || 'Failed to parse GST structure')
    }
  }

  const handleClear = () => {
    setText('')
    setParsed(null)
    setError(null)
  }

  const content = useMemo(() => {
    if (error) return <div className="error">{error}</div>
    if (!parsed) return <div className="placeholder">Paste GST_STRUCTURE and press Parse</div>
    return <Tree structure={parsed} />
  }, [parsed, error])

  return (
    <div className="container">
      <h1>GST Structure Viewer</h1>
      <div className="input-panel">
        <textarea
          id="gst-structure-input"
          name="gst-structure-input"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Paste serialized GST_STRUCTURE here..."
          spellCheck={false}
        />
        <div className="actions">
          <button onClick={handleParse}>Parse</button>
          <button className="secondary" onClick={handleClear}>Clear</button>
        </div>
      </div>
      <div className="output-panel">
        {content}
      </div>
    </div>
  )
}

export default App
