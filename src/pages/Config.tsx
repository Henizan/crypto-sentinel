import { Settings } from "lucide-react";
import { useState, useEffect } from "react";

const Config = () => {
  const [finbertEnabled, setFinbertEnabled] = useState(() => {
    const saved = localStorage.getItem("config_finbert");
    return saved !== null ? JSON.parse(saved) : true;
  });

  const [autoEncoderEnabled, setAutoEncoderEnabled] = useState(() => {
    const saved = localStorage.getItem("config_autoencoder");
    return saved !== null ? JSON.parse(saved) : true;
  });

  useEffect(() => {
    localStorage.setItem("config_finbert", JSON.stringify(finbertEnabled));
  }, [finbertEnabled]);

  useEffect(() => {
    localStorage.setItem("config_autoencoder", JSON.stringify(autoEncoderEnabled));
  }, [autoEncoderEnabled]);

  return (
    <div className="p-4 sm:p-8 text-white min-h-screen" style={{ backgroundColor: "#0b1220" }}>
      <div className="flex items-center gap-3 mb-8">
        <Settings className="text-gray-400" size={24} />
        <h1 className="text-2xl font-bold tracking-wide">Configuration</h1>
      </div>

      <div className="bg-[#131f33] rounded-xl border border-gray-800 shadow-lg p-6 max-w-2xl">
        <div className="space-y-6">
          {/* Toggle FinBERT */}
          <div className="flex justify-between items-center pb-4 border-b border-gray-800">
            <div>
              <h3 className="font-semibold text-sm">Mode IA FinBERT</h3>
              <p className="text-xs text-gray-500 mt-1">Active l'analyse de sentiment automatique sur les news</p>
            </div>
            <div
              onClick={() => setFinbertEnabled(!finbertEnabled)}
              className={`w-12 h-6 rounded-full relative cursor-pointer transition-colors duration-300 ${
                finbertEnabled ? "bg-blue-500" : "bg-gray-600"
              }`}
            >
              <div
                className={`w-4 h-4 bg-white rounded-full absolute top-1 shadow transition-all duration-300 ${
                  finbertEnabled ? "right-1" : "left-1"
                }`}
              ></div>
            </div>
          </div>

          {/* Toggle AutoEncoder */}
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-semibold text-sm">Détection d'anomalies (AutoEncoder)</h3>
              <p className="text-xs text-gray-500 mt-1">Active l'analyse IA pour détecter les comportements de marché inhabituels</p>
            </div>
            <div
              onClick={() => setAutoEncoderEnabled(!autoEncoderEnabled)}
              className={`w-12 h-6 rounded-full relative cursor-pointer transition-colors duration-300 ${
                autoEncoderEnabled ? "bg-blue-500" : "bg-gray-600"
              }`}
            >
              <div
                className={`w-4 h-4 bg-white rounded-full absolute top-1 shadow transition-all duration-300 ${
                  autoEncoderEnabled ? "right-1" : "left-1"
                }`}
              ></div>
            </div>
          </div>
        </div>

        {/* Status indicators */}
        <div className="mt-6 pt-4 border-t border-gray-800 space-y-2">
          <div className="flex items-center gap-2 text-xs">
            <div className={`w-2 h-2 rounded-full ${finbertEnabled ? "bg-green-400" : "bg-red-400"}`}></div>
            <span className="text-gray-400">
              Sentiment FinBERT : <span className={finbertEnabled ? "text-green-400" : "text-red-400"}>{finbertEnabled ? "Actif" : "Désactivé"}</span>
            </span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <div className={`w-2 h-2 rounded-full ${autoEncoderEnabled ? "bg-green-400" : "bg-red-400"}`}></div>
            <span className="text-gray-400">
              AutoEncoder : <span className={autoEncoderEnabled ? "text-green-400" : "text-red-400"}>{autoEncoderEnabled ? "Actif" : "Désactivé"}</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Config;
