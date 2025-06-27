import React from "react";

function TextAreaField({ label, name, value, onChange, required = false }) {
  return (
    <div>
      <label className="block text-sm font-semibold text-gray-600 uppercase mb-1">
        {label}
      </label>
      <textarea
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        rows={4}
        className="w-full px-4 py-2 bg-gray-100 border border-gray-300 rounded-lg"
      />
    </div>
  );
}

export default TextAreaField;
