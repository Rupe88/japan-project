'use client';

import React from 'react';

export default function SelectPlatformPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold">Select Your Platform</h1>
        <p className="text-gray-400">Choose which platform you want to explore.</p>

        <div className="flex justify-center gap-4 mt-6">
          <button className="px-6 py-2 bg-cyan-500 hover:bg-cyan-600 rounded-lg">HR Platform</button>
          <button className="px-6 py-2 bg-pink-500 hover:bg-pink-600 rounded-lg">Marketplace</button>
          <button className="px-6 py-2 bg-green-500 hover:bg-green-600 rounded-lg">Tender</button>
        </div>
      </div>
    </div>
  );
}
