import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { BACKEND_URL, auth } from '../firebase';
import Zoom from 'react-medium-image-zoom';
import 'react-medium-image-zoom/dist/styles.css';
import { XMarkIcon } from '@heroicons/react/24/outline';

function FadeInDiv({ children, delay = 0, className = "" }) {
  return (
    <div
      className={"opacity-0 translate-y-4 animate-fadeInUp " + className}
      style={{
        animationDelay: `${delay}ms`,
        animationFillMode: "forwards",
        animationDuration: "600ms",
        animationTimingFunction: "cubic-bezier(0.23, 1, 0.32, 1)",
      }}
    >
      {children}
    </div>
  );
}

export default function DetailBagagePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [bagage, setBagage] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchBagage = async () => {
    try {
      const token = await auth.currentUser.getIdToken();
      const res = await axios.get(`${BACKEND_URL}/bagages/staff/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setBagage(res.data);
    } catch {
      setBagage(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBagage();
  }, [id]);


  return (
    <div className="fixed inset-0 bg-black/40 flex items-start justify-center p-4 z-50" style={{ fontFamily: 'Montserrat, Arial, sans-serif' }}>
      <div className="bg-white rounded-md w-full max-w-lg mx-auto overflow-auto" style={{ maxHeight: '90vh' }}>
        <div className="flex items-center justify-between px-7 pt-6 pb-2 border-b" style={{ borderBottom: '1.5px solid #ececec' }}>
          <h1 className="text-[1.12rem] font-bold text-[#C4002A] tracking-tight uppercase" style={{ letterSpacing: '0.7px' }}>
            Détail du bagage
          </h1>
          <button className="p-1 rounded hover:bg-gray-100" onClick={() => navigate(-1)} aria-label="Fermer">
            <XMarkIcon className="w-5 h-5 text-gray-400" />
          </button>
        </div>

      {/* Contenu principal */}
      <FadeInDiv delay={210}>
        <div className="flex flex-col md:flex-row max-w-3xl mx-auto py-12 gap-8 items-start">
          {/* Image */}
          <div className="w-full md:w-[330px] flex-shrink-0 flex justify-center items-start">
            {loading ? (
              <div className="w-full aspect-square rounded-[4px] bg-gray-100 flex items-center justify-center text-gray-300 text-lg font-semibold">
                Chargement…
              </div>
            ) : !bagage || !bagage.photos ? (
              <div className="w-full aspect-square rounded-[4px] border border-[#ececec] flex items-center justify-center text-gray-300 text-base font-medium bg-gray-50">
                Aucune image
              </div>
            ) : (
              <Zoom overlayBgColorEnd="rgba(255,255,255,0.98)" zoomMargin={40} zoomZindex={100}>
                <img
                  src={bagage.photos}
                  alt="Bagage"
                  className="object-cover aspect-square w-full rounded-[4px] border border-gray-200 transition-all duration-700"
                  style={{ maxWidth: 330, maxHeight: 330, minHeight: 180 }}
                />
              </Zoom>
            )}
          </div>

          {/* Infos */}
          <div className="flex-1 w-full">
            {loading ? (
              <div className="text-[#C4002A] py-24 text-center">Chargement…</div>
            ) : !bagage ? (
              <div className="bg-white border border-[#ececec] rounded-[5px] py-12 px-7 text-center text-gray-400 font-medium">
                Bagage introuvable.
              </div>
            ) : (
              <div className="bg-white border border-[#ececec] rounded-[5px] px-8 py-7 flex flex-col gap-4">
                <h2 className="text-xl font-bold text-[#C4002A] mb-1">{bagage.nom}</h2>
                <p className="text-[15px] text-gray-700">{bagage.description}</p>
                <div className="border-t border-[#ececec] my-4" />
                {bagage.voyage && (
                  <div className="flex flex-col gap-2 text-[15px]">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-semibold text-gray-500">Vol</span>
                      <span className="font-semibold text-gray-900">{bagage.voyage.numeroVol}</span>
                      <span className="text-gray-400">|</span>
                      <span className="font-semibold text-gray-500">Passager</span>
                      <span className="text-gray-900">{bagage.voyage.prenom} {bagage.voyage.nom}</span>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span>PNR</span>
                      <span className="text-gray-900">{bagage.voyage.pnr}</span>
                      <span className="text-gray-400">|</span>
                      <span>Départ</span>
                      <span className="text-gray-900">{bagage.voyage.villeDepart}</span>
                      <span className="text-gray-400">→</span>
                      <span className="text-gray-900">{bagage.voyage.villeArrivee}</span>
                      <span className="text-gray-400">|</span>
                      <span>Date</span>
                      <span className="text-gray-900">{bagage.voyage.date}</span>
                      <span>à</span>
                      <span className="text-gray-900">{bagage.voyage.heure}</span>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </FadeInDiv>
    </div>
  </div>
  );
}
