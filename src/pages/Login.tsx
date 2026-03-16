import { useState } from "react";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = () => {
    if (email && password) {
      navigate("/profile"); // ou "/" selon ta route principale
    } else {
      alert("Veuillez entrer votre email et mot de passe !");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#080b13] p-4">
      <div className="login-card bg-white rounded-3xl shadow-2xl w-full max-w-sm p-8 flex flex-col items-center">
        <h1 className="text-3xl font-bold mb-2 text-center text-orange-500">CryptoSentinel AI</h1>
        <p className="mb-6 text-gray-600 text-center">Connexion</p>

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full mb-4 p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-400"
        />
        <input
          type="password"
          placeholder="Mot de passe"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full mb-4 p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-400"
        />

        <div className="login-buttons w-full flex justify-between gap-4">
          <button
            onClick={handleLogin}
            className="w-1/2 bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 rounded-xl transition-colors"
          >
            Se connecter
          </button>
          <button
            onClick={() => navigate("/signup")}
            className="w-1/2 bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-3 rounded-xl transition-colors"
          >
            Créer un compte
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;