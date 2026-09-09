import { useState } from 'react'
import { formatGstValue, type GstCollection, type GstField, type GstStructure } from '../parser/gstParser'

export function Tree({ structure }: { structure: GstStructure }) {
  return (
    <div className="tree">
      <div className="row"><span className="badge badge-struct">struct</span><span className="name">{structure.name}</span></div>
      <div className="node">
        {structure.fields.map((f, idx) => (
          <FieldRow key={idx} field={f} />
        ))}
      </div>
    </div>
  )
}

function FieldRow({ field }: { field: GstField }) {
  if (isGstCollection(field.value)) {
    return <CollectionRow field={field} collection={field.value} />
  }
  const isStruct =
    typeof field.value === 'object' &&
    field.value !== null &&
    'name' in field.value &&
    'fields' in field.value
  if (isStruct) return <StructRow field={field} value={field.value as GstStructure} />
  return (
    <div className="row">
      <span className="toggle" />
      <span className="key">{field.key}</span>
      {field.type && <span className="type">{` : (${field.type})`}</span>}
      <span className="value">{` = ${formatGstValue(field.value)}`}</span>
    </div>
  )
}

function isGstCollection(value: GstField['value']): value is GstCollection {
  return typeof value === 'object' && value !== null && 'kind' in value && 'items' in value
}

function StructRow({ field, value }: { field: GstField; value: GstStructure }) {
  const [open, setOpen] = useState(true)
  return (
    <div>
      <div className="row">
        <span className="toggle" onClick={() => setOpen((o) => !o)}>{open ? '▾' : '▸'}</span>
        <span className="key">{field.key}</span>
        <span className="value"> = </span>
        <span className="badge badge-struct">struct</span>
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

function CollectionRow({ field, collection }: { field: GstField; collection: GstCollection }) {
  const [open, setOpen] = useState(true)
  const { items, kind } = collection
  return (
    <div>
      <div className="row">
        <span className="toggle" onClick={() => setOpen((o) => !o)}>{open ? '▾' : '▸'}</span>
        <span className="key">{field.key}</span>
        <span className="value"> = </span>
        <span className="badge badge-array">{kind}</span>
        <span className="value">[{items.length}]</span>
      </div>
      {open && (
        <div className="node">
          {items.map((item, idx) => (
            <div key={idx}>
              <div className="row">
                <span className="toggle" />
                <span className="value index">[{idx}]</span>
                <span className="value"> = </span>
                <span className="badge badge-struct">struct</span>
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
