import React from "react";
export default function Sidebar() {
  return (
    <aside className="bg-gray-900 text-white w-64 h-full p-4">
      <ul className="space-y-4">
        <li className="hover:text-yellow-300 cursor-pointer">📤 Upload</li>
        <li className="hover:text-yellow-300 cursor-pointer">🎙 Voiceover</li>
        <li className="hover:text-yellow-300 cursor-pointer">⚙️ Settings</li>
      </ul>
    </aside>
  );
}
