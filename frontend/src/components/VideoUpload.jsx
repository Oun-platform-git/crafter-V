import React from "react";
export default function VideoUpload() {
  return (
    <div className="p-4">
      <h2 className="text-lg font-bold mb-2">Upload Your Video 🎥</h2>
      <input type="file" accept="video/*" className="block w-full" />
    </div>
  );
}
