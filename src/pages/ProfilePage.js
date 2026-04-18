import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { getTheme } from "../theme";
import API from "../api/axios";

const ProfilePage = () => {
    const navigate = useNavigate();
    const { user, updateUser } = useAuth();
    const { isDark } = useTheme();
    const t = getTheme(isDark);

    const [name, setName] = useState("");
    const [bio, setBio] = useState("");
    const [profilePic, setProfilePic] = useState(null);
    const [picPreview, setPicPreview] = useState(null);
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [myPosts, setMyPosts] = useState([]);
    const [msg, setMsg] = useState("");
    const [err, setErr] = useState("");
    const [pwMsg, setPwMsg] = useState("");
    const [pwErr, setPwErr] = useState("");

    const BASE_URL = process.env.REACT_APP_API_URL
        ? process.env.REACT_APP_API_URL.replace("/api", "")
        : "http://localhost:5000";

    // -------------------------
    // INIT USER
    // -------------------------
    useEffect(() => {
        if (!user) {
            navigate("/login");
            return;
        }
        setName(user.name || "");
        setBio(user.bio || "");
    }, [user, navigate]);

    // -------------------------
    // FETCH MY POSTS (FIXED)
    // -------------------------
    useEffect(() => {
        if (!user) return;

        API.get("/posts/mine")
            .then(res => setMyPosts(res.data || []))
            .catch(err => {
                console.log("Posts error:", err.response?.data || err.message);
                setMyPosts([]);
            });
    }, [user]);

    // -------------------------
    // PROFILE UPDATE
    // -------------------------
    const handleProfileSave = async (e) => {
        e.preventDefault();
        setMsg("");
        setErr("");

        try {
            const fd = new FormData();
            fd.append("name", name);
            fd.append("bio", bio);
            if (profilePic) fd.append("profilePic", profilePic);

            const res = await API.put("/auth/profile", fd, {
                headers: { "Content-Type": "multipart/form-data" }
            });

            updateUser(res.data);
            setMsg("Profile updated successfully!");
            setProfilePic(null);
        } catch (e) {
            setErr(e.response?.data?.message || "Update failed");
        }
    };

    // -------------------------
    // PASSWORD CHANGE
    // -------------------------
    const handlePasswordChange = async (e) => {
        e.preventDefault();
        setPwMsg("");
        setPwErr("");

        try {
            await API.put("/auth/change-password", {
                currentPassword,
                newPassword
            });

            setPwMsg("Password updated!");
            setCurrentPassword("");
            setNewPassword("");
        } catch (e) {
            setPwErr(e.response?.data?.message || "Failed");
        }
    };

    // -------------------------
    // IMAGE FIX
    // -------------------------
    const picSrc =
        picPreview ||
        (user?.profile_pic
            ? `${BASE_URL}/uploads/${user.profile_pic}`
            : `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || "User")}&background=081730&color=fff&size=128`
        );

    return (
        <div style={{ fontFamily: "'Segoe UI', sans-serif", background: t.bg, minHeight: "100vh", paddingBottom: "40px" }}>
            <div style={{ maxWidth: "650px", margin: "0 auto", padding: "30px 20px" }}>

                {/* Profile Section */}
                <div style={{
                    background: t.card,
                    backdropFilter: "blur(10px)",
                    borderRadius: "20px",
                    padding: "28px",
                    boxShadow: t.shadow,
                    marginBottom: "20px"
                }}>
                    <div style={{ textAlign: "center", marginBottom: "20px" }}>
                        <img
                            src={picSrc}
                            alt="Profile"
                            style={{
                                width: "90px",
                                height: "90px",
                                borderRadius: "50%",
                                objectFit: "cover",
                                border: "3px solid #ec4899",
                                marginBottom: "12px"
                            }}
                        />

                        <h3 style={{ margin: "4px 0", color: t.text }}>{user?.name}</h3>
                        <span style={{ fontSize: "13px", color: t.textMuted, textTransform: "capitalize" }}>
                            {user?.role}
                        </span>
                    </div>

                    <h4 style={{ fontSize: "18px", color: t.text, marginBottom: "16px" }}>Edit Profile</h4>

                    {msg && <div style={{ color: "#10b981", fontSize: "13px", marginBottom: "10px" }}>{msg}</div>}
                    {err && <div style={{ color: "#ef4444", fontSize: "13px", marginBottom: "10px" }}>{err}</div>}

                    <form onSubmit={handleProfileSave}>
                        <input value={name} onChange={e => setName(e.target.value)} placeholder="Name" />
                        <textarea value={bio} onChange={e => setBio(e.target.value)} placeholder="Bio" />

                        <input
                            type="file"
                            accept="image/*"
                            onChange={e => {
                                const file = e.target.files[0];
                                if (file) {
                                    setProfilePic(file);
                                    setPicPreview(URL.createObjectURL(file));
                                }
                            }}
                        />

                        <button type="submit">Save Changes</button>
                    </form>
                </div>

                {/* Password */}
                <div style={{
                    background: t.card,
                    borderRadius: "20px",
                    padding: "28px",
                    boxShadow: t.shadow
                }}>
                    <h4 style={{ color: t.text }}>🔒 Change Password</h4>

                    {pwMsg && <div style={{ color: "#10b981" }}>{pwMsg}</div>}
                    {pwErr && <div style={{ color: "#ef4444" }}>{pwErr}</div>}

                    <form onSubmit={handlePasswordChange}>
                        <input
                            type="password"
                            placeholder="Current password"
                            value={currentPassword}
                            onChange={e => setCurrentPassword(e.target.value)}
                        />

                        <input
                            type="password"
                            placeholder="New password"
                            value={newPassword}
                            onChange={e => setNewPassword(e.target.value)}
                        />

                        <button type="submit">Update Password</button>
                    </form>
                </div>

                {/* Posts */}
                <div style={{
                    background: t.card,
                    borderRadius: "20px",
                    padding: "28px",
                    boxShadow: t.shadow,
                    marginTop: "20px"
                }}>
                    <h4 style={{ color: t.text }}>📸 My Posts ({myPosts.length})</h4>

                    {myPosts.length === 0 && (
                        <p style={{ color: t.textMuted }}>No posts yet.</p>
                    )}

                    {myPosts.map(p => (
                        <div key={p._id || p.id}>
                            <span>{p.title}</span>
                        </div>
                    ))}
                </div>

            </div>
        </div>
    );
};

export default ProfilePage;
