import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";

import Navbar from "./components/Navbar";
import SplashPage from "./pages/SplashPage";
import HomePage from "./pages/HomePage";
import ContactPage from "./pages/ContactPage";
import RegisterPage from "./pages/RegisterPage";
import LoginPage from "./pages/LoginPage";
import ProfilePage from "./pages/ProfilePage";
import AboutPage from "./pages/AboutPage";
import CreatePostPage from "./pages/CreatePostPage";
import EditPostPage from "./pages/EditPostPage";
import PostPage from "./pages/PostPage";
import AdminPage from "./pages/AdminPage";
import UserDashboard from "./pages/UserDashboard";
import VerifyPage from "./pages/VerifyPage"; // New: OTP Input Page

function App() {
    const { user, authLoading } = useAuth();

    if (authLoading) return <div className="loading-spinner">Loading...</div>;

    return (
        <Router>
            <Navbar />
            <Routes>
                <Route path="/" element={<SplashPage />} />
                <Route path="/home" element={<HomePage />} />
                <Route path="/verify" element={<VerifyPage />} />

                {/* Dashboard: Must be logged in AND verified */}
                <Route path="/dashboard" element={
                    user ? (user.is_verified ? <UserDashboard /> : <Navigate to="/verify" />) : <Navigate to="/login" />
                } />

                <Route path="/login" element={user ? <Navigate to="/home" /> : <LoginPage />} />
                <Route path="/register" element={user ? <Navigate to="/verify" /> : <RegisterPage />} />
                <Route path="/post/:id" element={<PostPage />} />
                <Route path="/profile" element={user ? <ProfilePage /> : <Navigate to="/login" />} />
                <Route path="/create" element={user ? <CreatePostPage /> : <Navigate to="/login" />} />
                <Route path="/edit/:id" element={user ? <EditPostPage /> : <Navigate to="/login" />} />
                <Route path="/admin" element={user?.role === "admin" ? <AdminPage /> : <Navigate to="/home" />} />
            </Routes>
        </Router>
    );
}
export default App;