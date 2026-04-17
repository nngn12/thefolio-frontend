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
    const [myPosts, setMyPosts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        API.get("/posts/my-posts")
            .then(res => setMyPosts(res.data))
            .catch(err => console.error(err))
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

    return (
        <div style={{ background: t.bg, minHeight: "100vh", color: t.text, fontFamily: t.fontSans, padding: "40px 20px" }}>
            <div style={{ maxWidth: "900px", margin: "0 auto" }}>
                <header style={{ marginBottom: "40px", display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
                    <div>
                        <h1 style={{ fontFamily: t.fontSerif, fontSize: "32px", fontStyle: "italic", marginBottom: "8px" }}>
                            Welcome, {user?.name}
                        </h1>
                        <p style={{ color: t.textMuted, fontSize: "14px" }}>Manage your captured memories and stories.</p>
                    </div>
                    <button
                        onClick={() => navigate("/create")}
                        style={{ padding: "10px 20px", borderRadius: "20px", border: "none", background: t.pinkGrad, color: "white", fontWeight: "600", cursor: "pointer" }}
                    >
                        + New Post
                    </button>
                </header>

                <div style={{ display: "grid", gap: "16px" }}>
                    {loading ? (
                        <p>Loading your journal...</p>
                    ) : myPosts.length === 0 ? (
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
                                <div style={{ display: "flex", gap: "15px", alignItems: "center" }}>
                                    {post.image && (
                                        <img src={post.image.split(',')[0]} alt="" style={{ width: "60px", height: "60px", borderRadius: "8px", objectFit: "cover" }} />
                                    )}
                                    <div>
                                        <h3 style={{ fontSize: "18px", marginBottom: "4px" }}>{post.title}</h3>
                                        <p style={{ fontSize: "12px", color: t.textMuted }}>
                                            {new Date(post.created_at).toLocaleDateString()} • {post.status}
                                        </p>
                                    </div>
                                </div>
                                <div style={{ display: "flex", gap: "10px" }}>
                                    <button onClick={() => navigate(`/post/${post.id}`)} style={{ background: "none", border: "none", color: t.pink, cursor: "pointer", fontSize: "13px" }}>View</button>
                                    <button onClick={() => navigate(`/edit/${post.id}`)} style={{ background: "none", border: "none", color: t.textSub, cursor: "pointer", fontSize: "13px" }}>Edit</button>
                                    <button onClick={() => deletePost(post.id)} style={{ background: "none", border: "none", color: "red", cursor: "pointer", fontSize: "13px", opacity: 0.7 }}>Delete</button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default MemberDashboard;