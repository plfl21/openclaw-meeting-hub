import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import Layout from './components/Layout';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import Pricing from './pages/Pricing';
import Dashboard from './pages/Dashboard';
import Meetings from './pages/Meetings';
import MeetingDetail from './pages/MeetingDetail';
import NeuronFeed from './pages/NeuronFeed';
import TaskBoard from './pages/TaskBoard';
import Analytics from './pages/Analytics';
import ServerMetrics from './pages/ServerMetrics';
import Proposals from './pages/Proposals';
import Settings from './pages/Settings';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/pricing" element={<Pricing />} />

      <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/meetings" element={<Meetings />} />
        <Route path="/meetings/:id" element={<MeetingDetail />} />
        <Route path="/neuron" element={<NeuronFeed />} />
        <Route path="/tasks" element={<TaskBoard />} />
        <Route path="/analytics" element={<Analytics />} />
        <Route path="/server" element={<ServerMetrics />} />
        <Route path="/proposals" element={<Proposals />} />
        <Route path="/settings" element={<Settings />} />
      </Route>
    </Routes>
  );
}
