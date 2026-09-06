import React, { useState, useEffect } from 'react';
import { X, Minus, Plus, ShoppingBag, Check, Camera, Video } from 'lucide-react';
import { Product } from '../../types';
import { formatFCFA } from '../../services/whatsappService';
import { useRestaurantStore } from '../../store/restaurantStore';
import { VideoPlayer } from '../common/VideoPlayer';
import {
  useLanguage,
  getProductName,
  getProductDescription,
  getIngredientName,
  getOptionGroupName,
  getOptionItemName,
} from '../../services/i18n';

interface ProductModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
}

export const ProductModal: React.FC<ProductModalProps> = ({ product, isOpen, onClose }) => {
  const { addToCart } = useRestaurantStore();
  const { t, lang } = useLanguage();
  const [quantity, setQuantity] = useState(1);
  const [notes, setNotes] = useState('');
  const [selectedOptions, setSelectedOptions] = useState<
    Record<string, { optionName: string; extraPrice: number }[]>
  >({});
  const [addedAnimation, setAddedAnimation] = useState(false);
  const [activeMedia, setActiveMedia] = useState<'image' | 'video'>('image');

  // Initialize defaults whenever modal opens with a new product
  useEffect(() => {
    if (product) {
      setQuantity(1);
      setNotes('');
      setActiveMedia('image');
      const defaults: Record<string, { optionName: string; extraPrice: number }[]> = {};

      product.optionGroups?.forEach(group => {
        if (group.required && group.items.length > 0) {
          defaults[group.name] = [{ optionName: group.items[0].name, extraPrice: group.items[0].extraPrice }];
        } else {
          defaults[group.name] = [];
        }
      });
      setSelectedOptions(defaults);
      setAddedAnimation(false);
    }
  }, [product]);

  if (!isOpen || !product) return null;

  const handleOptionToggle = (
    groupName: string,
    item: { name: string; extraPrice: number },
    isSingleChoice: boolean
  ) => {
    setSelectedOptions(prev => {
      const current = prev[groupName] || [];
      if (isSingleChoice) {
        return {
          ...prev,
          [groupName]: [{ optionName: item.name, extraPrice: item.extraPrice }],
        };
      } else {
        const exists = current.some(opt => opt.optionName === item.name);
        if (exists) {
          return {
            ...prev,
            [groupName]: current.filter(opt => opt.optionName !== item.name),
          };
        } else {
          return {
            ...prev,
            [groupName]: [...current, { optionName: item.name, extraPrice: item.extraPrice }],
          };
        }
      }
    });
  };

  // Calculate unit price with selected options
  const extrasTotal = Object.values(selectedOptions)
    .flat()
    .reduce((sum, opt) => sum + opt.extraPrice, 0);
  const unitPrice = product.price + extrasTotal;
  const totalPrice = unitPrice * quantity;

  const handleAddToCart = () => {
    const flattenedOptions = Object.entries(selectedOptions).flatMap(([groupName, items]) =>
      items.map(i => ({ groupName, optionName: i.optionName, extraPrice: i.extraPrice }))
    );

    addToCart(product, quantity, flattenedOptions, notes.trim() || undefined);
    setAddedAnimation(true);
    setTimeout(() => {
      setAddedAnimation(false);
      onClose();
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
      <div
        className="relative w-full sm:max-w-3xl max-h-[92vh] flex flex-col bg-white border border-[#EAEAEA] rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          aria-label={t.closeBtn}
          className="absolute top-4 right-4 z-20 w-8 h-8 rounded-full bg-white/90 hover:bg-white text-[#0A0A0A] flex items-center justify-center border border-[#EAEAEA] shadow-sm transition-transform active:scale-90"
        >
          <X className="w-4 h-4" />
        </button>

        {/* 2-Columns Desktop Layout */}
        <div className="grid grid-cols-1 md:grid-cols-12 overflow-y-auto no-scrollbar pb-24 md:pb-0">
          {/* Left Column: Grande Photo ou Vidéo */}
          <div className="md:col-span-5 relative aspect-[16/10] md:aspect-auto md:min-h-[420px] bg-black border-b md:border-b-0 md:border-r border-[#EEEEEE] overflow-hidden flex items-center justify-center">
            {activeMedia === 'video' && product.videoUrl ? (
              <VideoPlayer
                url={product.videoUrl}
                title={getProductName(product, lang)}
                className="w-full h-full object-cover"
                autoPlay={true}
                muted={false}
                loop={true}
                controls={true}
              />
            ) : (
              <img
                src={product.imageUrl}
                alt={getProductName(product, lang)}
                className="w-full h-full object-cover"
              />
            )}

            {product.badge && (
              <div className="absolute top-4 left-4 z-10 bg-[#0A0A0A]/90 backdrop-blur-sm text-white px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-sm">
                <span>{t.specialtyPrefix} {product.badge}</span>
              </div>
            )}

            {/* Media toggle switcher if video exists */}
            {product.videoUrl && (
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-10 flex items-center bg-black/80 backdrop-blur-md p-1 rounded-full border border-white/20 shadow-lg text-white text-[11px] font-bold">
                <button
                  type="button"
                  onClick={() => setActiveMedia('image')}
                  className={`px-3 py-1 rounded-full transition-all flex items-center gap-1.5 ${
                    activeMedia === 'image'
                      ? 'bg-white text-[#0A0A0A] shadow-sm font-black'
                      : 'text-white/80 hover:text-white'
                  }`}
                >
                  <Camera className="w-3.5 h-3.5" />
                  <span>Photo</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveMedia('video')}
                  className={`px-3 py-1 rounded-full transition-all flex items-center gap-1.5 ${
                    activeMedia === 'video'
                      ? 'bg-white text-[#0A0A0A] shadow-sm font-black'
                      : 'text-white/80 hover:text-white'
                  }`}
                >
                  <Video className="w-3.5 h-3.5 text-amber-500" />
                  <span>Vidéo</span>
                </button>
              </div>
            )}
          </div>

          {/* Right Column: Détails & Options */}
          <div className="md:col-span-7 flex flex-col justify-between p-5 sm:p-6 space-y-5 bg-white">
            <div className="space-y-4">
              {/* Titre & Prix */}
              <div className="flex items-start justify-between gap-4 border-b border-[#EEEEEE] pb-3">
                <div>
                  <h2 className="font-sans font-extrabold text-xl sm:text-2xl text-[#0A0A0A]">
                    {getProductName(product, lang)}
                  </h2>
                  <p className="mt-1 text-xs sm:text-sm text-[#666666] leading-relaxed">
                    {getProductDescription(product, lang)}
                  </p>
                </div>
                <div className="text-right whitespace-nowrap">
                  <span className="text-xl sm:text-2xl font-black text-[#0A0A0A] tracking-tight">
                    {formatFCFA(product.price)}
                  </span>
                </div>
              </div>

              {/* Ingrédients */}
              {product.ingredients && product.ingredients.length > 0 && (
                <div className="space-y-1.5">
                  <span className="text-[10px] uppercase tracking-wider text-[#8A8A8A] font-bold">
                    {t.ingredientsLabel}
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {product.ingredients.map((ing, i) => (
                      <span
                        key={i}
                        className="text-xs bg-[#F3F3F3] border border-[#EAEAEA] px-2.5 py-0.5 rounded-full text-[#0A0A0A]"
                      >
                        {getIngredientName(ing, lang)}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Options */}
              {product.optionGroups && product.optionGroups.length > 0 && (
                <div className="space-y-4 pt-1">
                  {product.optionGroups.map(group => {
                    const isSingleChoice = group.maxSelect === 1;
                    const currentSelections = selectedOptions[group.name] || [];

                    return (
                      <div key={group.id} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <label className="text-xs uppercase tracking-wider text-[#0A0A0A] font-bold">
                            {getOptionGroupName(group.name, lang)}
                          </label>
                          <span className="text-[11px] text-[#8A8A8A]">
                            {group.required ? t.optionRequired : t.optionOptional}
                          </span>
                        </div>

                        <div className="grid grid-cols-1 gap-1.5">
                          {group.items.map(item => {
                            const isSelected = currentSelections.some(
                              opt => opt.optionName === item.name
                            );

                            return (
                              <button
                                key={item.id}
                                type="button"
                                onClick={() => handleOptionToggle(group.name, item, isSingleChoice)}
                                className={`flex items-center justify-between p-2.5 rounded-xl border transition-all text-left text-xs ${
                                  isSelected
                                    ? 'bg-[#0A0A0A] text-white border-[#0A0A0A] font-semibold'
                                    : 'bg-white border-[#EAEAEA] text-[#0A0A0A] hover:border-[#0A0A0A]'
                                }`}
                              >
                                <div className="flex items-center gap-2">
                                  <div
                                    className={`w-3.5 h-3.5 rounded-${
                                      isSingleChoice ? 'full' : 'sm'
                                    } border flex items-center justify-center ${
                                      isSelected
                                        ? 'border-white bg-white text-[#0A0A0A]'
                                        : 'border-[#8A8A8A]'
                                    }`}
                                  >
                                    {isSelected && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                                  </div>
                                  <span>{getOptionItemName(item.name, lang)}</span>
                                </div>

                                {item.extraPrice > 0 ? (
                                  <span className={isSelected ? 'text-white' : 'text-[#0A0A0A] font-bold'}>
                                    +{formatFCFA(item.extraPrice)}
                                  </span>
                                ) : (
                                  <span className={isSelected ? 'text-white/70' : 'text-[#8A8A8A] text-[11px]'}>
                                    {t.includedLabel}
                                  </span>
                                )}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Instructions particulières */}
              <div className="space-y-1.5 pt-1">
                <label className="text-[10px] uppercase tracking-wider text-[#8A8A8A] font-bold">
                  {t.instructionsLabel}
                </label>
                <textarea
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  rows={2}
                  placeholder={t.instructionsPlaceholder}
                  className="w-full bg-[#FAFAFA] border border-[#EAEAEA] focus:border-[#0A0A0A] focus:bg-white rounded-xl p-2.5 text-xs text-[#0A0A0A] placeholder:text-[#8A8A8A] outline-none resize-none transition-colors"
                />
              </div>
            </div>

            {/* Bottom Actions Desktop & Mobile */}
            <div className="pt-4 border-t border-[#EEEEEE] flex items-center gap-3">
              {/* [-] 1 [+] Stepper */}
              <div className="flex items-center bg-[#FAFAFA] border border-[#EAEAEA] rounded-xl p-1">
                <button
                  onClick={() => setQuantity(q => Math.max(1, q - 1))}
                  disabled={quantity <= 1}
                  aria-label="Diminuer"
                  className="w-7 h-7 rounded-lg flex items-center justify-center text-[#0A0A0A] hover:bg-white disabled:opacity-30 transition-all"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="w-7 text-center text-xs font-bold text-[#0A0A0A]">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity(q => q + 1)}
                  aria-label="Augmenter"
                  className="w-7 h-7 rounded-lg flex items-center justify-center text-[#0A0A0A] hover:bg-white transition-all"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* AJOUTER AU PANIER Button */}
              <button
                onClick={handleAddToCart}
                className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-bold text-xs sm:text-sm tracking-wide text-white transition-all shadow-sm active:scale-98 ${
                  addedAnimation
                    ? 'bg-[#0A0A0A] text-white'
                    : 'bg-[#0A0A0A] hover:bg-[#262626]'
                }`}
              >
                {addedAnimation ? (
                  <>
                    <Check className="w-4 h-4 stroke-[3]" />
                    <span>{t.addToCartBtn} ✓</span>
                  </>
                ) : (
                  <>
                    <ShoppingBag className="w-4 h-4" />
                    <span>{t.addToCartBtn} • {formatFCFA(totalPrice)}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
