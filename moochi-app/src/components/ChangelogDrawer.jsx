import { useState } from "react";

const changelogData = {
  "2025-07-19": [
    { type: "Feature Added", detail: "Connected frontend to Groq API." },
    { type: "UI Improvement", detail: "Created dark theme layout for better readability." },
  ],
  "2025-07-18": [
    { type: "Bug Fix", detail: "Fixed 500 internal server error on analyze POST." },
  ],
};

const ChangelogDrawer = () => {
  const [open, setOpen] = useState(false);
  const toggleDrawer = () => setOpen(!open);

  return (
    <>
      <button
        onClick={toggleDrawer}
        className="fixed top-4 right-4 bg-gray-800 text-white px-3 py-1 rounded hover:bg-gray-700 z-50"
      >
        📋 Changelog
      </button>

      {open && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40" onClick={toggleDrawer}>
          <div
            className="fixed top-0 right-0 w-80 h-full bg-white dark:bg-gray-900 shadow-lg overflow-y-auto p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-xl font-bold mb-4">🛠️ Moochi Changelog</h2>
            {Object.entries(changelogData)
              .sort(([a], [b]) => new Date(b) - new Date(a))
              .map(([date, items]) => (
                <div key={date} className="mb-4">
                  <h3 className="font-semibold text-blue-600 dark:text-blue-400 mb-2">{date}</h3>
                  <ul className="space-y-1">
                    {items.map((entry, index) => (
                      <li key={index} className="text-sm border-l-4 pl-2 
                        border-green-500 dark:border-green-400">
                        <strong>{entry.type}:</strong> {entry.detail}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
          </div>
        </div>
      )}
    </>
  );
};

export default ChangelogDrawer;
