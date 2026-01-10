import React, { useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { useNavigate } from "react-router-dom";

export default function RegisterPage(){
  const { register } = useAuth();
  const navigate = useNavigate();
  const [username,setUsername] = useState("");
  const [password,setPassword] = useState("");
  const [role,setRole] = useState<"admin"|"seller"|"viewer">("seller");
  const [loading,setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await register(username, password, role);
      navigate("/", { replace: true });
    } catch (err) {
      console.error(err);
      alert("Register failed");
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow p-6">
        <h2 className="text-2xl font-semibold mb-2">Register</h2>

        <form onSubmit={submit} className="space-y-4">
          <input className="input w-full" placeholder="Username" value={username} onChange={(e)=>setUsername(e.target.value)} required />
          <input type="password" className="input w-full" placeholder="Password" value={password} onChange={(e)=>setPassword(e.target.value)} required />
          <select className="input w-full" value={role} onChange={(e)=>setRole(e.target.value as any)}>
            <option value="admin">Admin</option>
            <option value="seller">Seller</option>
            <option value="viewer">Viewer</option>
          </select>

          <button type="submit" className="w-full py-2 rounded-md bg-brand-500 text-white">{loading ? "Creating..." : "Create account"}</button>
        </form>
      </div>
    </div>
  );
}
