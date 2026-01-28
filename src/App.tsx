import { useMemo, useState } from 'react'
import './App.css'
import { parseGstStructure, type GstStructure } from './parser/gstParser'
import { Tree } from './components/TreeView'

const SAMPLE = `stats, source=(structure)[stats, num-packets=(guint64)22960, num-bytes=(guint64)26504240, bitrate_bps=(guint64)4332006, type=(NgxSourceType)srt, state=(NgxConnectionState)connected, srt=(structure)[stats, connStats=(structure)< [connStats, srtSkipPackets=(int)0, retransAlgo=(int)1, bitrate=(gint64)4683, groupMode=(string)none, rejectReason=(string)"", srtVersion=(string)1.5.4, srtPeerVersion=(string)1.3.2, connectionState=(string)connected, streamId=(string)"", name=(string)"", links=(structure)< [linkStats, lossPacketRate=(double)0, localPort=(int)46737, peerPort=(int)4201, pbKeyLen=(int)32, fecRows=(uint)5, fecCols=(uint)10, retransRate=(gint64)0, bitrate=(gint64)4683, cryptoMode=(string)aes-ctr, localAddress=(string)10.129.10.130, peerAddress=(string)10.129.10.35, decryptionState=(string)HAISRT_DECRYPTION_STATE_SECURED, fecState=(string)disabled, fecLayout=(string)even, fecArq=(string)onreq, linkState=(string)running, protocolStats=(structure)[socketStats, msRTT=(double)0.95699999999999996, mbpsBandwidth=(double)73.208256000000006, byteMSS=(int)1496, msTimeStamp=(gint64)49279, mbpsRecvRate=(double)4.7941921982553497, pktRcvAvgBelatedTime=(double)0, pktRcvLossTotal=(int)0, pktSentACKTotal=(int)3482, pktSentNAKTotal=(int)0, pktRcvDropTotal=(int)0, pktRcvUndecryptTotal=(int)0, pktRcvFilterExtraTotal=(int)0, pktRcvFilterSupplyTotal=(int)0, pktRcvFilterLossTotal=(int)0, pktRcvLoss=(int)0, pktRcvRetrans=(int)0, pktSentACK=(int)75, pktSentNAK=(int)0, pktRcvFilterExtra=(int)0, pktRcvFilterSupply=(int)0, pktRcvFilterLoss=(int)0, pktReorderDistance=(int)0, pktRcvDrop=(int)0, pktRcvUndecrypt=(int)0, byteAvailRcvBuf=(int)10328384, pktRcvBuf=(int)52, byteRcvBuf=(int)60250, msRcvBuf=(int)108, msRcvTsbPdDelay=(int)120, pktReorderTolerance=(int)0, pktRecvTotal=(gint64)22953, pktRecvUniqueTotal=(gint64)22953, pktRecv=(gint64)499, pktRecvUnique=(gint64)499, pktRcvBelated=(gint64)0, byteRecvTotal=(guint64)27506088, byteRecvUniqueTotal=(guint64)27506088, byteRcvLossTotal=(guint64)0, byteRcvDropTotal=(guint64)0, byteRcvUndecryptTotal=(guint64)0, byteRecv=(guint64)601936, byteRecvUnique=(guint64)601936, byteRcvLoss=(guint64)0, byteRcvDrop=(guint64)0, byteRcvUndecrypt=(guint64)0;];] >;] >;];], demux=(structure)[stats, mpeg-ts=(structure)[mpeg-ts, programs=(structure){ [program, program-number=(uint)1, pcr-pid=(uint)33, streams=(structure){ [stream, pid=(uint)33, stream-type=(uint)27, stream-type-name=(string)"Video\ H.264";], [stream, pid=(uint)36, stream-type=(uint)15, stream-type-name=(string)"Audio\ AAC\ ADTS";] };] };];], decoder=(structure)[stats, video=(structure)[stats, state=(NgxDecoderState)running, info=(structure)[info, compression=(string)H.264/AVC, chroma-format=(string)4:2:0, profile=(string)main, level=(string)4, format=(string)NV12, width=(int)1920, height=(int)1080, framerate=(fraction)30000/1001;], metrics=(structure)[metrics, num-packets=(guint64)2932, num-bytes=(guint64)24471779, bitrate_bps=(guint64)3989459, num-frames=(guint64)1460, num-corrupted=(guint64)0, framerate_fps=(double)29.969773596900467;];], audio=(structure)[stats, state=(NgxDecoderState)running, info=(structure)[info, compression=(string)"AAC-LC\ \(adts\)", samplerate=(int)48000, channels=(int)2;], metrics=(structure)[metrics, num-packets=(guint64)2299, num-bytes=(guint64)784725, bitrate_bps=(guint64)127965, num-frames=(guint64)2299, num-corrupted=(guint64)0, framerate_fps=(double)46.863629038539536;];];], sink=(structure)[stats, type=(NgxSinkType)fake, video=(structure)[stats, average-rate=(double)-1, dropped=(guint64)0, rendered=(guint64)1455;], audio=(structure)[stats, average-rate=(double)-1, dropped=(guint64)0, rendered=(guint64)2278;];];`

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
