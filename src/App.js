import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

// Import theme
import theme from './theme/theme';

// Import layout
import Layout from './components/layout/Layout';

// Import authentication context
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

// Import pages
import HomePage from './pages/HomePage';
import EventsPage from './pages/EventsPage';
import CalendarPage from './pages/CalendarPage';
import EventDetailPage from './pages/EventDetailPage';
import CreateEventPage from './pages/CreateEventPage';
import GuestManagementPage from './pages/GuestManagementPage';
import BudgetManagementPage from './pages/BudgetManagementPage';
import SocialMediaPage from './pages/SocialMediaPage';
import FutureIntegrationsPage from './pages/FutureIntegrationsPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ProfilePage from './pages/ProfilePage';
import AIAssistantPage from './pages/AIAssistantPage';
import ExplorePage from './pages/ExplorePage';
import MyEventsPage from './pages/MyEventsPage';

// Placeholder pages (to be implemented later)
const DashboardPage = () => <div>Dashboard Page - Coming Soon</div>;

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <Router>
          <Layout>
            <Routes>
              {/* Public routes */}
              <Route path="/" element={<HomePage />} />
              <Route path="/events" element={<EventsPage />} />
              <Route path="/events/:id" element={<EventDetailPage />} />
              <Route path="/calendar" element={<CalendarPage />} />
              <Route path="/explore" element={<ExplorePage />} />
              <Route path="/integrations" element={<FutureIntegrationsPage />} />
              <Route path="/ai-assistant" element={<AIAssistantPage />} />
              
              {/* Auth routes */}
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              
              {/* Protected routes */}
              <Route path="/create-event" element={
                <ProtectedRoute>
                  <CreateEventPage />
                </ProtectedRoute>
              } />
              <Route path="/events/:eventId/guests" element={
                <ProtectedRoute>
                  <GuestManagementPage />
                </ProtectedRoute>
              } />
              <Route path="/events/:eventId/budget" element={
                <ProtectedRoute>
                  <BudgetManagementPage />
                </ProtectedRoute>
              } />
              <Route path="/events/:eventId/social" element={
                <ProtectedRoute>
                  <SocialMediaPage />
                </ProtectedRoute>
              } />
              <Route path="/profile" element={
                <ProtectedRoute>
                  <ProfilePage />
                </ProtectedRoute>
              } />
              <Route path="/my-events" element={
                <ProtectedRoute>
                  <MyEventsPage />
                </ProtectedRoute>
              } />
              <Route path="/dashboard" element={
                <ProtectedRoute>
                  <DashboardPage />
                </ProtectedRoute>
              } />
            </Routes>
          </Layout>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
