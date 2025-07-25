// Terminal.jsx

import React from 'react';

const Terminal = ({ output }) => {
  return (
    <div className="bg-black text-white flex flex-col justify-between p-4 mt-2 h-60 overflow-auto whitespace-pre-wrap text-sm font-mono">
      <div>
        <h2 className="text-white font-bold mb-2">Output:</h2>
        { Array.isArray(output) && output.length > 0 ? (
          output.map((item, index) => (
            <div key={index} className="mb-2">
              <span className="text-green-400">{'>>>> '}</span>
              <span>{item.result || '(no output)'}</span>
            </div>
          ))
        ) : (
          <p className="text-gray-400">(no output)</p>
        )}

        {/* Interpreter note for relevant languages */}
        {['python', 'java', 'c', 'cpp'].includes(output?.[output.length - 1]?.language) && (
          <p className="text-xs text-gray-500 mt-2">[Executed via server or interpreter]</p>
        )}
      </div>

      {/* Fixed at bottom of the terminal (within scrollable box) */}
      <div className="mt-auto pt-2 border-t border-gray-700">
        <h3 className="text-sm font-medium text-gray-300 bg-gray-800 mx-1 px-4 py-2 rounded-md inline-block shadow-md">
          Press <span className="font-semibold text-blue-400">Ctrl</span> + <span className="font-semibold text-blue-400">Alt</span> + <span className="font-semibold text-blue-400">N</span> to Run
        </h3>
        <h3 className="text-sm font-medium text-gray-300 bg-gray-800 mx-1 px-4 py-2 rounded-md inline-block shadow-md">
          Press <span className="font-semibold text-blue-400">Ctrl</span> + <span className="font-semibold text-blue-400">S</span> to Save
        </h3>
      </div>
    </div>
  );
};

export default Terminal;
