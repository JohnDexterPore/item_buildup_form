// prompt.jsx
import React from "react";

function Prompt({ type, message, onAccept, onCancel, isVisible, data }) {
  if (!isVisible) return null;

  if (type === "question") {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 animate-fade-in">
        <div className="bg-white rounded-2xl shadow-2xl p-6 w-80 max-w-full text-center space-y-6">
          <p className="text-lg font-medium text-gray-900">{message}</p>
          <div className="flex justify-center gap-4">
            <button
              onClick={() => onAccept(data)}
              className="px-5 py-2.5 text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition duration-200 shadow"
            >
              Yes
            </button>
            <button
              onClick={onCancel}
              className="px-5 py-2.5 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition duration-200"
            >
              No
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (type === "info") {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 animate-fade-in">
        <div className="bg-white rounded-2xl shadow-2xl p-6 w-80 max-w-full text-center space-y-6">
          <p className="text-lg font-medium text-gray-900">{message}</p>
          <button
            onClick={onAccept}
            className="px-5 py-2.5 text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition duration-200 shadow"
          >
            OK
          </button>
        </div>
      </div>
    );
  }

  return null; // fallback if type is not recognized
}

export default Prompt;
