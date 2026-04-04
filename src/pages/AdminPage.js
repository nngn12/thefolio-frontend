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
    const [tab, setTab] = useState("members");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user || user.role !== "admin") {
            navigate("/home");
            return;
        }

        const fetchData = async () => {
            setLoading(true);
            try {
                const mRes = await API.get("/admin/users");
                setMembers(mRes.data || []);

                const pRes = await API.get("/admin/posts");
                setPosts(pRes.data || []);

                try {
                    const msgRes = await API.get("/admin/messages");
                    setMessages(msgRes.data || []);
                } catch (e) {
                    setMessages([]);
                }
            } catch (err) {
                console.error("Fetch error:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [user, navigate]);

    const toggleStatus = async (id) => {
        try {
            const r = await API.put(`/admin/users/${id}/status`);
            const updatedUser = r.data.user;
            setMembers((prev) =>
                prev.map((m) => (m.id === id ? updatedUser : m))
            );
        } catch (err) {
            alert("Failed to update status");
        }
    };

    const deleteUser = async (id) => {
        if (!window.confirm("Delete this user?")) return;
        try {
            await API.delete(`/admin/users/${id}`);
            setMembers((prev) => prev.filter((m) => m.id !== id));
        } catch (e) { alert("Delete failed"); }
    };

    const deletePost = async (id) => {
        if (!window.confirm("Delete this post?")) return;
        try {
            await API.delete(`/posts/${id}`);
            setPosts((prev) => prev.filter((p) => p.id !== id));
        } catch (e) { alert("Delete failed"); }
    };

    const deleteMsg = async (id) => {
        if (!window.confirm("Delete this message?")) return;
        await API.delete(`/admin/messages/${id}`);
        setMessages((prev) => prev.filter((m) => m.id !== id));
    };

    // --- SHARED STYLES ---
    const btnStyle = (variant) => ({
        padding: "6px 14px",
        borderRadius: "8px",
        border: variant === 'primary' ? 'none' : `1px solid ${t.border}`,
        background: variant === 'primary' ? t.pink : 'transparent',
        color: variant === 'primary' ? 'white' : t.text,
        fontSize: "12px",
        cursor: "pointer",
        fontFamily: t.fontSans,
        transition: "opacity 0.2s"
    });

    const emptyStateStyle = {
        padding: "40px 0",
        textAlign: "center",
        color: t.textMuted,
        fontSize: "14px",
        fontStyle: "italic",
        border: `1px dashed ${t.border}`,
        borderRadius: "12px",
        marginTop: "20px"
    };

    const tabStyle = (key) => ({
        padding: "8px 0",
        marginRight: "28px",
        background: "none",
        border: "none",
        borderBottom: tab === key ? `2px solid ${t.pink}` : "2px solid transparent",
        color: tab === key ? t.pink : t.textMuted,
        fontFamily: t.fontSans,
        fontSize: "13px",
        fontWeight: "500",
        letterSpacing: "0.05em",
        cursor: "pointer",
        transition: "all 0.2s",
    });

    const row = (isInactive) => ({
        borderBottom: `1px solid ${t.border}`,
        padding: "24px 0",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-start",
        gap: "20px",
        color: isInactive ? t.textMuted : t.text,
    });

    if (loading) return <div style={{ background: t.bg, minHeight: "100vh" }} />;

    return (
        <div style={{ fontFamily: t.fontSans, background: t.bg, minHeight: "100vh", paddingBottom: "80px" }}>
            <div style={{ maxWidth: "820px", margin: "0 auto", padding: "48px 24px 0" }}>
                <p style={{ fontSize: "11px", letterSpacing: "0.18em", textTransform: "uppercase", color: t.pink, fontWeight: "500", marginBottom: "12px" }}>Admin</p>
                <h1 style={{ fontFamily: t.fontSerif, fontStyle: "italic", fontSize: "40px", fontWeight: "400", color: t.text, marginBottom: "36px" }}>Dashboard</h1>

                {/* Stats Grid */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: "16px", marginBottom: "48px" }}>
                    {[
                        { label: "Members", val: members.length, color: t.pink },
                        { label: "Active", val: members.filter(m => m.status === "active").length, color: t.success },
                        { label: "Posts", val: posts.length, color: "#60a5fa" },
                        { label: "Unread msgs", val: messages.filter(m => !m.read).length, color: "#a78bfa" },
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

                {/* Tab Content */}
                {tab === "members" && (
                    members.length > 0 ? (
                        members.map(u => (
                            <div key={u.id} style={row(u.status !== "active")}>
                                <div>
                                    <p style={{ margin: 0, fontWeight: "500" }}>{u.name}</p>
                                    <p style={{ margin: 0, fontSize: '12px', color: t.textMuted }}>{u.email} · {new Date(u.created_at).toLocaleDateString()}</p>
                                </div>
                                <div style={{ display: 'flex', gap: '8px' }}>
                                    <button onClick={() => toggleStatus(u.id)} style={btnStyle('secondary')}>
                                        {u.status === "active" ? "Deactivate" : "Activate"}
                                    </button>
                                    <button onClick={() => deleteUser(u.id)} style={btnStyle('secondary')}>Remove</button>
                                </div>
                            </div>
                        ))
                    ) : <div style={emptyStateStyle}>No members found 👥</div>
                )}

                {tab === "posts" && (
                    posts.length > 0 ? (
                        posts.map((p) => (
                            <div key={p.id} style={row(false)}>
                                <div>
                                    <p style={{ margin: 0, fontWeight: "500" }}>{p.title}</p>
                                    <p style={{ margin: 0, fontSize: '12px', color: t.textMuted }}>By: {p.author_name} · {new Date(p.created_at).toLocaleDateString()}</p>
                                </div>
                                <div style={{ display: 'flex', gap: '8px' }}>
                                    <button onClick={() => navigate(`/post/${p.id}`)} style={btnStyle('secondary')}>View</button>
                                    <button onClick={() => deletePost(p.id)} style={btnStyle('secondary')}>Delete</button>
                                </div>
                            </div>
                        ))
                    ) : <div style={emptyStateStyle}>No posts available 📝</div>
                )}

                {tab === "messages" && (
                    messages.length > 0 ? (
                        messages.map((m) => (
                            <div key={m.id} style={row(m.read)}>
                                {/* MESSENGER BUBBLE AREA */}
                                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '12px' }}>

                                    {/* Conversation Header */}
                                    <div style={{ textAlign: 'center', marginBottom: '4px' }}>
                                        <span style={{ fontSize: '10px', fontWeight: '700', color: t.textMuted, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                                            Chat with {m.name} • {new Date(m.created_at).toLocaleDateString()}
                                        </span>
                                    </div>

                                    {/* User Bubble (Left) */}
                                    <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
                                        <div style={{
                                            background: isDark ? '#333' : '#f0f0f0',
                                            color: t.text,
                                            padding: '10px 16px',
                                            borderRadius: '18px',
                                            borderBottomLeftRadius: '4px',
                                            maxWidth: '85%',
                                            fontSize: '14px',
                                            lineHeight: '1.4',
                                            boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
                                        }}>
                                            {m.message}
                                        </div>
                                    </div>

                                    {/* Admin Bubble (Right) */}
                                    {m.reply_text && (
                                        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                                            <div style={{
                                                background: t.pink,
                                                color: 'white',
                                                padding: '10px 16px',
                                                borderRadius: '18px',
                                                borderBottomRightRadius: '4px',
                                                maxWidth: '85%',
                                                fontSize: '14px',
                                                lineHeight: '1.4',
                                                boxShadow: `0 4px 12px ${t.pink}44`
                                            }}>
                                                {m.reply_text}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* ACTION BUTTONS (Stacked vertically to the side) */}
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', minWidth: '100px' }}>
                                    <button
                                        onClick={async () => {
                                            const reply = window.prompt(`Reply to ${m.name}:`, m.reply_text || "");
                                            if (reply !== null) {
                                                try {
                                                    await API.put(`/admin/messages/${m.id}/reply`, { reply_text: reply });
                                                    window.location.reload();
                                                } catch (e) { alert("Error saving reply"); }
                                            }
                                        }}
                                        style={btnStyle('primary')}
                                    >
                                        {m.reply_text ? "Edit Reply" : "Reply"}
                                    </button>
                                    <button onClick={() => deleteMsg(m.id)} style={btnStyle('secondary')}>Delete</button>
                                </div>
                            </div>
                        ))
                    ) : <div style={emptyStateStyle}>No messages yet 💌</div>
                )}
            </div>
        </div>
    );
};

export default AdminPage;