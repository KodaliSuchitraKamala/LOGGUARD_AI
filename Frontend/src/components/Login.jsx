import { useState } from "react";
import { login, register } from "../services/auth";

export default function Login({ onLogin }) {
  const [email, setEmail] = useState("test@test.com");
  const [password, setPassword] = useState("1234");
  const [isRegister, setIsRegister] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isRegister) {
        await register(email, password);
      }
      await login(email, password);
      onLogin();
    } catch (err) {
      alert(err.response?.data?.message || "Failed");
    }
  };

  return (
    <div className="flex h-screen items-center justify-center">
      <form onSubmit={handleSubmit} className="p-6 border rounded shadow">
        <h1 className="text-xl mb-4">{isRegister ? "Register" : "Login"}</h1>
        <input className="border p-2 w-full mb-2" value={email} onChange={e=>setEmail(e.target.value)} />
        <input className="border p-2 w-full mb-2" type="password" value={password} onChange={e=>setPassword(e.target.value)} />
        <button className="bg-blue-500 text-white p-2 w-full">{isRegister ? "Register" : "Login"}</button>
        <p className="text-sm mt-2 cursor-pointer text-blue-500" onClick={()=>setIsRegister(!isRegister)}>
          {isRegister ? "Already have account? Login" : "No account? Register"}
        </p>
      </form>
    </div>
  );
}