# GST Structure Viewer

A small React + TypeScript app that parses a serialized `GST_STRUCTURE` string and renders it as a collapsible hierarchical view.

## Run locally (Windows + fnm)

```powershell
# Ensure Node is available via fnm
fnm env --use-on-cd | Out-String | Invoke-Expression
fnm use 22.21.1

# Start dev server
npm run dev
```

Open the local URL printed by Vite (typically http://localhost:5173).

## Usage
- Paste a serialized `GST_STRUCTURE` into the textarea.
- Click "Parse" to build the tree; expand/collapse nested structures.

The parser is resilient to typical GStreamer escaping (like `\,`, `\=`) and nested `(structure)<...>` or quoted structure bodies. It attempts multiple unescape passes and recursively parses nested structures.

## Notes
- Numbers are coerced to JavaScript numbers when possible; strings retain quotes only when necessary.
- `{ ... }` is displayed as a GStreamer value list, while `< ... >` is displayed as a GStreamer value array. Embedded structures use `[ ... ]`.
- Unknown or irregular shapes fall back to best-effort parsing; if input is malformed you’ll see an error.
- When displaying typed fields, the viewer keeps the full `key : (type)value` text so values like `layout=(string)2.0` do not lose the fractional suffix.
