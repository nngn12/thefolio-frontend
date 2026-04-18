import React, { useEffect, useState } from "react";
import API from "../api/axios";
import { useTheme } from "../context/ThemeContext";
import { getTheme } from "../theme";

const UserDashboard = () => {
    const { isDark } = useTheme();
    const t = getTheme(isDark);
    const [posts, setPosts] = useState([]);
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadDashboard = async () => {
            try {
                // Fetching user-specific posts and inbox messages
                const [pRes, mRes] = await Promise.all([
                    API.get("/posts/user/me"),
                    API.get("/messages/inbox")
                ]);
                
                // FIX: Ensure we are extracting the array correctly even if the backend wraps it
                const postData = Array.isArray(pRes.data) ? pRes.data : (pRes.data.posts || []);
                const messageData = Array.isArray(mRes.data) ? mRes.data : (mRes.data.messages || []);
                
                setPosts(postData);
                setMessages(messageData);
            } catch (err) {
                console.error("Failed to fetch dashboard data:", err);
            } finally {
                setLoading(false);
            }
        };
        loadDashboard();
    }, []);

    const sectionStyle = { 
        background: t.card, 
        padding: "24px", 
        borderRadius: "16px", 
        border: `1px solid ${t.border}`,
        minHeight: "200px"
    };

    if (loading) {
        return (
            <div style={{ background: t.bg, minHeight: "100vh", display: "flex", justifyContent: "center", alignItems: "center", color: t.text }}>
                <p>Loading your profile data...</p>
            </div>
        );
    }

    return (
        <div style={{ background: t.bg, minHeight: "100vh", padding: "40px 20px" }}>
            <div style={{ maxWidth: "1000px", margin: "0 auto" }}>
                <h1 style={{ fontFamily: t.fontSerif, fontStyle: "italic", color: t.text, marginBottom: "32px" }}>Dashboard</h1>

                <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: "24px" }}>
                    
                    {/* My Posts Section */}
                    <div style={sectionStyle}>
                        <h3 style={{ color: t.pink, marginBottom: "20px" }}>Your Captured Memories</h3>
                        {posts.length === 0 ? (
                            <p style={{ color: t.textMuted }}>You haven't posted any memories yet.</p>
                        ) : (
                            posts.map((p) => {
                                // FIX: Handle both MongoDB (_id) and PostgreSQL (id) naming
                                const postId = p.id || p._id;
                                const postDate = p.created_at || p.createdAt;

                                return (
                                    <div key={postId} style={{ borderBottom: `1px solid ${t.border}`, padding: "16px 0" }}>
                                        <h4 style={{ color: t.text, margin: "0 0 4px 0" }}>{p.title}</h4>
                                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                            <span style={{ fontSize: "12px", color: t.textMuted }}>
                                                {postDate ? new Date(postDate).toLocaleDateString() : "No date"}
                                            </span>
                                            <span style={{ fontSize: "11px", color: t.pink, textTransform: "uppercase", letterSpacing: "1px" }}>
                                                {p.status || "Published"}
                                            </span>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>

                    {/* Admin Messages Section */}
                    <div style={sectionStyle}>
                        <h3 style={{ color: t.pink, marginBottom: "20px" }}>Admin Correspondence</h3>
                        {messages.length === 0 ? (
                            <p style={{ color: t.textMuted }}>No messages from admin yet.</p>
                        ) : (
                            messages.map((m) => (
                                <div key={m.id || m._id} style={{ background: t.bg, padding: "12px", borderRadius: "8px", marginBottom: "12px", border: `1px solid ${t.border}` }}>
                                    <p style={{ fontWeight: "600", fontSize: "13px", color: t.text, marginBottom: "4px" }}>Re: Inquiry</p>
                                    <p style={{ fontSize: "14px", color: t.textSub, margin: 0 }}>{m.admin_reply}</p>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserDashboard;
