import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Layout from "./layouts/Layout";
import Dashboard from "./pages/Dashboard";
import Editor from "./pages/Editor";
import TemplatesPage from "./pages/TemplatesPage";
import Projects from "./pages/Projects";
import MiniVlogs from "./pages/ShortsCreator/MiniVlogs";
import Challenges from "./pages/ShortsCreator/Challenges";
import Tutorials from "./pages/ShortsCreator/Tutorials";
import ComedySkits from "./pages/ShortsCreator/ComedySkits";
import PetClips from "./pages/ShortsCreator/PetClips";
import Transformations from "./pages/ShortsCreator/Transformations";
import Gaming from "./pages/ShortsCreator/Gaming";
import Reactions from "./pages/ShortsCreator/Reactions";
import Music from "./pages/ShortsCreator/Music";
import Educational from "./pages/ShortsCreator/Educational";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="editor" element={<Editor />} />
          <Route path="templates" element={<TemplatesPage />} />
          <Route path="projects" element={<Projects />} />
          <Route path="ShortsCreator">
            <Route path="MiniVlogs" element={<MiniVlogs />} />
            <Route path="Challenges" element={<Challenges />} />
            <Route path="Tutorials" element={<Tutorials />} />
            <Route path="ComedySkits" element={<ComedySkits />} />
            <Route path="PetClips" element={<PetClips />} />
            <Route path="Transformations" element={<Transformations />} />
            <Route path="Gaming" element={<Gaming />} />
            <Route path="Reactions" element={<Reactions />} />
            <Route path="Music" element={<Music />} />
            <Route path="Educational" element={<Educational />} />
          </Route>
        </Route>
      </Routes>
    </Router>
  );
}
