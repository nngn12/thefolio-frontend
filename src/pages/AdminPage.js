import React, { useState, useEffect } from "react";
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
                const [usersRes, postsRes, msgRes] = await Promise.all([
                    API.get("/admin/users"),
                    API.get("/admin/posts"),
                    API.get("/admin/messages").catch(() => ({ data: [] }))
                ]);

                setMembers(usersRes.data || []);
                setPosts(postsRes.data || []);
                setMessages(msgRes.data || []);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [user, navigate]);

    // ================= ACTIONS =================
    const toggleStatus = async (id) => {
        try {
            const res = await API.put(`/admin/users/${id}/status`);
            setMembers(prev =>
                prev.map(u => (u.id === id || u._id === id ? res.data.user : u))
            );
        } catch {
            alert("Failed to update status");
        }
    };

    const deleteUser = async (id) => {
        if (!window.confirm("Delete this user?")) return;
        try {
            await API.delete(`/admin/users/${id}`);
            setMembers(prev => prev.filter(u => u.id !== id && u._id !== id));
        } catch {
            alert("Failed to delete user");
        }
    };

    const deletePost = async (id) => {
        if (!window.confirm("Delete this post?")) return;
        try {
            await API.delete(`/posts/${id}`);
            setPosts(prev => prev.filter(p => p.id !== id && p._id !== id));
        } catch {
            alert("Failed to delete post");
        }
    };

    const deleteMessage = async (id) => {
        if (!window.confirm("Delete this message?")) return;
        try {
            await API.delete(`/admin/messages/${id}`);
            setMessages(prev => prev.filter(m => m.id !== id && m._id !== id));
        } catch {
            alert("Failed to delete message");
        }
    };

    // ================= UI =================
    const btn = (type) => ({
        padding: "6px 12px",
        borderRadius: "8px",
        border: type === "primary" ? "none" : `1px solid ${t.border}`,
        background: type === "primary" ? t.pink : "transparent",
        color: type === "primary" ? "white" : t.text,
        fontSize: "12px",
        cursor: "pointer"
    });

    const tabStyle = (key) => ({
        padding: "10px 0",
        marginRight: "20px",
        border: "none",
        borderBottom: tab === key ? `2px solid ${t.pink}` : "2px solid transparent",
        background: "none",
        color: tab === key ? t.pink : t.textMuted,
        cursor: "pointer",
        fontSize: "13px"
    });

    if (loading) return <div style={{ background: t.bg, minHeight: "100vh" }} />;

    return (
        <div style={{ fontFamily: t.fontSans, background: t.bg, minHeight: "100vh" }}>
            <div style={{ maxWidth: "900px", margin: "0 auto", padding: "40px 20px" }}>

                <h1 style={{
                    fontFamily: t.fontSerif,
                    fontSize: "38px",
                    color: t.text,
                    marginBottom: "30px"
                }}>
                    Admin Dashboard
                </h1>

                {/* Tabs */}
                <div style={{ borderBottom: `1px solid ${t.border}`, marginBottom: "20px" }}>
                    <button style={tabStyle("members")} onClick={() => setTab("members")}>
                        Members ({members.length})
                    </button>
                    <button style={tabStyle("posts")} onClick={() => setTab("posts")}>
                        Posts ({posts.length})
                    </button>
                    <button style={tabStyle("messages")} onClick={() => setTab("messages")}>
                        Messages ({messages.length})
                    </button>
                </div>

                {/* ================= MEMBERS ================= */}
                {tab === "members" && (
                    members.length === 0 ? (
                        <p style={{ color: t.textMuted }}>No users</p>
                    ) : (
                        members.map(u => (
                            <div key={u.id || u._id} style={{
                                display: "flex",
                                justifyContent: "space-between",
                                padding: "15px 0",
                                borderBottom: `1px solid ${t.border}`
                            }}>
                                <div>
                                    <div style={{ color: t.text }}>{u.name}</div>
                                    <div style={{ fontSize: "12px", color: t.textMuted }}>{u.email}</div>
                                </div>

                                <div style={{ display: "flex", gap: "8px" }}>
                                    <button
                                        style={btn("secondary")}
                                        onClick={() => toggleStatus(u.id || u._id)}
                                    >
                                        Toggle
                                    </button>
                                    <button
                                        style={{ ...btn("secondary"), color: "red" }}
                                        onClick={() => deleteUser(u.id || u._id)}
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>
                        ))
                    )
                )}

                {/* ================= POSTS ================= */}
                {tab === "posts" && (
                    posts.length === 0 ? (
                        <p style={{ color: t.textMuted }}>No posts</p>
                    ) : (
                        posts.map(p => (
                            <div key={p.id || p._id} style={{
                                display: "flex",
                                justifyContent: "space-between",
                                padding: "15px 0",
                                borderBottom: `1px solid ${t.border}`
                            }}>
                                <div>
                                    <div style={{ color: t.text }}>{p.title}</div>
                                    <div style={{ fontSize: "12px", color: t.textMuted }}>
                                        {p.body?.substring(0, 60)}...
                                    </div>
                                </div>

                                <button
                                    style={{ ...btn("secondary"), color: "red" }}
                                    onClick={() => deletePost(p.id || p._id)}
                                >
                                    Delete
                                </button>
                            </div>
                        ))
                    )
                )}

                {/* ================= MESSAGES ================= */}
                {tab === "messages" && (
                    messages.length === 0 ? (
                        <p style={{ color: t.textMuted }}>No messages</p>
                    ) : (
                        messages.map(m => (
                            <div key={m.id || m._id} style={{
                                padding: "15px 0",
                                borderBottom: `1px solid ${t.border}`
                            }}>
                                <div style={{ color: t.text, fontWeight: "500" }}>
                                    {m.name} ({m.email})
                                </div>

                                <div style={{ color: t.textMuted, fontSize: "13px" }}>
                                    {m.message}
                                </div>

                                <button
                                    style={{ marginTop: "8px", ...btn("secondary"), color: "red" }}
                                    onClick={() => deleteMessage(m.id || m._id)}
                                >
                                    Delete
                                </button>
                            </div>
                        ))
                    )
                )}

            </div>
        </div>
    );
};

export default AdminPage;
