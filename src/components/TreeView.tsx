import { useState } from 'react'
import type { GstField, GstStructure } from '../parser/gstParser'

export function Tree({ structure }: { structure: GstStructure }) {
  return (
    <div className="tree">
      <div className="row"><span className="name">{structure.name}</span></div>
      <div className="node">
        {structure.fields.map((f, idx) => (
          <FieldRow key={idx} field={f} />
        ))}
      </div>
    </div>
  )
}

function FieldRow({ field }: { field: GstField }) {
  const isArray = Array.isArray(field.value)
  const isStruct = !isArray && typeof field.value === 'object' && field.value !== null && 'name' in (field.value as any)
  if (isArray) return <ArrayRow field={field} items={field.value as GstStructure[]} />
  if (isStruct) return <StructRow field={field} value={field.value as GstStructure} />
  return (
    <div className="row">
      <span className="toggle" />
      <span className="key">{field.key}</span>
      {field.type && <span className="type">: ({field.type})</span>}
      <span className="value">= {String(field.value)}</span>
    </div>
  )
}

function StructRow({ field, value }: { field: GstField; value: GstStructure }) {
  const [open, setOpen] = useState(true)
  return (
    <div>
      <div className="row">
        <span className="toggle" onClick={() => setOpen((o) => !o)}>{open ? '▾' : '▸'}</span>
        <span className="key">{field.key}</span>
        <span className="type">: (structure)</span>
        <span className="value"> = </span>
        <span className="name">{value.name}</span>
      </div>
      {open && (
        <div className="node">
          {value.fields.map((f, idx) => (
            <FieldRow key={idx} field={f} />
          ))}
        </div>
      )}
    </div>
  )
}

function ArrayRow({ field, items }: { field: GstField; items: GstStructure[] }) {
  const [open, setOpen] = useState(true)
  return (
    <div>
      <div className="row">
        <span className="toggle" onClick={() => setOpen((o) => !o)}>{open ? '▾' : '▸'}</span>
        <span className="key">{field.key}</span>
        <span className="type">: (structure[])</span>
        <span className="value"> [{items.length}]</span>
      </div>
      {open && (
        <div className="node">
          {items.map((item, idx) => (
            <div key={idx}>
              <div className="row">
                <span className="toggle" />
                <span className="value">#{idx}</span>
                <span className="value"> = </span>
                <span className="name">{item.name}</span>
              </div>
              <div className="node">
                {item.fields.map((f, i2) => (
                  <FieldRow key={i2} field={f} />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
