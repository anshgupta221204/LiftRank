import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import Gyms from './pages/Gyms';
import GymDetails from './pages/GymDetails';
import CreateGym from './pages/CreateGym';
import LogWorkout from './pages/LogWorkout';
import Workouts from './pages/Workouts';
import Leaderboard from './pages/Leaderboard';
import AITrainer from './pages/AITrainer';
import Competition from './pages/Competition';
import CompetitionDetails from './pages/CompetitionDetails';
import Exercises from './pages/Exercises';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          {/* Protected Routes */}
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/gyms" element={<Gyms />} />
            <Route path="/gyms/new" element={<CreateGym />} />
            <Route path="/gyms/:id" element={<GymDetails />} />
            <Route path="/workouts" element={<Workouts />} />
            <Route path="/workouts/new" element={<LogWorkout />} />
            <Route path="/leaderboard" element={<Leaderboard />} />
            <Route path="/ai-coach" element={<AITrainer />} />
            <Route path="/competition" element={<Competition />} />
            <Route path="/competition/:competitionId" element={<CompetitionDetails />} />
            <Route path="/exercises" element={<Exercises />} />
          </Route>

          {/* Fallback Redirection */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
