import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { getTheme } from "../theme";
import API from "../api/axios";

const AdminPage = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const { isDark } = useTheme();
    const t = getTheme(isDark);

    const [members, setMembers] = useState([]);
    const [posts, setPosts] = useState([]);
    const [messages, setMessages] = useState([]);
    const [stats, setStats] = useState({ members: 0, active: 0, posts: 0, unreadMsgs: 0 });
    const [tab, setTab] = useState("members");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user || user.role !== "admin") {
            navigate("/home");
            return;
        }

        const fetchDashboardData = async () => {
            setLoading(true);
            try {
                // 1. Fetch Totals for Cards
                const statsRes = await API.get("/auth/admin/stats");
                setStats(statsRes.data);

                // 2. Fetch Lists for Tables (Using consolidated auth routes)
                const [mRes, pRes, msgRes] = await Promise.all([
                    API.get("/auth/admin/users"),
                    API.get("/auth/admin/posts"),
                    API.get("/auth/admin/messages").catch(() => ({ data: [] }))
                ]);

                setMembers(mRes.data || []);
                setPosts(pRes.data || []);
                setMessages(msgRes.data || []);

            } catch (err) {
                console.error("Dashboard Fetch Error:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, [user, navigate]);

    // --- ACTIONS ---
    const toggleStatus = async (id) => {
        try {
            const r = await API.put(`/admin/users/${id}/status`);
            const updatedUser = r.data.user;
            setMembers((prev) => prev.map((m) => (m.id === id ? updatedUser : m)));
            // Refresh stats to update "Active" count
            const statsRes = await API.get("/auth/admin/stats");
            setStats(statsRes.data);
        } catch (err) { alert("Failed to update status"); }
    };

    const deleteUser = async (id) => {
        if (!window.confirm("Delete this user?")) return;
        try {
            await API.delete(`/admin/users/${id}`);
            setMembers((prev) => prev.filter((m) => m.id !== id));
            setStats(prev => ({ ...prev, members: prev.members - 1 }));
        } catch (e) { alert("Delete failed"); }
    };

    const deletePost = async (id) => {
        if (!window.confirm("Delete this post?")) return;
        try {
            await API.delete(`/posts/${id}`);
            setPosts((prev) => prev.filter((p) => p.id !== id));
            setStats(prev => ({ ...prev, posts: prev.posts - 1 }));
        } catch (e) { alert("Delete failed"); }
    };

    const deleteMsg = async (id) => {
        if (!window.confirm("Delete this message?")) return;
        try {
            await API.delete(`/admin/messages/${id}`);
            setMessages((prev) => prev.filter((m) => m.id !== id));
            setStats(prev => ({ ...prev, unreadMsgs: Math.max(0, prev.unreadMsgs - 1) }));
        } catch (e) { alert("Delete failed"); }
    };

    // --- STYLES ---
    const btnStyle = (variant) => ({
        padding: "6px 14px", borderRadius: "8px",
        border: variant === 'primary' ? 'none' : `1px solid ${t.border}`,
        background: variant === 'primary' ? t.pink : 'transparent',
        color: variant === 'primary' ? 'white' : t.text,
        fontSize: "12px", cursor: "pointer", fontFamily: t.fontSans
    });

    const tabStyle = (key) => ({
        padding: "8px 0", marginRight: "28px", background: "none", border: "none",
        borderBottom: tab === key ? `2px solid ${t.pink}` : "2px solid transparent",
        color: tab === key ? t.pink : t.textMuted,
        fontFamily: t.fontSans, fontSize: "13px", fontWeight: "500", cursor: "pointer"
    });

    if (loading) return <div style={{ background: t.bg, minHeight: "100vh" }} />;

    return (
        <div style={{ fontFamily: t.fontSans, background: t.bg, minHeight: "100vh", paddingBottom: "80px" }}>
            <div style={{ maxWidth: "820px", margin: "0 auto", padding: "48px 24px 0" }}>
                <p style={{ fontSize: "11px", letterSpacing: "0.18em", textTransform: "uppercase", color: t.pink, fontWeight: "500", marginBottom: "12px" }}>Admin</p>
                <h1 style={{ fontFamily: t.fontSerif, fontStyle: "italic", fontSize: "40px", fontWeight: "400", color: t.text, marginBottom: "36px" }}>Dashboard</h1>

                {/* Stats Grid - NOW USING THE STATS STATE */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: "16px", marginBottom: "48px" }}>
                    {[
                        { label: "Members", val: stats.members, color: t.pink },
                        { label: "Active", val: stats.active, color: t.success },
                        { label: "Posts", val: stats.posts, color: "#60a5fa" },
                        { label: "Unread msgs", val: stats.unreadMsgs, color: "#a78bfa" },
                    ].map((s) => (
                        <div key={s.label} style={{ padding: "20px 22px", borderRadius: "10px", background: t.card, border: `1px solid ${t.border}`, boxShadow: t.shadowSm }}>
                            <div style={{ fontFamily: t.fontSerif, fontSize: "32px", fontWeight: "400", color: s.color }}>{s.val}</div>
                            <div style={{ fontSize: "12px", color: t.textMuted }}>{s.label}</div>
                        </div>
                    ))}
                </div>

                {/* Tabs */}
                <div style={{ borderBottom: `1px solid ${t.border}`, marginBottom: "32px" }}>
                    <button style={tabStyle("members")} onClick={() => setTab("members")}>Members</button>
                    <button style={tabStyle("posts")} onClick={() => setTab("posts")}>Posts</button>
                    <button style={tabStyle("messages")} onClick={() => setTab("messages")}>Messages</button>
                </div>

                {/* Tab Content (Members/Posts/Messages lists go here - same as your original code) */}
                {tab === "members" && (
                    members.length > 0 ? members.map(u => (
                        <div key={u.id} style={{ borderBottom: `1px solid ${t.border}`, padding: "24px 0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <div>
                                <p style={{ margin: 0, fontWeight: "500", color: t.text }}>{u.name}</p>
                                <p style={{ margin: 0, fontSize: '12px', color: t.textMuted }}>{u.email}</p>
                            </div>
                            <div style={{ display: 'flex', gap: '8px' }}>
                                <button onClick={() => toggleStatus(u.id)} style={btnStyle('secondary')}>{u.status === "active" ? "Deactivate" : "Activate"}</button>
                                <button onClick={() => deleteUser(u.id)} style={btnStyle('secondary')}>Remove</button>
                            </div>
                        </div>
                    )) : <div style={{ textAlign: 'center', padding: '40px', color: t.textMuted }}>No members found 👥</div>
                )}

                {/* ... (Repeat similar logic for Posts and Messages) ... */}
                
            </div>
        </div>
    );
};

export default AdminPage;
