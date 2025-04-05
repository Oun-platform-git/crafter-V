import React from "react";
export default function ShortsCreator() {
  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">AI Shorts Generator 🚀</h2>
      <textarea className="w-full p-2 border rounded" placeholder="Paste your script or video idea..."></textarea>
      <button className="mt-4 bg-yellow-400 text-black px-4 py-2 rounded hover:bg-yellow-500">
        Generate Shorts
      </button>
    </div>
  );
}
