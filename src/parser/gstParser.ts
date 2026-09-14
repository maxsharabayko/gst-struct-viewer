export interface GstField {
  key: string
  type?: string
  value: GstPrimitive | GstStructure | GstCollection
}

export interface GstStructure {
  name: string
  fields: GstField[]
}

export type GstCollectionKind = 'array' | 'list'

export interface GstCollection {
  kind: GstCollectionKind
  items: (GstStructure | GstPrimitive)[]
}

export type GstPrimitive = string | number | boolean | null
type GstValue = GstPrimitive | GstStructure | GstCollection

export function parseGstStructure(input: string): GstStructure {
  const cleaned = sanitizeInput(input)
  const parts = splitTopLevel(cleaned, ',')
  if (parts.length === 0) throw new Error('Empty input')
  const name = parts[0].trim()
  if (!name) throw new Error('Missing structure name')
  const fields: GstField[] = []
  for (let i = 1; i < parts.length; i++) {
    const token = parts[i].trim()
    if (!token) continue
    const field = parseField(token)
    fields.push(field)
  }
  return { name, fields }
}

export function formatGstValue(value: GstValue): string {
  if (typeof value === 'string') return value
  if (typeof value === 'number') return String(value)
  if (typeof value === 'boolean') return value ? 'true' : 'false'
  if (value === null) return 'null'
  return ''
}

