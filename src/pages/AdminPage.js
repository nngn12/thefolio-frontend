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
    
    // NEW: State for handling replies
    const [replyData, setReplyData] = useState({ id: null, text: "" });

    // ================= FETCH DATA =================
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
            console.error("Admin fetch error:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!user || user.role !== "admin") {
            navigate("/home");
            return;
        }
        fetchData();
    }, [user, navigate]);

    // ================= STATS =================
    const stats = {
        members: members.length,
        active: members.filter(m =>
            (m.status && m.status.toLowerCase() === "active") ||
            m.isActive === true
        ).length,
        posts: posts.length,
        messages: messages.length
    };

    // ================= ACTIONS =================
    
    // NEW: Action to send a reply to the database
    const handleSendReply = async (id) => {
        if (!replyData.text.trim()) return alert("Please type a message.");
        try {
            await API.put(`/messages/${id}/reply`, { reply_text: replyData.text });
            alert("Reply sent! 🚀");
            setReplyData({ id: null, text: "" });
            fetchData(); // Refresh the message list to show the new reply
        } catch (err) {
            alert("Failed to send reply. Ensure the backend route is ready.");
        }
    };

    const toggleStatus = async (id) => {
        try {
            const res = await API.put(`/admin/users/${id}/status`);
            setMembers(prev =>
                prev.map(u => (u.id === id || u._id === id) ? res.data.user : u)
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

    // ================= STYLES =================
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

                <h1 style={{ fontFamily: t.fontSerif, fontSize: "38px", color: t.text, marginBottom: "30px" }}>
                    Admin Dashboard
                </h1>

                {/* STATS */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: "16px", marginBottom: "40px" }}>
                    {[
                        { label: "Members", val: stats.members, color: t.pink },
                        { label: "Active", val: stats.active, color: t.success },
                        { label: "Posts", val: stats.posts, color: "#60a5fa" },
                        { label: "Messages", val: stats.messages, color: "#a78bfa" }
                    ].map(s => (
                        <div key={s.label} style={{ padding: "20px", borderRadius: "10px", background: t.card, border: `1px solid ${t.border}` }}>
                            <div style={{ fontFamily: t.fontSerif, fontSize: "32px", color: s.color }}>{s.val}</div>
                            <div style={{ fontSize: "12px", color: t.textMuted }}>{s.label}</div>
                        </div>
                    ))}
                </div>

                {/* TABS */}
                <div style={{ borderBottom: `1px solid ${t.border}`, marginBottom: "20px" }}>
                    {["members", "posts", "messages"].map(type => (
                        <button key={type} style={tabStyle(type)} onClick={() => setTab(type)}>
                            {type.charAt(0).toUpperCase() + type.slice(1)}
                        </button>
                    ))}
                </div>

                {/* MEMBERS TAB */}
                {tab === "members" && members.map(u => (
                    <div key={u.id || u._id} style={{ display: "flex", justifyContent: "space-between", padding: "15px 0", borderBottom: `1px solid ${t.border}` }}>
                        <div>
                            <div style={{ color: t.text }}>{u.name}</div>
                            <div style={{ fontSize: "12px", color: t.textMuted }}>{u.email}</div>
                        </div>
                        <div style={{ display: "flex", gap: "8px" }}>
                            <button style={btn("secondary")} onClick={() => toggleStatus(u.id || u._id)}>Toggle</button>
                            <button style={{ ...btn("secondary"), color: "red" }} onClick={() => deleteUser(u.id || u._id)}>Delete</button>
                        </div>
                    </div>
                ))}

                {/* POSTS TAB */}
                {tab === "posts" && posts.map(p => (
                    <div key={p.id || p._id} style={{ display: "flex", justifyContent: "space-between", padding: "15px 0", borderBottom: `1px solid ${t.border}` }}>
                        <div>
                            <div style={{ color: t.text }}>{p.title}</div>
                            <div style={{ fontSize: "12px", color: t.textMuted }}>{p.body?.substring(0, 60)}...</div>
                        </div>
                        <button style={{ color: "red", background: "none", border: "none", cursor: "pointer" }} onClick={() => deletePost(p.id || p._id)}>Delete</button>
                    </div>
                ))}

                {/* MESSAGES TAB (Updated with Reply UI) */}
                {tab === "messages" && messages.map(m => (
                    <div key={m.id || m._id} style={{ padding: "20px 0", borderBottom: `1px solid ${t.border}` }}>
                        <div style={{ color: t.text, fontWeight: "600", marginBottom: "4px" }}>
                            {m.name} <span style={{ fontWeight: "400", fontSize: "13px", color: t.textMuted }}>({m.email})</span>
                        </div>
                        <div style={{ color: t.text, fontSize: "14px", marginBottom: "10px", lineHeight: "1.5" }}>
                            {m.message}
                        </div>

                        {/* Display existing reply */}
                        {m.reply_text && (
                            <div style={{ background: "rgba(16,185,129,0.1)", padding: "12px", borderRadius: "10px", marginBottom: "10px", borderLeft: "4px solid #10b981" }}>
                                <div style={{ color: "#10b981", fontSize: "12px", fontWeight: "bold" }}>YOUR REPLY:</div>
                                <div style={{ color: t.text, fontSize: "13px" }}>{m.reply_text}</div>
                            </div>
                        )}

                        <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                            {replyData.id === (m.id || m._id) ? (
                                <div style={{ width: "100%", marginTop: "10px" }}>
                                    <textarea
                                        value={replyData.text}
                                        onChange={(e) => setReplyData({ ...replyData, text: e.target.value })}
                                        placeholder="Type your reply..."
                                        style={{ width: "100%", padding: "10px", borderRadius: "8px", border: `1px solid ${t.border}`, background: t.input, color: t.text, marginBottom: "8px" }}
                                    />
                                    <button onClick={() => handleSendReply(m.id || m._id)} style={btn("primary")}>Send Reply</button>
                                    <button onClick={() => setReplyData({ id: null, text: "" })} style={{ background: "none", border: "none", color: t.textMuted, marginLeft: "10px", cursor: "pointer", fontSize: "12px" }}>Cancel</button>
                                </div>
                            ) : (
                                <>
                                    <button 
                                        style={{ background: t.pink, color: "white", border: "none", padding: "4px 10px", borderRadius: "6px", fontSize: "11px", cursor: "pointer" }}
                                        onClick={() => setReplyData({ id: m.id || m._id, text: m.reply_text || "" })}
                                    >
                                        {m.reply_text ? "Edit Reply" : "Reply"}
                                    </button>
                                    <button
                                        style={{ color: "red", background: "none", border: "none", fontSize: "11px", cursor: "pointer" }}
                                        onClick={() => deleteMessage(m.id || m._id)}
                                    >
                                        Delete Message
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                ))}

            </div>
        </div>
    );
};

export default AdminPage;
