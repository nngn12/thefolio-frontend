import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { getTheme } from "../theme";
import API from "../api/axios";

const ProfilePage = () => {
    const navigate = useNavigate();
    const { user, updateUser, logout } = useAuth();
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

    // Fetch profile and my posts
    useEffect(() => {
        if (!user) { navigate("/login"); return; }
        setName(user.name || "");
        setBio(user.bio || "");
        API.get(`/posts/user/${user.id}`)
            .then(res => setMyPosts(res.data))
            .catch(() => setMyPosts([]));
    }, [user, navigate]);

    const handleProfileSave = async (e) => {
        e.preventDefault(); setMsg(""); setErr("");
        try {
            const fd = new FormData();
            fd.append("name", name);
            fd.append("bio", bio);
            if (profilePic) fd.append("profilePic", profilePic);

            const res = await API.put("/auth/profile", fd, { headers: { "Content-Type": "multipart/form-data" } });
            updateUser(res.data);
            setPicPreview(res.data.profile_pic ? `http://localhost:5000/uploads/${res.data.profile_pic}` : null);
            setProfilePic(null);
            setMsg("Profile updated! 🌸");
        } catch (e) {
            setErr(e.response?.data?.message || "Update failed");
        }
    };

    const handlePasswordChange = async (e) => {
        e.preventDefault(); setPwMsg(""); setPwErr("");
        try {
            await API.put("/auth/change-password", { currentPassword, newPassword });
            setPwMsg("Password changed successfully!");
            setCurrentPassword("");
            setNewPassword("");
        } catch (e) {
            setPwErr(e.response?.data?.message || "Failed");
        }
    };

    const card = { background: t.card, backdropFilter: "blur(10px)", borderRadius: "20px", padding: "28px", boxShadow: t.shadow, marginBottom: "20px" };
    const inputStyle = { width: "100%", padding: "11px", borderRadius: "10px", border: `1px solid ${t.border}`, fontSize: "14px", background: t.input, color: t.text, boxSizing: "border-box", marginBottom: "14px", outline: "none" };
    const labelStyle = { display: "block", fontSize: "13px", color: t.text, fontWeight: "600", marginBottom: "4px" };
    const picSrc = picPreview || (user?.profile_pic ? `http://localhost:5000/uploads/${user.profile_pic}` : null);

    return (
        <div style={{ fontFamily: "'Segoe UI', sans-serif", background: t.bg, minHeight: "100vh", paddingBottom: "40px" }}>
            <div style={{ maxWidth: "650px", margin: "0 auto", padding: "30px 20px" }}>

                {/* Profile Section */}
                <div style={card}>
                    <div style={{ textAlign: "center", marginBottom: "20px" }}>
                        {picSrc
                            ? <img src={picSrc} alt="Profile" style={{ width: "90px", height: "90px", borderRadius: "50%", objectFit: "cover", border: "3px solid #ec4899", marginBottom: "12px" }} />
                            : <div style={{ width: "90px", height: "90px", borderRadius: "50%", background: t.pinkGrad, display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontSize: "32px", margin: "0 auto 12px" }}>{user?.name?.[0]?.toUpperCase()}</div>
                        }
                        <h3 style={{ margin: "4px 0", color: t.text }}>{user?.name}</h3>
                        <span style={{ fontSize: "13px", color: t.textMuted, textTransform: "capitalize" }}>{user?.role}</span>
                    </div>

                    <h4 style={{ fontSize: "18px", color: t.text, marginBottom: "16px" }}>Edit Profile</h4>
                    {msg && <div style={{ color: "#10b981", fontSize: "13px", marginBottom: "10px" }}>{msg}</div>}
                    {err && <div style={{ color: "#ef4444", fontSize: "13px", marginBottom: "10px" }}>{err}</div>}
                    <form onSubmit={handleProfileSave}>
                        <label style={labelStyle}>Name</label>
                        <input value={name} onChange={e => setName(e.target.value)} style={inputStyle} />

                        <label style={labelStyle}>Bio</label>
                        <textarea value={bio} onChange={e => setBio(e.target.value)} placeholder="Tell something about yourself..."
                            style={{ ...inputStyle, minHeight: "80px", resize: "vertical" }} />

                        <label style={labelStyle}>Profile Picture</label>
                        <input type="file" accept="image/*" onChange={e => { const f = e.target.files[0]; if (f) { setProfilePic(f); setPicPreview(URL.createObjectURL(f)); } }} style={{ marginBottom: "16px", color: t.textSub }} />

                        <div style={{ display: "flex", gap: "10px" }}>
                            <button type="submit" style={{ padding: "11px 28px", borderRadius: "10px", border: "none", background: t.pinkGrad, color: "white", fontWeight: "bold", cursor: "pointer" }}>Save Changes</button>
                        </div>
                    </form>
                </div>

                {/* Change Password Section */}
                <div style={card}>
                    <h4 style={{ fontSize: "18px", color: t.text, marginBottom: "16px" }}>🔒 Change Password</h4>
                    {pwMsg && <div style={{ color: "#10b981", fontSize: "13px", marginBottom: "10px" }}>{pwMsg}</div>}
                    {pwErr && <div style={{ color: "#ef4444", fontSize: "13px", marginBottom: "10px" }}>{pwErr}</div>}
                    <form onSubmit={handlePasswordChange}>
                        <label style={labelStyle}>Current Password</label>
                        <input type="password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} style={inputStyle} />
                        <label style={labelStyle}>New Password</label>
                        <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} style={inputStyle} />
                        <button type="submit" style={{ padding: "11px 28px", borderRadius: "10px", border: "none", background: t.pinkGrad, color: "white", fontWeight: "bold", cursor: "pointer" }}>Update Password</button>
                    </form>
                </div>

                {/* My Posts Section */}
                <div style={card}>
                    <h4 style={{ fontSize: "18px", color: t.text, marginBottom: "16px" }}>📸 My Posts ({myPosts.length})</h4>
                    {myPosts.length === 0 && <p style={{ color: t.textMuted, fontSize: "14px" }}>No posts yet.</p>}
                    {myPosts.map(p => (
                        <div key={p.id} style={{ background: t.cardAlt, borderRadius: "10px", padding: "10px 14px", marginBottom: "8px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <span style={{ fontSize: "14px", color: t.text, fontWeight: "600" }}>{p.title}</span>
                            <div style={{ display: "flex", gap: "8px" }}>
                                <button onClick={() => navigate(`/post/${p.id}`)} style={{ background: "none", border: "none", color: t.pink, cursor: "pointer", fontWeight: "bold", fontSize: "13px" }}>View →</button>
                                <button onClick={() => navigate(`/edit/${p.id}`)} style={{ background: "none", border: "none", color: "#4b5563", cursor: "pointer", fontWeight: "bold", fontSize: "13px" }}>Edit</button>
                            </div>
                        </div>
                    ))}
                </div>

            </div>
        </div>
    );
};

export default ProfilePage;