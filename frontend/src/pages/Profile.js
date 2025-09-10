import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getUser, updateUser } from "../services/api";
import "./CreatePost.css"; // reuse existing styles

export default function Profile() {
  const { id } = useParams();
  const authCtx = useAuth() || {};
  const token = authCtx?.token || authCtx?.auth?.token || null;
  const currentUserId =
    authCtx?.user?._id ||
    authCtx?.user?.id ||
    authCtx?.auth?.user?._id ||
    authCtx?.auth?.user?.id ||
    null;

  const [user, setUser] = useState(null);
  const [recentPosts, setRecentPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    bio: "",
    avatar: "",
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setError("");

    getUser(id, token)
      .then((data) => {
        if (!mounted) return;
        setUser(data.user || data);
        setRecentPosts(data.recentPosts || []);
        setForm({
          firstName: data.user?.firstName || "",
          lastName: data.user?.lastName || "",
          bio: data.user?.bio || "",
          avatar: data.user?.avatar || "",
        });
      })
      .catch((err) => {
        console.error("Profile load error:", err);
        if (mounted) setError(err.message || "Failed to load profile");
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [id, token]);

  if (loading) return <div>Loading profile...</div>;
  if (error) return <div style={{ color: "red" }}>{error}</div>;
  if (!user) return <div>User not found.</div>;

  const isOwner =
    currentUserId && currentUserId.toString() === user._id?.toString();

  function onChange(e) {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  }

  async function onSave(e) {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const res = await updateUser(
        user._id,
        {
          firstName: form.firstName,
          lastName: form.lastName,
          bio: form.bio,
          avatar: form.avatar,
        },
        token
      );
      const updated = res.user || res;
      setUser(updated);
      setEditing(false);
    } catch (err) {
      console.error("Update profile error:", err);
      setError(err.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="create-post-container">
      <div style={{ display: "flex", gap: 20 }}>
        <div style={{ width: 220, textAlign: "center" }}>
          <img
            src={user.avatar || "/logo192.png"}
            alt="avatar"
            style={{
              width: 160,
              height: 160,
              borderRadius: "50%",
              objectFit: "cover",
            }}
          />
          <h2>
            {user.firstName
              ? `${user.firstName} ${user.lastName || ""}`
              : user.username}
          </h2>
          <p style={{ color: "#666" }}>{user.email}</p>
          <p>{user.bio}</p>

          {isOwner && (
            <button
              onClick={() => setEditing((v) => !v)}
              style={{ marginTop: 10 }}
            >
              {editing ? "Cancel" : "Edit Profile"}
            </button>
          )}
        </div>

        <div style={{ flex: 1 }}>
          {editing && isOwner && (
            <form onSubmit={onSave} style={{ marginBottom: 20 }}>
              <div>
                <label>First name</label>
                <input
                  name="firstName"
                  value={form.firstName}
                  onChange={onChange}
                />
              </div>
              <div>
                <label>Last name</label>
                <input
                  name="lastName"
                  value={form.lastName}
                  onChange={onChange}
                />
              </div>
              <div>
                <label>Avatar URL</label>
                <input name="avatar" value={form.avatar} onChange={onChange} />
              </div>
              <div>
                <label>Bio</label>
                <textarea name="bio" value={form.bio} onChange={onChange} />
              </div>
              <div>
                <button type="submit" disabled={saving}>
                  {saving ? "Saving..." : "Save"}
                </button>
              </div>
            </form>
          )}

          <section>
            <h3>Recent posts</h3>
            {recentPosts.length === 0 ? (
              <div>No published posts yet.</div>
            ) : (
              <ul>
                {recentPosts.map((p) => (
                  <li key={p._id || p.id}>
                    <Link to={`/posts/${p.slug || p._id}`}>{p.title}</Link>
                    <div style={{ fontSize: 12, color: "#666" }}>
                      {p.publishedAt
                        ? new Date(p.publishedAt).toLocaleString()
                        : ""}
                      {" • "}
                      {p.views || 0} views
                    </div>
                    <p style={{ color: "#444" }}>{p.excerpt}</p>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
