// src/components/StatsCard.jsx
import React from 'react';

function StatsCard({ totalAudits }) {
  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
      <div className="bg-gray-800 p-4 rounded-xl text-center shadow">
        <p className="text-sm text-gray-400">Total Audits</p>
        <p className="text-3xl font-bold">{totalAudits}</p>
      </div>
    </div>
  );
}

export default StatsCard;
