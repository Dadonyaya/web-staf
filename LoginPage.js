import React, { useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { auth } from '../firebase';
import logoRam from '../assets/logo_ram.png';

export default function LoginPage() {
  const [badge, setBadge] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const email = `${badge}@ram.com`;

    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate('/');
    } catch {
      setError("Identifiants incorrects.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 bg-[#F5F6FA]"
      style={{ fontFamily: "Montserrat, Arial, sans-serif" }}
    >
      <div
        className="bg-white shadow-xl p-8 w-full max-w-sm rounded-md border border-gray-200"
        role="main"
      >
        {/* Logo RAM */}
        <div className="flex justify-center mb-6">
          <img
            src={logoRam}
            alt="Logo Royal Air Maroc"
            className="w-24 h-24 select-none"
            draggable={false}
          />
        </div>

        <h1
          className="text-2xl font-extrabold text-center mb-6 uppercase tracking-widest"
          style={{ color: "#C4002A", letterSpacing: "1.7px" }}
        >
          Connexion Staff
        </h1>

        <form onSubmit={handleLogin} className="space-y-5" noValidate>
          <div>
            <label
              htmlFor="badge"
              className="block mb-1 text-sm font-semibold text-gray-500"
            >
            </label>
            <input
              id="badge"
              type="text"
              value={badge}
              onChange={(e) => setBadge(e.target.value.toUpperCase())}
              required
              placeholder=" Numéro de badge"
              autoComplete="username"
              autoFocus
              className="
                w-full px-4 py-3 border border-gray-300 rounded
                text-gray-900 text-base font-medium
                focus:outline-none focus:ring-2 focus:ring-ramRed focus:border-ramRed
                transition
              "
              style={{ backgroundColor: "#FAFBFC" }}
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block mb-1 text-sm font-semibold text-gray-500"
            >
              
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="Mot de passe"
              autoComplete="current-password"
              className="
                w-full px-4 py-3 border border-gray-300 rounded
                text-gray-900 text-base font-medium
                focus:outline-none focus:ring-2 focus:ring-ramRed focus:border-ramRed
                transition
              "
              style={{ backgroundColor: "#FAFBFC" }}
            />
          </div>

          {error && (
            <p className="text-center text-sm text-red-600 font-medium">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className={`
              w-full py-3 rounded bg-ramRed text-white font-semibold uppercase tracking-wide
              transition-colors duration-300
              ${loading ? "opacity-60 cursor-not-allowed" : "hover:bg-[#9d1222]"}
            `}
            style={{ fontSize: "15px", letterSpacing: "0.8px" }}
          >
            {loading ? "Connexion..." : "Se connecter"}
          </button>
        </form>
      </div>
    </div>
  );
}
