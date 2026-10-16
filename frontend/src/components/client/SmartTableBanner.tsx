import React from 'react';
import { Utensils, CheckCircle2, QrCode } from 'lucide-react';
import { useRestaurantStore } from '../../store/restaurantStore';
import { useLanguage } from '../../services/i18n';

export const SmartTableBanner: React.FC = () => {
  const { activeTable, setActiveTable } = useRestaurantStore();
  const { t } = useLanguage();

  if (!activeTable) return null;

  return (
    <div className="bg-gradient-to-r from-[#0A0A0A] via-[#1A1A1A] to-[#0A0A0A] text-white px-4 py-3 border-b border-black/40 shadow-sm animate-fade-in">
      <div className="max-w-5xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-white text-[#0A0A0A] flex items-center justify-center font-black text-sm shrink-0 shadow-sm">
            <Utensils className="w-4 h-4 text-[#0A0A0A]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-black uppercase tracking-wider text-white">
                Commande sur place — Table {activeTable}
              </span>
              <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Table active
              </span>
            </div>
            <p className="text-[11px] text-[#BBBBBB] mt-0.5">
              Vos plats commandés sur cette page seront servis directement à votre table {activeTable}.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => {
            const newTable = prompt(t.tableChangePrompt, activeTable);
            if (newTable !== null) setActiveTable(newTable.trim() || null);
          }}
          className="self-end sm:self-center text-[11px] font-bold text-white/80 hover:text-white underline hover:no-underline px-2.5 py-1 rounded-lg hover:bg-white/10 transition-colors whitespace-nowrap"
        >
          {t.changeBtn}
        </button>
      </div>
    </div>
  );
};
