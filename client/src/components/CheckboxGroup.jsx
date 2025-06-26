import React from "react";

function CheckboxGroup({ label, options, values, onChange }) {
  return (
    <div>
      <label className="block text-sm font-semibold text-gray-600 uppercase mb-1">
        {label}
      </label>
      <div className="flex flex-wrap gap-4">
        {options.map((opt) => (
          <label key={opt.name} className="inline-flex items-center gap-2">
            <input
              type="checkbox"
              name={opt.name}
              checked={values[opt.name]}
              onChange={onChange}
              className="accent-indigo-600"
            />
            {opt.label}
          </label>
        ))}
      </div>
    </div>
  );
}

export default CheckboxGroup;
