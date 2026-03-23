import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ShieldAlert } from "lucide-react";

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = () => {
    if (email && password) {
      navigate("/");
    } else {
      alert("Veuillez entrer votre email et mot de passe !");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: "#0b1220" }}>
      <div className="bg-[#131f33] border border-gray-800 rounded-3xl shadow-2xl w-full max-w-sm p-8 flex flex-col items-center">
        <ShieldAlert size={48} className="text-blue-500 mb-4" />
        <h1 className="text-2xl font-bold mb-2 text-center text-white">CryptoSentinel AI</h1>
        <p className="mb-8 text-sm text-gray-400 text-center tracking-wide">Accédez à votre tableau de bord</p>

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full mb-4 p-3 rounded-lg border border-gray-700 bg-[#0b1220] text-white focus:outline-none focus:border-blue-500 transition-colors"
        />
        <input
          type="password"
          placeholder="Mot de passe"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full mb-8 p-3 rounded-lg border border-gray-700 bg-[#0b1220] text-white focus:outline-none focus:border-blue-500 transition-colors"
        />

        <div className="w-full flex justify-between gap-4">
          <button
            onClick={handleLogin}
            className="w-1/2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold py-3 rounded-xl transition-colors shadow-lg shadow-blue-900/20"
          >
            Se connecter
          </button>
          <button
            onClick={() => navigate("/signup")}
            className="w-1/2 bg-[#0b1220] border border-gray-700 hover:bg-gray-800 text-gray-300 text-sm font-bold py-3 rounded-xl transition-colors"
          >
            S'inscrire
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;