import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { BACKEND_URL, auth } from '../firebase';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';

// Animation fade sobre
function FadeInDiv({ children, delay = 0, className = "" }) {
  return (
    <div
      className={"opacity-0 translate-y-4 animate-fadeInUp " + className}
      style={{
        animationDelay: `${delay}ms`,
        animationFillMode: "forwards",
        animationDuration: "850ms",
        animationTimingFunction: "cubic-bezier(0.23, 1, 0.32, 1)",
      }}
    >
      {children}
    </div>
  );
}

export default function DetailVoyagePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [voyage, setVoyage] = useState(null);
  const [bagages, setBagages] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fonction pour fetch à chaque fois
  const fetchDetails = async () => {
    try {
      const token = await auth.currentUser.getIdToken();
      const allVoyages = await axios.get(`${BACKEND_URL}/voyages/staff`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const selected = allVoyages.data.find(v => String(v.id) === String(id));
      setVoyage(selected);

      const bagageRes = await axios.get(`${BACKEND_URL}/bagages/staff/voyage/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setBagages(bagageRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Premier chargement + polling auto chaque 3 secondes
  useEffect(() => {
    fetchDetails();
    const interval = setInterval(fetchDetails, 3000);
    return () => clearInterval(interval);
    // eslint-disable-next-line
  }, [id]);

  return (
    <div
      className="min-h-screen"
      style={{
        background: "#F5F6FA",
        fontFamily: "Montserrat, Arial, sans-serif",
      }}
    >
      {/* Header sobre et carré */}
      <FadeInDiv delay={80}>
        <div
          className="flex items-end justify-between px-7 pt-7 pb-2 bg-white border-b"
          style={{
            minHeight: 50,
            borderBottom: "1.5px solid #ececec",
            marginLeft: -8,
            paddingRight: 24,
            fontFamily: 'Montserrat, Arial, sans-serif',
          }}
        >
          <div className="flex items-center gap-2">
            <button
              className="mr-2 p-1 rounded-none hover:bg-[#f7f8fa] transition-colors border-none shadow-none"
              onClick={() => navigate(-1)}
              aria-label="Retour"
              tabIndex={0}
              style={{ background: 'none', outline: 'none', minWidth: 28 }}
            >
              <ArrowLeftIcon className="w-4 h-4 text-gray-300" />
            </button>
            <h1 className="text-[1.12rem] font-bold text-[#C4002A] tracking-tight uppercase" style={{ letterSpacing: '0.7px' }}>
              Détail du vol
            </h1>
          </div>
          <div className="h-[2px] w-12 mt-1 rounded-full" style={{ backgroundColor: '#C4002A', opacity: 0.15 }} />
        </div>
      </FadeInDiv>

      {/* Bloc infos vol */}
      <FadeInDiv delay={210}>
        <div className="bg-white border border-[#ececec] rounded-[5px] px-8 py-5 mb-10 mt-4 max-w-3xl mx-auto shadow-none">
          {voyage ? (
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-bold text-[#C4002A]">{voyage.numeroVol}</span>
                  <span className="text-xs text-gray-400 ml-2 tracking-wide">PNR</span>
                  <span className="text-xs font-medium text-gray-700">{voyage.pnr}</span>
                </div>
                <div className="text-gray-800 font-medium mb-2">
                  {voyage.nom} {voyage.prenom}
                </div>
              </div>
              <div className="flex flex-col md:items-end md:gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-gray-500">Départ</span>
                  <span className="font-medium text-gray-900">{voyage.villeDepart}</span>
                  <span className="mx-1 text-gray-400">→</span>
                  <span className="text-gray-500">Arrivée</span>
                  <span className="font-medium text-gray-900">{voyage.villeArrivee}</span>
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-gray-500">Date</span>
                  <span className="font-medium text-gray-900">{voyage.date}</span>
                  <span className="text-gray-400">|</span>
                  <span className="text-gray-500">Heure</span>
                  <span className="font-medium text-gray-900">{voyage.heure}</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-gray-400 font-medium">Vol introuvable.</div>
          )}
        </div>
      </FadeInDiv>

      {/* Bagages associés */}
      <FadeInDiv delay={650}>
        <div className="max-w-3xl mx-auto">
          <h2 className="text-base font-bold text-[#C4002A] mb-3 mt-1 uppercase tracking-wide" style={{letterSpacing:"0.7px"}}>
            Bagages associés
          </h2>
          {loading ? (
            <div className="text-center text-[#C4002A] font-semibold py-14">Chargement…</div>
          ) : bagages.length === 0 ? (
            <div className="text-gray-400 italic py-8 bg-white border border-[#ececec] rounded-[5px] text-center">
              Aucun bagage lié à ce vol.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {bagages.map(b => (
                <div
                  key={b.id}
                  onClick={() => navigate(`/bagage/${b.id}`)}
                  className="
                    group bg-white border border-[#ececec] rounded-[4px]
                    cursor-pointer hover:border-[#C4002A] transition-all
                    p-5 flex flex-col items-stretch min-h-[180px] shadow-none
                  "
                  tabIndex={0}
                  style={{
                    boxShadow: "0 1px 4px 0 rgba(60,60,60,0.02)",
                  }}
                >
                  <div className="flex-1 flex items-center justify-center mb-4">
                    {b.photos ? (
                      <img
                        src={b.photos}
                        alt="Bagage"
                        className="w-full max-h-36 object-cover object-center rounded-[3px] border border-gray-100
                        transition-all duration-300 group-hover:scale-[1.017]"
                        onError={e => { e.target.style.display = 'none'; }}
                        style={{ background: "#fafbfc" }}
                      />
                    ) : (
                      <div className="w-full h-24 flex items-center justify-center text-gray-200 border border-gray-100 rounded-[3px] bg-[#fafbfc] text-xs">
                        Aucune image
                      </div>
                    )}
                  </div>
                  <div>
                    <h3 className="text-[1rem] font-bold text-[#C4002A] mb-1">{b.nom}</h3>
                    <p className="text-[15px] text-gray-700 mb-1">{b.description}</p>
                  </div>
                  <div className="flex justify-end mt-2">
                    <span className="flex items-center gap-1 text-xs font-semibold opacity-0 group-hover:opacity-100 transition-opacity text-gray-600">
                      Voir détail &rarr;
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </FadeInDiv>
    </div>
  );
}
