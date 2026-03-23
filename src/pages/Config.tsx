import { Settings, Save } from "lucide-react";

const Config = () => (
  <div className="p-4 sm:p-8 text-white min-h-screen" style={{ backgroundColor: "#0b1220" }}>
    <div className="flex items-center gap-3 mb-8">
      <Settings className="text-gray-400" size={24} />
      <h1 className="text-2xl font-bold tracking-wide">Configuration</h1>
    </div>

    <div className="bg-[#131f33] rounded-xl border border-gray-800 shadow-lg p-6 max-w-2xl">
      <div className="space-y-6">
        <div className="flex justify-between items-center pb-4 border-b border-gray-800">
          <div>
            <h3 className="font-semibold text-sm">Mode IA FinBERT</h3>
            <p className="text-xs text-gray-500 mt-1">Active l'analyse de sentiment automatique sur les news</p>
          </div>
          <div className="w-12 h-6 bg-blue-500 rounded-full relative cursor-pointer">
            <div className="w-4 h-4 bg-white rounded-full absolute top-1 right-1 shadow"></div>
          </div>
        </div>
        
        <div className="flex justify-between items-center pb-4 border-b border-gray-800">
          <div>
            <h3 className="font-semibold text-sm">Notifications Push</h3>
            <p className="text-xs text-gray-500 mt-1">Recevoir des alertes de sentinelles sur téléphone</p>
          </div>
          <div className="w-12 h-6 bg-blue-500 rounded-full relative cursor-pointer">
            <div className="w-4 h-4 bg-white rounded-full absolute top-1 right-1 shadow"></div>
          </div>
        </div>

        <div className="flex justify-between items-center">
          <div>
            <h3 className="font-semibold text-sm">Tolérance au risque</h3>
            <p className="text-xs text-gray-500 mt-1">Ajuste la sensibilité des signaux d'achat/vente</p>
          </div>
          <select className="bg-[#0b1220] border border-gray-700 text-sm rounded-lg p-2 text-white outline-none cursor-pointer hover:border-blue-500 transition-colors">
            <option>Modéré</option>
            <option>Conservateur</option>
            <option>Agressif</option>
            <option>Degen</option>
          </select>
        </div>
      </div>

      <button className="mt-8 w-full bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold py-3 rounded-lg flex items-center justify-center gap-2 transition-colors">
        <Save size={16} /> Enregistrer les changements
      </button>
    </div>
  </div>
);

export default Config;
