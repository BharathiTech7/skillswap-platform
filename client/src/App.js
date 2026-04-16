import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import SwapRequests from "./pages/SwapRequests";
import Sessions from "./pages/Sessions";
import Chat from "./pages/Chat";
import FindPartners from "./pages/FindPartners";
import SkillChallenges from "./pages/SkillChallenges";
import ProtectedRoute from "./components/ProtectedRoute";
import EditProfile from "./pages/EditProfile";
import Meeting from "./pages/Meeting";
import OutcomeForm from "./pages/OutcomeForm";
import { Toaster } from "react-hot-toast";

function App() {
  return (
    <BrowserRouter>
      <Routes>

        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />

      <Route
  path="/dashboard"
  element={
    <ProtectedRoute>
      <Layout>
        <Dashboard />
      </Layout>
    </ProtectedRoute>
  }
/>
      <Route path="/profile" element={<ProtectedRoute><Layout><Profile /></Layout></ProtectedRoute>} />
      <Route path="/profile/edit" element={<ProtectedRoute><Layout><EditProfile /></Layout></ProtectedRoute>} />
      <Route path="/partners" element={<Layout><FindPartners /></Layout>} />
      <Route path="/requests" element={<ProtectedRoute><Layout><SwapRequests /></Layout></ProtectedRoute>} />
      <Route path="/sessions" element={<ProtectedRoute><Layout><Sessions /></Layout></ProtectedRoute>} />
      <Route path="/chat" element={<ProtectedRoute><Layout><Chat /></Layout></ProtectedRoute>} />
      <Route path="/challenges" element={<ProtectedRoute><Layout><SkillChallenges /></Layout></ProtectedRoute>} />
      <Route path="/outcomes/new/:roomId" element={<ProtectedRoute><Layout><OutcomeForm /></Layout></ProtectedRoute>} />
      <Route path="/meeting/:roomId" element={<ProtectedRoute><Meeting /></ProtectedRoute>} />
      </Routes>
      <Toaster position="top-right" />
    </BrowserRouter>
  );
}

export default App;