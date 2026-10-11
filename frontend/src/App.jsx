import { Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Profile from "./pages/Profile.jsx";
import Plans from "./pages/Plans.jsx";
import Workouts from "./pages/Workouts.jsx";
import Diet from "./pages/Diet.jsx";
import Progress from "./pages/Progress.jsx";
import Explore from "./pages/Explore.jsx";
import Fitness from "./pages/Fitness.jsx";
import WorkoutDetail from "./pages/WorkoutDetail.jsx";
import Player from "./pages/Player.jsx";

export default function App() {
  return (
    <div className="app">
      <div className="app-body">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/fitness" element={<Fitness />} />
            <Route path="/explore" element={<Explore />} />
            <Route path="/explore/:id" element={<WorkoutDetail />} />
            <Route path="/play/:id" element={<Player />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/plans" element={<Plans />} />
            <Route path="/workouts" element={<Workouts />} />
            <Route path="/diet" element={<Diet />} />
            <Route path="/progress" element={<Progress />} />
          </Route>
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </div>
      <footer className="footer">FitForge provides general guidance only, not medical advice.</footer>
    </div>
  );
}
