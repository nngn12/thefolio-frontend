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
                const [pRes, mRes] = await Promise.all([
                    API.get("/posts/user/me"),
                    API.get("/messages/inbox")
                ]);
                
                // DEBUG: Look at your browser console (F12) to see this!
                console.log("Dashboard Posts Response:", pRes.data);

                // Safe extraction for different DB formats
                const postData = Array.isArray(pRes.data) ? pRes.data : (pRes.data.posts || []);
                setPosts(postData);
                setMessages(mRes.data || []);
            } catch (err) {
                console.error("Dashboard Fetch Error:", err);
            } finally {
                setLoading(false);
            }
        };
        loadDashboard();
    }, []);

    if (loading) return <div style={{ color: t.text, padding: "40px", textAlign: "center" }}>Loading...</div>;

    return (
        <div style={{ background: t.bg, minHeight: "100vh", padding: "40px 20px" }}>
            <div style={{ maxWidth: "1000px", margin: "0 auto" }}>
                <h1 style={{ fontFamily: t.fontSerif, color: t.text }}>Dashboard</h1>

                <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: "24px", marginTop: "32px" }}>
                    <div style={{ background: t.card, padding: "24px", borderRadius: "16px", border: `1px solid ${t.border}` }}>
                        <h3 style={{ color: t.pink, marginBottom: "20px" }}>Your Captured Memories</h3>
                        
                        {posts.length === 0 ? (
                            <div style={{ textAlign: "center", padding: "20px" }}>
                                <p style={{ color: t.textMuted }}>No posts found for your account.</p>
                                <p style={{ fontSize: "12px", color: t.pink }}>Tip: Check if your backend query uses 'author_id' or 'userId'</p>
                            </div>
                        ) : (
                            posts.map(p => (
                                <div key={p.id || p._id} style={{ borderBottom: `1px solid ${t.border}`, padding: "12px 0" }}>
                                    <h4 style={{ color: t.text }}>{p.title}</h4>
                                    <span style={{ fontSize: "12px", color: t.textMuted }}>
                                        {new Date(p.created_at || p.createdAt).toLocaleDateString()}
                                    </span>
                                </div>
                            ))
                        )}
                    </div>
                    {/* Messages section remains the same... */}
                </div>
            </div>
        </div>
    );
};

export default UserDashboard;
