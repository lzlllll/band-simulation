import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { MainLayout } from "./components/layout/MainLayout";
import Home from "./pages/Home";
import Roster from "./pages/Roster";
import Songs from "./pages/Songs";
import Activities from "./pages/Activities";
import Gigs from "./pages/Gigs";
import Social from "./pages/Social";
import Settings from "./pages/Settings";

const BASE_NAME = "/lifetime-band-simulator";

export default function App() {
  return (
    <Router basename={BASE_NAME}>
      <Routes>
        <Route element={<MainLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/roster" element={<Roster />} />
          <Route path="/songs" element={<Songs />} />
          <Route path="/activities" element={<Activities />} />
          <Route path="/gigs" element={<Gigs />} />
          <Route path="/social" element={<Social />} />
          <Route path="/settings" element={<Settings />} />
        </Route>
      </Routes>
    </Router>
  );
}
