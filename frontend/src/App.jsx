import { Routes, Route, useLocation } from "react-router-dom";
import { useEffect } from "react";
import Navbar from "@/components/Navbar";
import Dashboard from "@/pages/Dashboard";
import Profile from "@/pages/Profile";
// import Settings from "@/pages/Settings";
import VideoPage from "@/pages/VideoPage";
import Footer from "@/components/Footer";
import Home from "@/pages/Home";
import SignIn from "@/pages/SignIn";
import SignUp from "@/pages/SignUp";
import About from "@/pages/About";
import Contact from "@/pages/Contact";
import ProtectedRoute from "@/components/ProtectedRoute";
import ReactGA from "react-ga4";

const App = () => {
  const location = useLocation();

  // Initialize Google Analytics only once
  useEffect(() => {
    try {
      ReactGA.initialize("G-9E91P66ZVJ");
    } catch (error) {
      console.error("Failed to initialize Google Analytics:", error);
    }
  }, []);

  // Track page views on route changes
  useEffect(() => {
    try {
      ReactGA.send({
        hitType: "pageview",
        page: location.pathname + location.search,
        title: document.title,
      });
    } catch (error) {
      console.error("Failed to send pageview:", error);
    }
  }, [location]);

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <main className="flex-grow">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/signin" element={<SignIn />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          {/* <Route path="/settings" element={<Settings />} /> */}
          <Route path="/video/:id" element={<VideoPage />} />

          {/* Protected Routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />
        </Routes>
      </main>

      <Footer />
    </div>
  );
};

export default App;
