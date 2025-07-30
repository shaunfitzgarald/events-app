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
import EditEventPage from './pages/EditEventPage';
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
import PurchaseTicketPage from './pages/PurchaseTicketPage';
import TicketConfirmationPage from './pages/TicketConfirmationPage';
import PrivacyPolicyPage from './pages/PrivacyPolicyPage';
import TermsOfServicePage from './pages/TermsOfServicePage';
import ContactUsPage from './pages/ContactUsPage';
import HelpCenterPage from './pages/HelpCenterPage';

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
              <Route path="/privacy" element={<PrivacyPolicyPage />} />
              <Route path="/terms" element={<TermsOfServicePage />} />
              <Route path="/contact" element={<ContactUsPage />} />
              <Route path="/help" element={<HelpCenterPage />} />
              
              {/* Auth routes */}
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              
              {/* Protected routes */}
              <Route path="/create-event" element={
                <ProtectedRoute>
                  <CreateEventPage />
                </ProtectedRoute>
              } />
              <Route path="/events/:id/edit" element={
                <ProtectedRoute>
                  <EditEventPage />
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
              <Route path="/events/:eventId/purchase-ticket" element={
                <ProtectedRoute>
                  <PurchaseTicketPage />
                </ProtectedRoute>
              } />
              <Route path="/tickets/:ticketId/confirmation" element={
                <ProtectedRoute>
                  <TicketConfirmationPage />
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