function sanitizeInput(src: string): string {
  let s = src.trim()
  // Drop trailing semicolons/spaces
  s = s.replace(/;+\s*$/g, '')
  // Iteratively unescape backslash-escaped punctuation
  let prev = ''
  let iter = 0
  while (s !== prev && iter < 6) {
    prev = s
    s = s.replace(/\\([,=()<>;"\\\]{}  [])/g, '$1')
    iter++
  }
  // Normalize whitespace around commas
  s = s.replace(/\s+,\s+/g, ', ')
  return s
}

function parseField(token: string): GstField {
  const eq = token.indexOf('=')
  if (eq === -1) throw new Error(`Invalid field: ${token}`)
  const key = token.slice(0, eq).trim()
  const rest = token.slice(eq + 1).trim()

  // Expect (type)prefix
  if (!rest.startsWith('(')) {
    // Untyped arrays/lists of primitives, e.g. array=<1, 2, 3>
    if (rest.startsWith('<')) {
      const end = findMatching(rest, 0, '<', '>')
      if (end === -1) throw new Error(`Unclosed <...> for field: ${token}`)
      const inner = rest.slice(1, end)
      return { key, value: { kind: 'array', items: parseCollectionItems(inner) } }
    }
    if (rest.startsWith('{')) {
      const end = findMatching(rest, 0, '{', '}')
      if (end === -1) throw new Error(`Unclosed {...} for field: ${token}`)
      const inner = rest.slice(1, end)
      return { key, value: { kind: 'list', items: parseCollectionItems(inner) } }
    }
    // Some strings could be bare values; treat as string
    return { key, value: coercePrimitive(rest) }
  }

  const closeType = findMatching(rest, 0, '(', ')')
  if (closeType === -1) throw new Error(`Unclosed type in field: ${token}`)
  const type = rest.slice(1, closeType)
  const afterType = rest.slice(closeType + 1).trim()

  // GStreamer uses brackets for embedded structures, braces for lists, and angles for arrays.
  if (type === 'structure') {
    if (afterType.startsWith('<')) {
      const end = findMatching(afterType, 0, '<', '>')
      if (end === -1) throw new Error(`Unclosed <...> for structure: ${token}`)
      const inner = afterType.slice(1, end)
      return { key, type, value: { kind: 'array', items: parseStructureArray(inner) } }
    }
    if (afterType.startsWith('[')) {
      const end = findMatching(afterType, 0, '[', ']')
      if (end === -1) throw new Error(`Unclosed [...] for structure: ${token}`)
      const inner = afterType.slice(1, end)
      const content = sanitizeInput(inner)
      const innerStruct = parseGstStructure(content)
      return { key, type, value: innerStruct }
    }
    if (afterType.startsWith('{')) {
      const end = findMatching(afterType, 0, '{', '}')
      if (end === -1) throw new Error(`Unclosed {...} for structure: ${token}`)
      const inner = afterType.slice(1, end)
      const items = parseStructureArray(inner)
      return { key, type, value: { kind: 'list', items } }
    }
    // Quoted structure content
    if (afterType.startsWith('"')) {
      const { text } = readQuoted(afterType, 0)
      const content = sanitizeInput(text)
      const innerStruct = parseGstStructure(content)
      return { key, type, value: innerStruct }
    }
    // Some cases: structure)name, key=(type)...  i.e., inline name
    const inline = sanitizeInput(afterType)
    const innerStruct = parseGstStructure(inline)
    return { key, type, value: innerStruct }
  }

  // Primitive typed value; may be array/list or a single (possibly quoted) value
  if (afterType.startsWith('<')) {
    const end = findMatching(afterType, 0, '<', '>')
    if (end === -1) throw new Error(`Unclosed <...> for field: ${token}`)
    const inner = afterType.slice(1, end)
    return { key, type, value: { kind: 'array', items: parseCollectionItems(inner, type) } }
  }
  if (afterType.startsWith('{')) {
    const end = findMatching(afterType, 0, '{', '}')
    if (end === -1) throw new Error(`Unclosed {...} for field: ${token}`)
    const inner = afterType.slice(1, end)
    return { key, type, value: { kind: 'list', items: parseCollectionItems(inner, type) } }
  }
  let valueStr = stripTrailingSemicolons(afterType)
  if (valueStr.startsWith('"')) {
    const { text } = readQuoted(valueStr, 0)
    valueStr = text
  }
  const value = coercePrimitive(valueStr, type)
  return { key, type, value }
}

function coercePrimitive(v: string, type?: string): GstPrimitive {
  const s = stripTrailingSemicolons(v).trim()
  if (s === 'null') return null
  if (s === 'true') return true
  if (s === 'false') return false
  if (type === 'string' || type === 'GstString') return s.replace(/^"|"$/g, '')
  // Remove optional surrounding quotes (already handled in most paths)
  const uq = s.replace(/^"|"$/g, '')
  // integers
  if (/^[+-]?\d+$/.test(uq)) return Number(uq)
  // floats
  if (/^[+-]?(?:\d+\.\d*|\d*\.\d+)(?:[eE][+-]?\d+)?$/.test(uq)) return Number(uq)
  return uq
}

function splitTopLevel(s: string, delim: string): string[] {
  const out: string[] = []
  let depthParen = 0
  let depthAngle = 0
  let depthSquare = 0
  let depthBrace = 0
  let inQuote = false
  let buf = ''
  for (let i = 0; i < s.length; i++) {
    const c = s[i]
    if (c === '"') {
      inQuote = !inQuote
      buf += c
      continue
    }
    if (!inQuote) {
      if (c === '(') depthParen++
      else if (c === ')') depthParen = Math.max(0, depthParen - 1)
      else if (c === '<') depthAngle++
      else if (c === '>') depthAngle = Math.max(0, depthAngle - 1)
      else if (c === '[') depthSquare++
      else if (c === ']') depthSquare = Math.max(0, depthSquare - 1)
      else if (c === '{') depthBrace++
      else if (c === '}') depthBrace = Math.max(0, depthBrace - 1)
      else if (c === delim && depthParen === 0 && depthAngle === 0 && depthSquare === 0 && depthBrace === 0) {
        out.push(buf)
        buf = ''
        continue
      }
    }
    buf += c
  }
  if (buf) out.push(buf)
  return out
}

function findMatching(s: string, start: number, open: string, close: string): number {
  let depth = 0
  let inQuote = false
  for (let i = start; i < s.length; i++) {
    const c = s[i]
    if (c === '"') inQuote = !inQuote
    if (inQuote) continue
    if (c === open) depth++
    else if (c === close) {
      depth--
      if (depth === 0) return i
    }
  }
  return -1
}

function readQuoted(s: string, start: number): { text: string; nextIndex: number } {
  // start is at opening quote
  if (s[start] !== '"') throw new Error('readQuoted requires starting quote')
  let i = start + 1
  let out = ''
  while (i < s.length) {
    const c = s[i]
    if (c === '"') return { text: out, nextIndex: i + 1 }
    if (c === '\\' && i + 1 < s.length) {
      // simple unescape for quotes and punctuation
      const next = s[i + 1]
      const ESC = ",=()<>;[]{} \\\""
      if (ESC.includes(next)) {
        out += next
        i += 2
        continue
      }
    }
    out += c
    i++
  }
  throw new Error('Unterminated quoted string')
}

function stripTrailingSemicolons(s: string): string {
  return s.replace(/;+\s*$/, '')
}

function parseCollectionItems(content: string, elementType?: string): (GstStructure | GstPrimitive)[] {
  const s = sanitizeInput(content)
  const parts = splitTopLevel(s, ',')
  const items: (GstStructure | GstPrimitive)[] = []
  for (const raw of parts) {
    const trimmed = stripTrailingSemicolons(raw).trim()
    if (!trimmed) continue
    if (trimmed.startsWith('[')) {
      const end = findMatching(trimmed, 0, '[', ']')
      const inner = end === -1 ? trimmed.slice(1) : trimmed.slice(1, end)
      items.push(parseGstStructure(sanitizeInput(inner)))
      continue
    }
    if (trimmed.startsWith('(')) {
      // Element carries its own (type)value, e.g. (int)1
      const closeType = findMatching(trimmed, 0, '(', ')')
      if (closeType !== -1) {
        const itemType = trimmed.slice(1, closeType)
        const itemValueStr = trimmed.slice(closeType + 1).trim()
        items.push(coercePrimitive(itemValueStr, itemType))
        continue
      }
    }
    items.push(coercePrimitive(trimmed, elementType))
  }
  return items
}

function parseStructureArray(content: string): GstStructure[] {
  const s = sanitizeInput(content)
  const items: GstStructure[] = []
  let i = 0
  while (i < s.length) {
    // Skip whitespace and separators
    while (i < s.length && /[\s,;]/.test(s[i])) i++
    if (i >= s.length) break
    if (s[i] !== '[') {
      // Fallback: parse until next top-level separator
      const nextSep = findNextTopLevelSep(s, i)
      const chunk = s.slice(i, nextSep === -1 ? s.length : nextSep)
      const trimmed = stripTrailingSemicolons(chunk).trim()
      if (trimmed) items.push(parseGstStructure(trimmed))
      i = nextSep === -1 ? s.length : nextSep + 1
      continue
    }
    const end = findMatching(s, i, '[', ']')
    if (end === -1) throw new Error('Unclosed [...] in array')
    const inner = s.slice(i + 1, end)
    items.push(parseGstStructure(inner))
    i = end + 1
  }
  return items
}

function findNextTopLevelSep(s: string, start: number): number {
  let depthParen = 0, depthAngle = 0, depthSquare = 0, depthBrace = 0
  let inQuote = false
  for (let i = start; i < s.length; i++) {
    const c = s[i]
    if (c === '"') inQuote = !inQuote
    if (inQuote) continue
    if (c === '(') depthParen++
    else if (c === ')') depthParen = Math.max(0, depthParen - 1)
    else if (c === '<') depthAngle++
    else if (c === '>') depthAngle = Math.max(0, depthAngle - 1)
    else if (c === '[') depthSquare++
    else if (c === ']') depthSquare = Math.max(0, depthSquare - 1)
    else if (c === '{') depthBrace++
    else if (c === '}') depthBrace = Math.max(0, depthBrace - 1)
    else if ((c === ',' || c === ';') && depthParen === 0 && depthAngle === 0 && depthSquare === 0 && depthBrace === 0) {
      return i
    }
  }
  return -1
}
