import React from 'react';
import { Category } from '../../types';
import { useLanguage, getCategoryName } from '../../services/i18n';

interface CategoryPillsProps {
  categories: Category[];
  selectedCategoryId: string | null;
  onSelectCategory: (categoryId: string | null) => void;
}

export const CategoryPills: React.FC<CategoryPillsProps> = ({
  categories,
  selectedCategoryId,
  onSelectCategory,
}) => {
  const { t, lang } = useLanguage();

  return (
    <div className="w-full overflow-x-auto no-scrollbar py-2 px-4">
      <div className="flex items-center gap-2 max-w-5xl mx-auto min-w-max">
        {/* All / Tous Button */}
        <button
          onClick={() => onSelectCategory(null)}
          className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold tracking-wide transition-all border ${
            selectedCategoryId === null
              ? 'bg-[#0A0A0A] text-white border-[#0A0A0A] shadow-sm'
              : 'bg-white text-[#0A0A0A] border-[#EAEAEA] hover:border-[#0A0A0A]'
          }`}
        >
          <span>{t.allCategories}</span>
        </button>

        {/* Dynamic Categories */}
        {categories
          .filter(cat => cat.isActive)
          .map(cat => {
            const isSelected = selectedCategoryId === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => onSelectCategory(cat.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold tracking-wide transition-all border whitespace-nowrap ${
                  isSelected
                    ? 'bg-[#0A0A0A] text-white border-[#0A0A0A] shadow-sm'
                    : 'bg-white text-[#0A0A0A] border-[#EAEAEA] hover:border-[#0A0A0A]'
                }`}
              >
                {cat.icon && <span className="text-xs">{cat.icon}</span>}
                <span>{getCategoryName(cat, lang)}</span>
              </button>
            );
          })}
      </div>
    </div>
  );
};
