import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { auth, BACKEND_URL } from '../firebase';
import {
  EyeIcon,
  EyeSlashIcon,
  PlusIcon,
  XMarkIcon,
  ChevronLeftIcon,
  ChevronRightIcon
} from '@heroicons/react/24/outline';

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

const ITEMS_PER_PAGE = 5;

export default function AdminPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [badge, setBadge] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [nom, setNom] = useState('');
  const [prenom, setPrenom] = useState('');
  const [creating, setCreating] = useState(false);
  const [showUID, setShowUID] = useState({}); // toggle UID visibility per user
  const [showPassword, setShowPassword] = useState(false); // toggle password visibility
  const [staffPage, setStaffPage] = useState(1);
  const [userPage, setUserPage] = useState(1);
  const [openModal, setOpenModal] = useState(false);

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
    if (!badge || !password || !confirmPassword) {
      setError('Tous les champs sont obligatoires');
      return;
    }
    if (password !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas');
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
      setConfirmPassword('');
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

  const staffTotalPages = Math.ceil(staffUsers.length / ITEMS_PER_PAGE) || 1;
  const paginatedStaff = staffUsers.slice(
    (staffPage - 1) * ITEMS_PER_PAGE,
    staffPage * ITEMS_PER_PAGE
  );

  const userTotalPages = Math.ceil(normalUsers.length / ITEMS_PER_PAGE) || 1;
  const paginatedUsers = normalUsers.slice(
    (userPage - 1) * ITEMS_PER_PAGE,
    userPage * ITEMS_PER_PAGE
  );

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
                    <th className="py-2 px-4">Badge</th>
                    <th className="py-2 px-4">Firebase UID</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedStaff.map(u => (
                    <tr
                      key={u.uid}
                      className="hover:bg-gray-100 cursor-default rounded"
                      style={{ transition: "background-color 0.3s" }}
                    >
                      <td className="py-2 px-4 truncate">{u.badge || u.email?.split('@')[0]}</td>
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
              <div className="flex justify-center items-center mt-4 gap-2">
                <button
                  onClick={() => setStaffPage(p => Math.max(1, p - 1))}
                  disabled={staffPage === 1}
                  className={`flex items-center px-3 py-2 rounded-full border transition shadow-sm bg-white border-[#ececec] hover:border-ramRed hover:bg-[#f7e8ea] active:scale-95 ${staffPage === 1 ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <ChevronLeftIcon className="h-5 w-5 mr-1 text-ramRed" />
                  Précédent
                </button>
                <div className="font-medium text-[15px] px-4 select-none" style={{ color: '#C4002A', letterSpacing: 1 }}>
                  Page {staffPage} / {staffTotalPages}
                </div>
                <button
                  onClick={() => setStaffPage(p => Math.min(staffTotalPages, p + 1))}
                  disabled={staffPage === staffTotalPages}
                  className={`flex items-center px-3 py-2 rounded-full border transition shadow-sm bg-white border-[#ececec] hover:border-ramRed hover:bg-[#f7e8ea] active:scale-95 ${staffPage === staffTotalPages ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  Suivant
                  <ChevronRightIcon className="h-5 w-5 ml-1 text-ramRed" />
                </button>
              </div>
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
                    <th className="py-2 px-4">Prénom</th>
                    <th className="py-2 px-4">Nom</th>
                    <th className="py-2 px-4">Email</th>
                    <th className="py-2 px-4">Firebase UID</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedUsers.map(u => (
                    <tr
                      key={u.uid}
                      className="hover:bg-gray-100 cursor-default rounded"
                      style={{ transition: "background-color 0.3s" }}
                    >
                      <td className="py-2 px-4">{u.prenom}</td>
                      <td className="py-2 px-4">{u.nom}</td>
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
              <div className="flex justify-center items-center mt-4 gap-2">
                <button
                  onClick={() => setUserPage(p => Math.max(1, p - 1))}
                  disabled={userPage === 1}
                  className={`flex items-center px-3 py-2 rounded-full border transition shadow-sm bg-white border-[#ececec] hover:border-ramRed hover:bg-[#f7e8ea] active:scale-95 ${userPage === 1 ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <ChevronLeftIcon className="h-5 w-5 mr-1 text-ramRed" />
                  Précédent
                </button>
                <div className="font-medium text-[15px] px-4 select-none" style={{ color: '#C4002A', letterSpacing: 1 }}>
                  Page {userPage} / {userTotalPages}
                </div>
                <button
                  onClick={() => setUserPage(p => Math.min(userTotalPages, p + 1))}
                  disabled={userPage === userTotalPages}
                  className={`flex items-center px-3 py-2 rounded-full border transition shadow-sm bg-white border-[#ececec] hover:border-ramRed hover:bg-[#f7e8ea] active:scale-95 ${userPage === userTotalPages ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  Suivant
                  <ChevronRightIcon className="h-5 w-5 ml-1 text-ramRed" />
                </button>
              </div>
            )}
          </section>
        </FadeInDiv>

        {/* Bouton ouvrir modal */}
        <FadeInDiv delay={320} className="flex-shrink-0">
          <button
            type="button"
            onClick={() => setOpenModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-ramRed text-white rounded hover:bg-[#9d1222] transition"
          >
            <PlusIcon className="h-5 w-5" /> Nouveau staff
          </button>
        </FadeInDiv>
        {openModal && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-md w-full max-w-sm p-6 max-h-[85vh] overflow-auto">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-ramRed">Créer un compte Staff</h2>
                <button type="button" onClick={() => setOpenModal(false)} aria-label="Fermer" className="text-gray-400 hover:text-gray-600">
                  <XMarkIcon className="h-5 w-5" />
                </button>
              </div>
              {error && (
                <div className="mb-3 text-red-600 font-semibold">{error}</div>
              )}
              <form onSubmit={handleCreateStaff} className="space-y-3">
                <input
                  type="text"
                  placeholder="Prénom"
                  value={prenom}
                  onChange={e => setPrenom(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-ramRed"
                  required
                />
                <input
                  type="text"
                  placeholder="Nom"
                  value={nom}
                  onChange={e => setNom(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-ramRed"
                  required
                />
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
                    type={showPassword ? 'text' : 'password'}
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
                    aria-label={showPassword ? 'Masquer mot de passe' : 'Afficher mot de passe'}
                    style={{ padding: 0 }}
                  >
                    {showPassword ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
                  </button>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Confirmer le mot de passe"
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-ramRed"
                    required
                  />
                </div>
                <button
                  type="submit"
                  disabled={creating}
                  className="w-full bg-ramRed text-white py-2 rounded font-semibold hover:bg-[#9d1222] transition"
                >
                  {creating ? 'Création...' : 'Créer le compte'}
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
