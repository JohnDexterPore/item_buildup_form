import React from 'react'

function SelectField({
  label,
  name,
  value,
  onChange,
  options,
  required = false,
}) {
  return (
    <div className="flex-1">
      <label className="block text-sm font-semibold text-gray-600 uppercase mb-1">
        {label}
      </label>
      <select
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg"
      >
        <option value="">{`Select ${label}`}</option>
        {options.map((o, i) => (
          <option key={i} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}

export default SelectField