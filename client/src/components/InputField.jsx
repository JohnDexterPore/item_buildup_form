import React from "react";

function InputField({
  label,
  name,
  value,
  onChange,
  type = "text",
  className = "",
  required = false,
}) {
  return (
    <div className={`flex-1 ${className}`}>
      <label className="block text-sm font-semibold text-gray-600 uppercase mb-1">
        {label}
      </label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        className="w-full px-4 py-2 bg-gray-100 border border-gray-300 rounded-lg"
      />
    </div>
  );
}

export default InputField;
