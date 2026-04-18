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
                // We assume standard Auth headers are handled by your axios instance
                const [pRes, mRes] = await Promise.all([
                    API.get("/posts/user/me"),
                    API.get("/messages/inbox") 
                ]);
                setPosts(pRes.data);
                setMessages(mRes.data);
            } catch (err) {
                console.error("Failed to fetch dashboard data");
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
        boxShadow: isDark ? "none" : "0 4px 12px rgba(0,0,0,0.05)"
    };

    if (loading) return <div style={{ color: t.text, textAlign: "center", padding: "50px" }}>Loading your dashboard...</div>;

    return (
        <div style={{ background: t.bg, minHeight: "100vh", padding: "40px 20px" }}>
            <div style={{ maxWidth: "1000px", margin: "0 auto" }}>
                <h1 style={{ fontFamily: t.fontSerif, fontStyle: "italic", color: t.text, marginBottom: "32px" }}>
                    Member Dashboard
                </h1>

                <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: "24px" }}>
                    {/* My Posts Section */}
                    <div style={sectionStyle}>
                        <h3 style={{ color: t.pink, marginBottom: "20px" }}>Your Captured Memories</h3>
                        {posts.length === 0 ? <p style={{ color: t.textMuted }}>No posts yet.</p> :
                            posts.map(p => (
                                <div key={p.id} style={{ borderBottom: `1px solid ${t.border}`, padding: "12px 0" }}>
                                    <h4 style={{ color: t.text, margin: "0 0 4px 0" }}>{p.title}</h4>
                                    <span style={{ fontSize: "12px", color: t.textMuted }}>
                                        {new Date(p.created_at || p.createdAt).toLocaleDateString()}
                                    </span>
                                </div>
                            ))
                        }
                    </div>

                    {/* Admin Messages Section */}
                    <div style={sectionStyle}>
                        <h3 style={{ color: t.pink, marginBottom: "20px" }}>Admin Correspondence</h3>
                        {messages.length === 0 ? <p style={{ color: t.textMuted }}>No messages.</p> :
                            messages.map(m => (
                                <div key={m.id} style={{ background: t.bg, padding: "12px", borderRadius: "8px", marginBottom: "12px", border: `1px solid ${t.border}` }}>
                                    <p style={{ fontWeight: "600", fontSize: "13px", color: t.text, marginBottom: "4px" }}>Re: Inquiry</p>
                                    <p style={{ fontSize: "14px", color: t.textSub, margin: 0 }}>{m.admin_reply}</p>
                                </div>
                            ))
                        }
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserDashboard;
