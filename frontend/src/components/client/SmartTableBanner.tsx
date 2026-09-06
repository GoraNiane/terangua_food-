import React from 'react';
import { Utensils } from 'lucide-react';
import { useRestaurantStore } from '../../store/restaurantStore';
import { useLanguage } from '../../services/i18n';

export const SmartTableBanner: React.FC = () => {
  const { activeTable, setActiveTable } = useRestaurantStore();
  const { t } = useLanguage();

  if (!activeTable) return null;

  return (
    <div className="bg-[#F8F8F8] border-y border-[#EAEAEA] px-4 py-2.5 animate-fade-in">
      <div className="max-w-5xl mx-auto flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-full bg-[#0A0A0A] text-white flex items-center justify-center font-bold text-xs">
            <Utensils className="w-3.5 h-3.5" />
          </div>
          <div>
            <p className="text-xs font-bold text-[#0A0A0A]">
              {t.welcomeTableTitle} {activeTable} 👋
            </p>
            <p className="text-[11px] text-[#8A8A8A]">
              {t.welcomeTableDesc}
            </p>
          </div>
        </div>

        <button
          onClick={() => {
            const newTable = prompt(t.tableChangePrompt, activeTable);
            if (newTable !== null) setActiveTable(newTable.trim() || null);
          }}
          className="text-[11px] text-[#0A0A0A] hover:underline font-semibold whitespace-nowrap"
        >
          {t.changeBtn}
        </button>
      </div>
    </div>
  );
};
