import React from "react";
export default function VoiceoverGenerator() {
  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">AI Voiceover Generator 🎤</h2>
      <textarea className="w-full p-2 border rounded" placeholder="Enter text for voiceover..."></textarea>
      <button className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
        Generate Voiceover
      </button>
    </div>
  );
}
