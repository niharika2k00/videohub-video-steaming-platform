import { Routes, Route, useLocation } from "react-router-dom";
import { useEffect, lazy, Suspense } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ProtectedRoute from "@/components/ProtectedRoute";
import ReactGA from "react-ga4";

// ─── Lazy loaded pages ───
// Split into separate chunks — loaded on-demand only when the route is visited
const Home = lazy(() => import("@/pages/Home"));
const SignIn = lazy(() => import("@/pages/SignIn"));
const SignUp = lazy(() => import("@/pages/SignUp"));
const About = lazy(() => import("@/pages/About"));
const Contact = lazy(() => import("@/pages/Contact"));
const VideoPage = lazy(() => import("@/pages/VideoPage"));
const Dashboard = lazy(() => import("@/pages/Dashboard"));
const Profile = lazy(() => import("@/pages/Profile"));

// Loader as fallback displayed - while a lazy chunk is being downloaded
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500" />
  </div>
);

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
        {/* Suspense boundary — shows PageLoader while any lazy chunk loads */}
        <Suspense fallback={<PageLoader />}>
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
        </Suspense>
      </main>

      <Footer />
    </div>
  );
};

export default App;
