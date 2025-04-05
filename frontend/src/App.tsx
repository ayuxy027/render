import React from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import Navbar from "./components/Navbar";
import LandingPage from "./pages/LandingPage";
import Summarisation from "./pages/Summarisation";
import Transcript from "./pages/Transcript";
import DocumentQuery from "./pages/DocumentQuery";
import Draft from "./pages/Draft";
import AdvocateDiary from "./pages/AdvocateDiary";
import ChatSection from "./components/Chatbot";
import AuthPage from "./pages/AuthPage";
import DocumentSharing from "./pages/DocumentSharing";
import LawyerDashboard from "./pages/LawyerDashboard";
import JudgeDashboard from "./pages/JudgeDashboard";
import ForbiddenPage from "./pages/ForbiddenPage";
import UserDashboard from "./pages/UserDashboard";

const App: React.FC = () => {
  const location = useLocation();

  const noNavbarRoutes = ["/", "/login", "/signup", "/forbidden"];

  return (
    <div className="flex flex-col min-h-screen">
      {!noNavbarRoutes.includes(location.pathname) && <Navbar />}

      <div className="flex-1">
        <div className="mt-[20px]">
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/lawyer" element={<LawyerDashboard />} />
            <Route path="/summarisation" element={<Summarisation />} />
            <Route path="/transcript" element={<Transcript />} />
            <Route path="/query" element={<DocumentQuery />} />
            <Route path="/draft" element={<Draft />} />
            <Route path="/advocate-diary" element={<AdvocateDiary />} />
            <Route path="/document-sharing" element={<DocumentSharing />} />
            <Route path="/login" element={<AuthPage />} />
            <Route path="/signup" element={<AuthPage />} />
            <Route path="/forbidden" element={<ForbiddenPage />} />
            <Route path="/judge" element={<JudgeDashboard />} />
            <Route path="/user" element={<UserDashboard />} />
          </Routes>
        </div>
      </div>
      <ChatSection />
    </div>
  );
};

export default App;
