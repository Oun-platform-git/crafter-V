import React from "react";
import { Route, Routes } from "react-router-dom";
import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";
import Home from "./pages/Home";
import Editor from "./pages/Editor";
import Shorts from "./pages/Shorts";

export default function App() {
  return (
    <div className="flex h-screen bg-gray-950 text-white">
      <Sidebar />
      <div className="flex-1">
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/editor" element={<Editor />} />
          <Route path="/shorts" element={<Shorts />} />
        </Routes>
      </div>
    </div>
  );
}
