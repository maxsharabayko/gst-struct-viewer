import { useMemo, useState } from 'react'
import './App.css'
import { parseGstStructure, type GstStructure } from './parser/gstParser'
import { Tree } from './components/TreeView'

const SAMPLE = `stats, listenerStats=(structure)"listenerStats\,\ rejectNumber\=\(int\)0\;", connStats=(structure)< "connStats\,\ srtSkipPackets\=\(int\)0\,\ retransAlgo\=\(int\)1\,\ bitrate\=\(gint64\)5579\,\ groupMode\=\(string\)none\,\ rejectReason\=\(string\)\"\"\,\ srtVersion\=\(string\)1.5.3\,\ srtPeerVersion\=\(string\)1.5.3\,\ connectionState\=\(string\)connected\,\ streamId\=\(string\)\"\"\,\ name\=\(string\)\"\"\,\ links\=\(structure\)\<\ \"linkStats\\\\\\,\\\\\\ lossPacketRate\\\\\=\\\\\(double\\\\\)0\\\\\\,\\\\\\ localPort\\\\\=\\\\\(int\\\\\)4200\\\\\\,\\\\\\ peerPort\\\\\=\\\\\(int\\\\\)57116\\\\\\,\\\\\\ fecRows\\\\\=\\\\\(uint\\\\\)5\\\\\\,\\\\\\ fecCols\\\\\=\\\\\(uint\\\\\)10\\\\\\,\\\\\\ retransRate\\\\\=\\\\\(gint64\\\\\)11667\\\\\\,\\\\\\ bitrate\\\\\=\\\\\(gint64\\\\\)5579\\\\\\,\\\\\\ cryptoMode\\\\\=\\\\\(string\\\\\)none\\\\\\,\\\\\\ localAddress\\\\\=\\\\\(string\\\\\)10.129.10.144\\\\\\,\\\\\\ peerAddress\\\\\=\\\\\(string\\\\\)10.0.129.11\\\\\\,\\\\\\ decryptionState\\\\\=\\\\\(string\\\\\)\\\"\\\"\\\\\\,\\\\\\ fecState\\\\\=\\\\\(string\\\\\)disabled\\\\\\,\\\\\\ fecLayout\\\\\=\\\\\(string\\\\\)even\\\\\\,\\\\\\ fecArq\\\\\=\\\\\(string\\\\\)onreq\\\\\\,\\\\\\ linkState\\\\\=\\\\\(string\\\\\)running\\\\\\,\\\\\\ protocolStats\\\\\=\\\\\(structure\\\\\)\\\"socketStats\\\\\\\\\\\\,\\\\\\\\\\\\ msRTT\\\\\\\\\\\=\\\\\\\\\\\(double\\\\\\\\\\\)83.260999999999996\\\\\\\\\\\\,\\\\\\\\\\\\ mbpsBandwidth\\\\\\\\\\\=\\\\\\\\\\\(double\\\\\\\\\\\)22.512\\\\\\\\\\\\,\\\\\\\\\\\\ byteMSS\\\\\\\\\\\=\\\\\\\\\\\(int\\\\\\\\\\\)1500\\\\\\\\\\\\,\\\\\\\\\\\\ msTimeStamp\\\\\\\\\\\=\\\\\\\\\\\(gint64\\\\\\\\\\\)2177\\\\\\\\\\\\,\\\\\\\\\\\\ mbpsRecvRate\\\\\\\\\\\=\\\\\\\\\\\(double\\\\\\\\\\\)8.1220683741919029\\\\\\\\\\\\,\\\\\\\\\\\\ pktRcvAvgBelatedTime\\\\\\\\\\\=\\\\\\\\\\\(double\\\\\\\\\\\)18446744073681980\\\\\\\\\\\\,\\\\\\\\\\\\ pktRcvLossTotal\\\\\\\\\\\=\\\\\\\\\\\(int\\\\\\\\\\\)2344\\\\\\\\\\\\,\\\\\\\\\\\\ pktSentACKTotal\\\\\\\\\\\=\\\\\\\\\\\(int\\\\\\\\\\\)161\\\\\\\\\\\\,\\\\\\\\\\\\ pktSentNAKTotal\\\\\\\\\\\=\\\\\\\\\\\(int\\\\\\\\\\\)1568\\\\\\\\\\\\,\\\\\\\\\\\\ pktRcvDropTotal\\\\\\\\\\\=\\\\\\\\\\\(int\\\\\\\\\\\)519\\\\\\\\\\\\,\\\\\\\\\\\\ pktRcvUndecryptTotal\\\\\\\\\\\=\\\\\\\\\\\(int\\\\\\\\\\\)0\\\\\\\\\\\\,\\\\\\\\\\\\ pktRcvFilterExtraTotal\\\\\\\\\\\=\\\\\\\\\\\(int\\\\\\\\\\\)0\\\\\\\\\\\\,\\\\\\\\\\\\ pktRcvFilterSupplyTotal\\\\\\\\\\\=\\\\\\\\\\\(int\\\\\\\\\\\)0\\\\\\\\\\\\,\\\\\\\\\\\\ pktRcvFilterLossTotal\\\\\\\\\\\=\\\\\\\\\\\(int\\\\\\\\\\\)0\\\\\\\\\\\\,\\\\\\\\\\\\ pktRcvLoss\\\\\\\\\\\=\\\\\\\\\\\(int\\\\\\\\\\\)1170\\\\\\\\\\\\,\\\\\\\\\\\\ pktRcvRetrans\\\\\\\\\\\=\\\\\\\\\\\(int\\\\\\\\\\\)1022\\\\\\\\\\\\,\\\\\\\\\\\\ pktSentACK\\\\\\\\\\\=\\\\\\\\\\\(int\\\\\\\\\\\)74\\\\\\\\\\\\,\\\\\\\\\\\\ pktSentNAK\\\\\\\\\\\=\\\\\\\\\\\(int\\\\\\\\\\\)761\\\\\\\\\\\\,\\\\\\\\\\\\ pktRcvFilterExtra\\\\\\\\\\\=\\\\\\\\\\\(int\\\\\\\\\\\)0\\\\\\\\\\\\,\\\\\\\\\\\\ pktRcvFilterSupply\\\\\\\\\\\=\\\\\\\\\\\(int\\\\\\\\\\\)0\\\\\\\\\\\\,\\\\\\\\\\\\ pktRcvFilterLoss\\\\\\\\\\\=\\\\\\\\\\\(int\\\\\\\\\\\)0\\\\\\\\\\\\,\\\\\\\\\\\\ pktReorderDistance\\\\\\\\\\\=\\\\\\\\\\\(int\\\\\\\\\\\)6\\\\\\\\\\\\,\\\\\\\\\\\\ pktRcvDrop\\\\\\\\\\\=\\\\\\\\\\\(int\\\\\\\\\\\)291\\\\\\\\\\\\,\\\\\\\\\\\\ pktRcvUndecrypt\\\\\\\\\\\=\\\\\\\\\\\(int\\\\\\\\\\\)0\\\\\\\\\\\\,\\\\\\\\\\\\ byteAvailRcvBuf\\\\\\\\\\\=\\\\\\\\\\\(int\\\\\\\\\\\)10432500\\\\\\\\\\\\,\\\\\\\\\\\\ pktRcvBuf\\\\\\\\\\\=\\\\\\\\\\\(int\\\\\\\\\\\)3\\\\\\\\\\\\,\\\\\\\\\\\\ byteRcvBuf\\\\\\\\\\\=\\\\\\\\\\\(int\\\\\\\\\\\)586\\\\\\\\\\\\,\\\\\\\\\\\\ msRcvBuf\\\\\\\\\\\=\\\\\\\\\\\(int\\\\\\\\\\\)1\\\\\\\\\\\\,\\\\\\\\\\\\ msRcvTsbPdDelay\\\\\\\\\\\=\\\\\\\\\\\(int\\\\\\\\\\\)0\\\\\\\\\\\\,\\\\\\\\\\\\ pktReorderTolerance\\\\\\\\\\\=\\\\\\\\\\\(int\\\\\\\\\\\)0\\\\\\\\\\\\,\\\\\\\\\\\\ pktRecvTotal\\\\\\\\\\\=\\\\\\\\\\\(gint64\\\\\\\\\\\)9021\\\\\\\\\\\\,\\\\\\\\\\\\ pktRecvUniqueTotal\\\\\\\\\\\=\\\\\\\\\\\(gint64\\\\\\\\\\\)6418\\\\\\\\\\\\,\\\\\\\\\\\\ pktRecv\\\\\\\\\\\=\\\\\\\\\\\(gint64\\\\\\\\\\\)4425\\\\\\\\\\\\,\\\\\\\\\\\\ pktRecvUnique\\\\\\\\\\\=\\\\\\\\\\\(gint64\\\\\\\\\\\)3112\\\\\\\\\\\\,\\\\\\\\\\\\ pktRcvBelated\\\\\\\\\\\=\\\\\\\\\\\(gint64\\\\\\\\\\\)1313\\\\\\\\\\\\,\\\\\\\\\\\\ byteRecvTotal\\\\\\\\\\\=\\\\\\\\\\\(guint64\\\\\\\\\\\)2092872\\\\\\\\\\\\,\\\\\\\\\\\\ byteRecvUniqueTotal\\\\\\\\\\\=\\\\\\\\\\\(guint64\\\\\\\\\\\)1488976\\\\\\\\\\\\,\\\\\\\\\\\\ byteRcvLossTotal\\\\\\\\\\\=\\\\\\\\\\\(guint64\\\\\\\\\\\)574849\\\\\\\\\\\\,\\\\\\\\\\\\ byteRcvDropTotal\\\\\\\\\\\=\\\\\\\\\\\(guint64\\\\\\\\\\\)123520\\\\\\\\\\\\,\\\\\\\\\\\\ byteRcvUndecryptTotal\\\\\\\\\\\=\\\\\\\\\\\(guint64\\\\\\\\\\\)0\\\\\\\\\\\\,\\\\\\\\\\\\ byteRecv\\\\\\\\\\\=\\\\\\\\\\\(guint64\\\\\\\\\\\)1026600\\\\\\\\\\\\,\\\\\\\\\\\\ byteRecvUnique\\\\\\\\\\\=\\\\\\\\\\\(guint64\\\\\\\\\\\)721984\\\\\\\\\\\\,\\\\\\\\\\\\ byteRcvLoss\\\\\\\\\\\=\\\\\\\\\\\(guint64\\\\\\\\\\\)271440\\\\\\\\\\\\,\\\\\\\\\\\\ byteRcvDrop\\\\\\\\\\\=\\\\\\\\\\\(guint64\\\\\\\\\\\)67512\\\\\\\\\\\\,\\\\\\\\\\\\ byteRcvUndecrypt\\\\\\\\\\\=\\\\\\\\\\\(guint64\\\\\\\\\\\)0\\\\\\\\\\\\\;\\\"\\\;\"\ \>\;" >;`

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
