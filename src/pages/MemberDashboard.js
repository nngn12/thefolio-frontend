import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { getTheme } from "../theme";
import API from "../api/axios";

const MemberDashboard = () => {
    const { user } = useAuth();
    const { isDark } = useTheme();
    const t = getTheme(isDark);
    const navigate = useNavigate();

    const [activeTab, setActiveTab] = useState("posts"); // 'posts' or 'messages'
    const [myPosts, setMyPosts] = useState([]);
    const [myMessages, setMyMessages] = useState([]);
    const [loading, setLoading] = useState(true);

    const BACKEND_URL = "https://thefolio-backend.onrender.com";

    useEffect(() => {
        // Fetch both posts and messages at the same time
        Promise.all([
            API.get("/posts/my-posts").catch(() => ({ data: [] })),
            API.get("/messages/my-messages").catch(() => ({ data: [] })) // Adjust endpoint if needed
        ])
            .then(([postsRes, messagesRes]) => {
                setMyPosts(postsRes.data);
                setMyMessages(messagesRes.data);
            })
            .finally(() => setLoading(false));
    }, []);

    const deletePost = async (id) => {
        if (!window.confirm("Are you sure you want to delete this memory?")) return;
        try {
            await API.delete(`/posts/${id}`);
            setMyPosts(myPosts.filter(p => p.id !== id));
        } catch (err) {
            alert("Delete failed");
        }
    };

    const deleteMessage = async (id) => {
        if (!window.confirm("Delete this message?")) return;
        try {
            await API.delete(`/messages/${id}`); // Adjust endpoint if needed
            setMyMessages(myMessages.filter(m => m.id !== id));
        } catch (err) {
            alert("Delete failed");
        }
    };

    // UI Helpers
    const tabStyle = (isActive) => ({
        padding: "10px 24px",
        cursor: "pointer",
        fontWeight: "600",
        fontSize: "15px",
        borderBottom: isActive ? `3px solid ${t.pink}` : "3px solid transparent",
        color: isActive ? t.pink : t.textMuted,
        transition: "all 0.2s ease",
        background: "none",
        borderTop: "none", borderLeft: "none", borderRight: "none",
    });

    if (loading) return (
        <div style={{ background: t.bg, minHeight: "100vh", display: "flex", justifyContent: "center", alignItems: "center" }}>
            <div style={{ width: "32px", height: "32px", borderRadius: "50%", border: `1px solid ${t.border}`, borderTop: `1px solid ${t.pink}`, animation: "spin 1.2s linear infinite" }} />
            <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
        </div>
    );

    return (
        <div style={{ background: t.bg, minHeight: "100vh", color: t.text, fontFamily: t.fontSans, padding: "40px 20px" }}>
            <div style={{ maxWidth: "900px", margin: "0 auto", animation: "fadeUp 0.4s ease both" }}>

                {/* Header */}
                <header style={{ marginBottom: "32px", display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
                    <div>
                        <h1 style={{ fontFamily: t.fontSerif, fontSize: "36px", fontStyle: "italic", marginBottom: "8px" }}>
                            Welcome, {user?.name?.split(" ")[0]}
                        </h1>
                        <p style={{ color: t.textMuted, fontSize: "15px" }}>Manage your captured memories and inbox.</p>
                    </div>
                    <button
                        onClick={() => navigate("/create")}
                        style={{ padding: "10px 24px", borderRadius: "20px", border: "none", background: t.pinkGrad, color: "white", fontWeight: "600", cursor: "pointer", boxShadow: "0 4px 14px rgba(236,72,153,0.25)" }}
                    >
                        + New Post
                    </button>
                </header>

                {/* Navigation Tabs */}
                <div style={{ display: "flex", gap: "10px", borderBottom: `1px solid ${t.border}`, marginBottom: "32px" }}>
                    <button style={tabStyle(activeTab === "posts")} onClick={() => setActiveTab("posts")}>
                        My Memories ({myPosts.length})
                    </button>
                    <button style={tabStyle(activeTab === "messages")} onClick={() => setActiveTab("messages")}>
                        Messages ({myMessages.length})
                    </button>
                </div>

                {/* Tab Content: POSTS */}
                {activeTab === "posts" && (
                    <div style={{ display: "grid", gap: "16px", animation: "fadeUp 0.3s ease both" }}>
                        {myPosts.length === 0 ? (
                            <div style={{ textAlign: "center", padding: "60px", border: `1px dashed ${t.border}`, borderRadius: "12px" }}>
                                <p style={{ color: t.textMuted }}>You haven't posted any memories yet.</p>
                            </div>
                        ) : (
                            myPosts.map(post => (
                                <div key={post.id} style={{
                                    display: "flex", justifyContent: "space-between", alignItems: "center",
                                    padding: "20px", borderRadius: "12px", border: `1px solid ${t.border}`,
                                    background: isDark ? "rgba(255,255,255,0.02)" : "white"
                                }}>
                                    <div style={{ display: "flex", gap: "16px", alignItems: "center" }}>
                                        {post.image && (
                                            <img src={post.image.split(',')[0]} alt="" style={{ width: "64px", height: "64px", borderRadius: "8px", objectFit: "cover" }} />
                                        )}
                                        <div>
                                            <h3 style={{ fontSize: "17px", fontWeight: "600", marginBottom: "6px" }}>{post.title}</h3>
                                            <p style={{ fontSize: "13px", color: t.textMuted }}>
                                                {new Date(post.created_at).toLocaleDateString()}
                                            </p>
                                        </div>
                                    </div>
                                    <div style={{ display: "flex", gap: "12px" }}>
                                        <button onClick={() => navigate(`/post/${post.id}`)} style={{ background: "none", border: "none", color: t.pink, cursor: "pointer", fontSize: "14px", fontWeight: "500" }}>View</button>
                                        <button onClick={() => navigate(`/edit/${post.id}`)} style={{ background: "none", border: "none", color: t.textSub, cursor: "pointer", fontSize: "14px", fontWeight: "500" }}>Edit</button>
                                        <button onClick={() => deletePost(post.id)} style={{ background: "none", border: "none", color: "#ef4444", cursor: "pointer", fontSize: "14px", fontWeight: "500" }}>Delete</button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                )}

                {/* Tab Content: MESSAGES */}
                {activeTab === "messages" && (
                    <div style={{ display: "grid", gap: "16px", animation: "fadeUp 0.3s ease both" }}>
                        {myMessages.length === 0 ? (
                            <div style={{ textAlign: "center", padding: "60px", border: `1px dashed ${t.border}`, borderRadius: "12px" }}>
                                <p style={{ color: t.textMuted }}>Your inbox is empty.</p>
                            </div>
                        ) : (
                            myMessages.map(msg => (
                                <div key={msg.id} style={{
                                    padding: "20px", borderRadius: "12px", border: `1px solid ${t.border}`,
                                    background: isDark ? "rgba(255,255,255,0.02)" : "white",
                                    display: "flex", flexDirection: "column", gap: "12px"
                                }}>
                                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                                        <div>
                                            <h4 style={{ fontSize: "15px", fontWeight: "600", color: t.text }}>From: {msg.sender_name || "Anonymous"}</h4>
                                            <span style={{ fontSize: "12px", color: t.textMuted }}>
                                                {new Date(msg.created_at).toLocaleString()}
                                            </span>
                                        </div>
                                        <button onClick={() => deleteMessage(msg.id)} style={{ background: "none", border: "none", color: "#ef4444", cursor: "pointer", fontSize: "18px", lineHeight: 1 }}>×</button>
                                    </div>
                                    <p style={{ fontSize: "15px", color: t.textSub, lineHeight: "1.6", whiteSpace: "pre-wrap" }}>
                                        {msg.body || msg.message} {/* Adjust depending on your DB column name */}
                                    </p>
                                </div>
                            ))
                        )}
                    </div>
                )}

            </div>
            <style>{`@keyframes fadeUp { from { opacity:0; transform:translateY(14px); } to { opacity:1; transform:translateY(0); } }`}</style>
        </div>
    );
};

export default MemberDashboard;