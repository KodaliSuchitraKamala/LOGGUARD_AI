import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";
import toast from "react-hot-toast";

export default function Login({ setAuth }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("kodalisuchitrakamala@gmail.com");
  const [password, setPassword] = useState("");
  const [isLogin, setIsLogin] = useState(true);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const endpoint = isLogin ? "/auth/login" : "/auth/register";
      const payload = isLogin ? { email, password } : { name, email, password };

      const res = await API.post(endpoint, payload);
      console.log("SUCCESS:", res.data);

      if(isLogin) {
        localStorage.setItem("token", res.data.token);
        localStorage.setItem("user", JSON.stringify({
          _id: res.data._id, name: res.data.name, email: res.data.email, role: res.data.role
        }));
        if(setAuth) setAuth(true);
        toast.success("Login success!");
        navigate("/");
      } else {
        toast.success("Registered! Now login");
        setIsLogin(true);
      }
    } catch (err) {
      console.log("FULL ERROR:", err.response?.data);
      // FIXED: Use toast instead of alert that blocks localhost
      toast.error(err.response?.data?.message || "Authentication failed");
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center text-white">
      <form onSubmit={handleSubmit} className="bg-gray-800 p-8 rounded-lg w-96 shadow-lg">
        <h2 className="text-2xl font-bold mb-6 text-center">{isLogin ? "Login" : "Register"}</h2>
        {!isLogin && <input type="text" placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} className="w-full p-2 mb-4 rounded bg-gray-700" required />}
        <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full p-2 mb-4 rounded bg-gray-700" required />
        <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full p-2 mb-4 rounded bg-gray-700" required />
        <button type="submit" className="w-full bg-blue-600 p-2 rounded font-semibold hover:bg-blue-700">{isLogin ? "Login" : "Register"}</button>
        <p onClick={() => setIsLogin(!isLogin)} className="text-blue-400 mt-4 cursor-pointer text-center text-sm">
          {isLogin ? "No account? Register" : "Already have account? Login"}
        </p>
      </form>
    </div>
  );
}