import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./global.css";
import "./Notification.css";
import LandingPage from "./Landingpage/LandingPage.jsx";
import Dashboard from "./Dashboard/Dashboard.jsx";
import RecruiterDashboard from "./Dashboard/RecruiterDashboard.jsx";

// Common Pages
import ProfilePage from "./pages/common/ProfilePage/ProfilePage.jsx";
import SettingsPage from "./pages/common/SettingsPage/SettingsPage.jsx";

// Job Seeker Pages
import JobsPage from "./pages/jobseeker/JobsPage/JobsPage.jsx";
import MockTestPage from "./pages/jobseeker/MockTestPage/MockTestPage.jsx";
import InternshipsPage from "./pages/jobseeker/InternshipsPage/InternshipsPage.jsx";
import JobDetailsPage from "./pages/jobseeker/JobDetailsPage/JobDetailsPage.jsx";
import SavedJobsPage from "./pages/jobseeker/SavedJobsPage/SavedJobsPage.jsx";
import AppliedJobsPage from "./pages/jobseeker/AppliedJobsPage/AppliedJobsPage.jsx";

// Recruiter Pages
import PostJobPage from "./pages/recruiter/PostJobPage/PostJobPage.jsx";
import PostedJobsPage from "./pages/recruiter/PostedJobsPage/PostedJobsPage.jsx";
import ApplicantsPage from "./pages/recruiter/ApplicantsPage/ApplicantsPage.jsx";
import { AuthProvider } from "./context/AuthContext.jsx";
import { NotificationProvider } from "./context/NotificationContext.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import InterviewPage from "./pages/jobseeker/InterviewPage/InterviewPage.jsx";
import InterviewResultPage from "./pages/jobseeker/InterviewResultPage/InterviewResultPage.jsx";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <AuthProvider>
      <NotificationProvider>
        <BrowserRouter>
          <Routes>
          <Route path="/" element={<LandingPage />} />

          {/* Job Seeker Routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/jobs"
            element={
              <ProtectedRoute>
                <JobsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/job/:id"
            element={
              <ProtectedRoute>
                <JobDetailsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/internships"
            element={
              <ProtectedRoute>
                <InternshipsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/internship/:id"
            element={
              <ProtectedRoute>
                <JobDetailsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/saved-jobs"
            element={
              <ProtectedRoute>
                <SavedJobsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/mock-test"
            element={
              <ProtectedRoute>
                <MockTestPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/applied-jobs"
            element={
              <ProtectedRoute>
                <AppliedJobsPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/interview/:applicationId"
            element={
              <ProtectedRoute>
                <InterviewPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/mock-interview/:sessionId"
            element={
              <ProtectedRoute>
                <InterviewPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/interview-result/:applicationId"
            element={
              <ProtectedRoute>
                <InterviewResultPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/mock-interview-result/:sessionId"
            element={
              <ProtectedRoute>
                <InterviewResultPage />
              </ProtectedRoute>
            }
          />

          {/* Recruiter Routes */}
          <Route
            path="/recruiter-dashboard"
            element={
              <ProtectedRoute recruiterOnly>
                <RecruiterDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/recruiter/post-job"
            element={
              <ProtectedRoute recruiterOnly>
                <PostJobPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/recruiter/posted-jobs"
            element={
              <ProtectedRoute recruiterOnly>
                <PostedJobsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/recruiter/applicants"
            element={
              <ProtectedRoute recruiterOnly>
                <ApplicantsPage />
              </ProtectedRoute>
            }
          />

          {/* Common Routes */}
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/settings"
            element={
              <ProtectedRoute>
                <SettingsPage />
              </ProtectedRoute>
            }
          />
        </Routes>
      </BrowserRouter>
      </NotificationProvider>
    </AuthProvider>
  </React.StrictMode>
);
