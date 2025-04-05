import React from "react";
export default function Navbar() {
  return (
    <nav className="bg-black text-white px-6 py-4 shadow-md flex justify-between items-center">
      <h1 className="text-xl font-bold">Crafter V 🎬</h1>
      <div className="space-x-4">
        <button className="hover:text-yellow-300">Home</button>
        <button className="hover:text-yellow-300">Editor</button>
        <button className="hover:text-yellow-300">Shorts</button>
      </div>
    </nav>
  );
}
