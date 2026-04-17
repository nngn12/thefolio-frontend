import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { getTheme } from "../theme";
import API from "../api/axios";

const UserDashboard = () => {
    const { user } = useAuth();
    const { isDark } = useTheme();
    const t = getTheme(isDark);
    const navigate = useNavigate();

    const [activeTab, setActiveTab] = useState("posts");
    const [myPosts, setMyPosts] = useState([]);
    const [myMessages, setMyMessages] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                // Ensure your backend has these endpoints ready
                const [postsRes, messagesRes] = await Promise.all([
                    API.get("/posts/my-posts"),
                    API.get("/messages/my-messages")
                ]);
                setMyPosts(postsRes.data || []);
                setMyMessages(messagesRes.data || []);
            } catch (err) {
                console.error("Dashboard data fetch failed:", err);
            } finally {
                setLoading(false);
            }
        };

        if (user) fetchDashboardData();
    }, [user]);

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
            await API.delete(`/messages/${id}`);
            setMyMessages(myMessages.filter(m => m.id !== id));
        } catch (err) {
            alert("Delete failed");
        }
    };

    // Styling logic for the Tabs
    const tabStyle = (isActive) => ({
        padding: "12px 24px",
        cursor: "pointer",
        fontWeight: "600",
        fontSize: "15px",
        border: "none",
        background: "none",
        borderBottom: isActive ? `3px solid ${t.pink}` : "3px solid transparent",
        color: isActive ? t.pink : t.textMuted,
        transition: "all 0.3s ease",
        outline: "none"
    });

    if (loading) return (
        <div style={{ background: t.bg, minHeight: "100vh", display: "flex", justifyContent: "center", alignItems: "center" }}>
            <div className="loader" />
            <style>{`.loader { width: 40px; height: 40px; border: 3px solid ${t.border}; border-top: 3px solid ${t.pink}; border-radius: 50%; animation: spin 1s linear infinite; } @keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
    );

    return (
        <div style={{ background: t.bg, minHeight: "100vh", color: t.text, fontFamily: t.fontSans, padding: "60px 20px" }}>
            <div style={{ maxWidth: "1000px", margin: "0 auto" }}>

                {/* Dashboard Header */}
                <header style={{ marginBottom: "40px" }}>
                    <span style={{ color: t.pink, letterSpacing: "2px", fontSize: "12px", fontWeight: "800", textTransform: "uppercase" }}>
                        User
                    </span>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "8px" }}>
                        <h1 style={{ fontFamily: t.fontSerif, fontSize: "42px", fontWeight: "400" }}>Dashboard</h1>
                        <button
                            onClick={() => navigate("/upload")}
                            style={{ padding: "12px 24px", borderRadius: "30px", border: "none", background: t.pinkGrad, color: "#fff", fontWeight: "600", cursor: "pointer", boxShadow: "0 10px 20px -5px rgba(214, 51, 132, 0.3)" }}
                        >
                            + Share Memory
                        </button>
                    </div>
                </header>

                {/* Tab Navigation */}
                <div style={{ display: "flex", gap: "20px", borderBottom: `1px solid ${t.border}`, marginBottom: "32px" }}>
                    <button style={tabStyle(activeTab === "posts")} onClick={() => setActiveTab("posts")}>
                        My Posts ({myPosts.length})
                    </button>
                    <button style={tabStyle(activeTab === "messages")} onClick={() => setActiveTab("messages")}>
                        Inbox ({myMessages.length})
                    </button>
                </div>

                {/* Main Content Area */}
                <div style={{ animation: "fadeIn 0.5s ease" }}>
                    {activeTab === "posts" ? (
                        <section>
                            {myPosts.length === 0 ? (
                                <div style={{ textAlign: "center", padding: "100px", border: `2px dashed ${t.border}`, borderRadius: "20px" }}>
                                    <p style={{ color: t.textMuted, fontSize: "18px" }}>No memories found. Time to capture some! 📸</p>
                                </div>
                            ) : (
                                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "20px" }}>
                                    {myPosts.map(post => (
                                        <div key={post.id} style={{ background: isDark ? "#222" : "#fff", borderRadius: "15px", overflow: "hidden", border: `1px solid ${t.border}` }}>
                                            {post.image_url && (
                                                <img src={post.image_url} alt={post.title} style={{ width: "100%", height: "200px", objectFit: "cover" }} />
                                            )}
                                            <div style={{ padding: "20px" }}>
                                                <h3 style={{ marginBottom: "10px" }}>{post.title}</h3>
                                                <div style={{ display: "flex", gap: "10px" }}>
                                                    <button onClick={() => navigate(`/post/${post.id}`)} style={{ flex: 1, padding: "8px", borderRadius: "8px", border: `1px solid ${t.border}`, background: "none", cursor: "pointer" }}>View</button>
                                                    <button onClick={() => deletePost(post.id)} style={{ padding: "8px", borderRadius: "8px", border: "none", background: "#fee2e2", color: "#ef4444", cursor: "pointer" }}>Delete</button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </section>
                    ) : (
                        <section>
                            {myMessages.length === 0 ? (
                                <div style={{ textAlign: "center", padding: "100px", border: `2px dashed ${t.border}`, borderRadius: "20px" }}>
                                    <p style={{ color: t.textMuted, fontSize: "18px" }}>No messages found 📩</p>
                                </div>
                            ) : (
                                <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
                                    {myMessages.map(msg => (
                                        <div key={msg.id} style={{ padding: "20px", background: isDark ? "#222" : "#fff", borderRadius: "12px", border: `1px solid ${t.border}`, display: "flex", justifyContent: "space-between" }}>
                                            <div>
                                                <p style={{ fontWeight: "700", marginBottom: "5px" }}>{msg.name} <span style={{ fontWeight: "400", color: t.textMuted, fontSize: "12px" }}>({msg.email})</span></p>
                                                <p style={{ color: t.textSub }}>{msg.message}</p>
                                            </div>
                                            <button onClick={() => deleteMessage(msg.id)} style={{ background: "none", border: "none", color: "#ef4444", cursor: "pointer", fontSize: "20px" }}>&times;</button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </section>
                    )}
                </div>
            </div>
            <style>{`@keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }`}</style>
        </div>
    );
};

export default UserDashboard;