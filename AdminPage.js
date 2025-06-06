import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { auth, BACKEND_URL } from '../firebase';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';

function FadeInDiv({ children, delay = 0, className = "" }) {
  return (
    <div
      className={"opacity-0 translate-y-4 animate-fadeInUp " + className}
      style={{
        animationDelay: `${delay}ms`,
        animationFillMode: "forwards",
        animationDuration: "700ms",
        animationTimingFunction: "cubic-bezier(0.23, 1, 0.32, 1)",
      }}
    >
      {children}
    </div>
  );
}

export default function AdminPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [badge, setBadge] = useState('');
  const [password, setPassword] = useState('');
  const [nom, setNom] = useState('');
  const [prenom, setPrenom] = useState('');
  const [creating, setCreating] = useState(false);
  const [showUID, setShowUID] = useState({}); // toggle UID visibility per user
  const [showPassword, setShowPassword] = useState(false); // toggle password visibility

  const adminEmail = 'admin123@ram.com';
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const checkAdmin = async () => {
      const user = auth.currentUser;
      if (!user) return;
      setIsAdmin(user.email?.toLowerCase() === adminEmail);
    };
    checkAdmin();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    setError('');
    try {
      const token = await auth.currentUser.getIdToken();
      const res = await axios.get(`${BACKEND_URL}/admin/users`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsers(res.data);
    } catch {
      setError('Erreur lors du chargement des utilisateurs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) fetchUsers();
  }, [isAdmin]);

  const handleCreateStaff = async (e) => {
    e.preventDefault();
    if (!badge || !password) {
      setError('Badge et mot de passe sont obligatoires');
      return;
    }
    setCreating(true);
    setError('');
    try {
      const token = await auth.currentUser.getIdToken();
      await axios.post(`${BACKEND_URL}/admin/staff`, {
        badge: badge.toLowerCase(),
        password,
        nom,
        prenom
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setBadge('');
      setPassword('');
      setNom('');
      setPrenom('');
      await fetchUsers();
    } catch (e) {
      setError(e.response?.data || 'Erreur lors de la création');
    } finally {
      setCreating(false);
      setShowPassword(false);
    }
  };

  const isStaffUser = (email) => {
    if (!email) return false;
    const lower = email.toLowerCase();
    return lower.startsWith("ram") || lower.startsWith("admin");
  };

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center text-ramRed font-semibold text-xl">
        Accès refusé - Vous n'êtes pas admin.
      </div>
    );
  }

  const staffUsers = users.filter(u => isStaffUser(u.email));
  const normalUsers = users.filter(u => !isStaffUser(u.email));

  return (
    <div
      className="min-h-screen bg-bgMain font-sans"
      style={{ fontFamily: "Montserrat, Arial, sans-serif" }}
    >
      {/* Header (copié de RecherchePage) */}
      <FadeInDiv delay={80}>
        <div
          className="flex items-end justify-between px-7 pt-7 pb-2 bg-white border-b"
          style={{
            minHeight: 50,
            borderBottom: "1.5px solid #ececec",
            marginLeft: -8,
            paddingRight: 24,
            fontFamily: 'Montserrat, Arial, sans-serif',
            userSelect: 'none'
          }}
        >
          <div>
            <div className="flex items-center gap-2">
              <h1
                className="text-xl font-bold uppercase"
                style={{
                  color: "#C4002A",
                  letterSpacing: '1px',
                }}
              >
                Dashboard 
              </h1>
              <span
                className="bg-white border border-[#ebc4c7] text-[#C4002A] font-semibold text-xs px-3 py-[3px] rounded ml-2 tracking-wide"
                style={{
                  borderRadius: 2,
                  letterSpacing: "1.2px"
                }}
              >
                Admin Staff
              </span>
            </div>
            <div
              className="h-[2px] w-12 mt-1"
              style={{ backgroundColor: '#C4002A', opacity: 0.12 }}
            />
          </div>
          <div
            className="text-xs text-gray-400 font-normal select-none px-3 py-1"
            style={{ fontFamily: 'Montserrat, Arial, sans-serif' }}
          >
            {users.length} utilisateur{users.length > 1 ? 's' : ''} total
          </div>
        </div>
      </FadeInDiv>

      <div className="flex gap-12 px-7 mt-6 max-w-7xl mx-auto">
        {/* Tableaux à gauche */}
        <FadeInDiv delay={160} className="flex flex-col gap-10 flex-1 max-w-4xl">
          {/* Staff */}
          <section>
            <h2 className="text-lg font-semibold mb-3 text-ramRed tracking-wide">Staff</h2>
            {loading ? (
              <div className="text-ramRed font-semibold">Chargement...</div>
            ) : staffUsers.length === 0 ? (
              <div>Aucun staff trouvé.</div>
            ) : (
              <table className="w-full text-left text-gray-900 text-sm border-separate border-spacing-y-1">
                <thead>
                  <tr className="border-b border-gray-300">
                    <th className="py-2 px-4">Email</th>
                    <th className="py-2 px-4">Firebase UID</th>
                  </tr>
                </thead>
                <tbody>
                  {staffUsers.map(u => (
                    <tr
                      key={u.uid}
                      className="hover:bg-gray-100 cursor-default rounded"
                      style={{ transition: "background-color 0.3s" }}
                    >
                      <td className="py-2 px-4 truncate">{u.email}</td>
                      <td className="py-2 px-4 font-mono text-xs select-all relative">
                        <span className="inline-block pr-7">
                          {showUID[u.uid] ? u.uid : '••••••••••••••••••••••••••••••••'}
                        </span>
                        <button
                          aria-label={showUID[u.uid] ? "Masquer UID" : "Afficher UID"}
                          onClick={() => setShowUID(s => ({ ...s, [u.uid]: !s[u.uid] }))}
                          className="absolute right-1 top-1/2 -translate-y-1/2 text-ramRed hover:text-ramRed/75 transition"
                          type="button"
                          style={{ padding: 0 }}
                        >
                          {showUID[u.uid] ? (
                            <EyeSlashIcon className="h-5 w-5" />
                          ) : (
                            <EyeIcon className="h-5 w-5" />
                          )}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </section>

          {/* Users */}
          <section>
            <h2 className="text-lg font-semibold mb-3 text-ramRed tracking-wide">Utilisateurs</h2>
            {loading ? (
              <div className="text-ramRed font-semibold">Chargement...</div>
            ) : normalUsers.length === 0 ? (
              <div>Aucun utilisateur trouvé.</div>
            ) : (
              <table className="w-full text-left text-gray-900 text-sm border-separate border-spacing-y-1">
                <thead>
                  <tr className="border-b border-gray-300">
                    <th className="py-2 px-4">Email</th>
                    <th className="py-2 px-4">Firebase UID</th>
                  </tr>
                </thead>
                <tbody>
                  {normalUsers.map(u => (
                    <tr
                      key={u.uid}
                      className="hover:bg-gray-100 cursor-default rounded"
                      style={{ transition: "background-color 0.3s" }}
                    >
                      <td className="py-2 px-4 truncate">{u.email}</td>
                      <td className="py-2 px-4 font-mono text-xs select-all relative">
                        <span className="inline-block pr-7">
                          {showUID[u.uid] ? u.uid : '••••••••••••••••••••••••••••••••'}
                        </span>
                        <button
                          aria-label={showUID[u.uid] ? "Masquer UID" : "Afficher UID"}
                          onClick={() => setShowUID(s => ({ ...s, [u.uid]: !s[u.uid] }))}
                          className="absolute right-1 top-1/2 -translate-y-1/2 text-ramRed hover:text-ramRed/75 transition"
                          type="button"
                          style={{ padding: 0 }}
                        >
                          {showUID[u.uid] ? (
                            <EyeSlashIcon className="h-5 w-5" />
                          ) : (
                            <EyeIcon className="h-5 w-5" />
                          )}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </section>
        </FadeInDiv>

        {/* Formulaire à droite */}
        <FadeInDiv delay={320} className="flex-shrink-0 w-96 bg-transparent rounded p-6">
          <h2 className="text-lg font-semibold mb-6 text-ramRed tracking-wide">Créer un compte Staff</h2>
          {error && (
            <div className="mb-4 text-red-600 font-semibold">{error}</div>
          )}
          <form onSubmit={handleCreateStaff} className="space-y-4">
            <input
              type="text"
              placeholder="Numéro de badge"
              value={badge}
              onChange={e => setBadge(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-ramRed"
              required
            />
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Mot de passe"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-ramRed"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-ramRed hover:text-ramRed/75 transition"
                tabIndex={-1}
                aria-label={showPassword ? "Masquer mot de passe" : "Afficher mot de passe"}
                style={{ padding: 0 }}
              >
                {showPassword ? (
                  <EyeSlashIcon className="h-5 w-5" />
                ) : (
                  <EyeIcon className="h-5 w-5" />
                )}
              </button>
            </div>
            
            <button
              type="submit"
              disabled={creating}
              className="w-full bg-ramRed text-white py-2 rounded font-semibold hover:bg-[#9d1222] transition"
            >
              {creating ? 'Création...' : 'Créer le compte'}
            </button>
          </form>
        </FadeInDiv>
      </div>
    </div>
  );
}
