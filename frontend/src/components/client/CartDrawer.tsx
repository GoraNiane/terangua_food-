import React from 'react';
import { X, Trash2, Plus, Minus, ArrowRight, ShoppingBag, Utensils } from 'lucide-react';
import { useRestaurantStore } from '../../store/restaurantStore';
import { formatFCFA } from '../../services/whatsappService';
import { useNavigate } from 'react-router-dom';
import { useLanguage, getProductName, getOptionItemName } from '../../services/i18n';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({ isOpen, onClose }) => {
  const { cart, updateCartQuantity, removeFromCart, clearCart, cartTotal } =
    useRestaurantStore();
  const { t, lang } = useLanguage();
  const navigate = useNavigate();

  if (!isOpen) return null;

  const handleCheckoutClick = () => {
    onClose();
    navigate('/checkout');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity animate-fade-in"
      />

      {/* Slide Drawer */}
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-6 sm:pl-10">
        <div className="w-screen max-w-md bg-white border-l border-[#EAEAEA] flex flex-col shadow-2xl">
          {/* Drawer Header */}
          <div className="p-4 sm:p-6 border-b border-[#EEEEEE] flex items-center justify-between bg-white">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-4 h-4 text-[#0A0A0A]" />
              <h2 className="font-sans font-black text-lg text-[#0A0A0A] tracking-tight uppercase">
                {t.cartTitle}
              </h2>
              <span className="text-xs bg-[#F3F3F3] text-[#0A0A0A] px-2.5 py-0.5 rounded-full font-bold">
                {cart.reduce((sum, i) => sum + i.quantity, 0)}
              </span>
            </div>

            <div className="flex items-center gap-2">
              {cart.length > 0 && (
                <button
                  onClick={() => {
                    if (confirm(t.clearCartConfirm)) clearCart();
                  }}
                  className="text-xs text-[#8A8A8A] hover:text-[#0A0A0A] px-2 py-1 transition-colors"
                >
                  {t.clearCartBtn}
                </button>
              )}
              <button
                onClick={onClose}
                aria-label={t.closeBtn}
                className="w-8 h-8 rounded-full bg-[#FAFAFA] hover:bg-[#EAEAEA] text-[#0A0A0A] flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Cart Items Content */}
          <div className="flex-1 overflow-y-auto no-scrollbar p-4 sm:p-6 bg-white">
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-4">
                <div className="w-14 h-14 rounded-full bg-[#F3F3F3] border border-[#EAEAEA] flex items-center justify-center text-[#0A0A0A]">
                  <Utensils className="w-6 h-6 opacity-70" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-[#0A0A0A]">
                    {t.emptyCartTitle}
                  </h3>
                  <p className="mt-1 text-xs text-[#8A8A8A] max-w-xs leading-relaxed">
                    {t.emptyCartDesc}
                  </p>
                </div>
                <button
                  onClick={onClose}
                  className="px-5 py-2.5 rounded-xl bg-[#0A0A0A] text-white text-xs font-bold hover:bg-[#262626] transition-all"
                >
                  {t.discoverMenuAction}
                </button>
              </div>
            ) : (
              <div className="divide-y divide-[#EEEEEE]">
                {cart.map(item => (
                  <div key={item.id} className="py-4 first:pt-0 last:pb-0 flex gap-3">
                    {/* Thumbnail */}
                    <img
                      src={item.imageUrl}
                      alt={item.name}
                      className="w-16 h-16 rounded-xl object-cover bg-[#FAFAFA] border border-[#EAEAEA] shrink-0"
                    />

                    {/* Info */}
                    <div className="flex-1 min-w-0 flex flex-col justify-between">
                      <div>
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="font-sans font-bold text-xs sm:text-sm text-[#0A0A0A] line-clamp-1">
                            {getProductName({ id: item.productId, name: item.name }, lang)}
                          </h4>
                          <button
                            onClick={() => removeFromCart(item.id)}
                            aria-label={t.clearCartBtn}
                            className="text-[#8A8A8A] hover:text-[#0A0A0A] p-0.5 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        {/* Options */}
                        {item.selectedOptions.length > 0 && (
                          <p className="mt-0.5 text-[11px] text-[#8A8A8A] line-clamp-1">
                            {item.selectedOptions.map(o => getOptionItemName(o.optionName, lang)).join(', ')}
                          </p>
                        )}

                        {item.notes && (
                          <p className="mt-0.5 text-[10px] text-[#555555] italic line-clamp-1">
                            « {item.notes} »
                          </p>
                        )}
                      </div>

                      {/* Quantity & Price */}
                      <div className="flex items-center justify-between mt-2 pt-2 border-t border-[#FAFAFA]">
                        <span className="text-xs sm:text-sm font-bold text-[#0A0A0A]">
                          {formatFCFA(item.unitPrice * item.quantity)}
                        </span>

                        <div className="flex items-center bg-[#FAFAFA] border border-[#EAEAEA] rounded-lg p-0.5">
                          <button
                            onClick={() => updateCartQuantity(item.id, -1)}
                            className="w-6 h-6 rounded flex items-center justify-center text-[#0A0A0A] hover:bg-white transition-all"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="w-6 text-center text-xs font-semibold text-[#0A0A0A]">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateCartQuantity(item.id, 1)}
                            className="w-6 h-6 rounded flex items-center justify-center text-[#0A0A0A] hover:bg-white transition-all"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Drawer Footer with Big Total & Black CTA */}
          {cart.length > 0 && (
            <div className="p-4 sm:p-6 border-t border-[#EEEEEE] bg-white space-y-4">
              <div className="space-y-1 text-xs">
                <div className="flex justify-between text-[#8A8A8A]">
                  <span>{t.serviceFeeLabel}</span>
                  <span className="text-[#0A0A0A] font-medium">{t.includedLabel}</span>
                </div>
                <div className="flex items-baseline justify-between pt-2 border-t border-[#EEEEEE]">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#8A8A8A]">
                    {t.totalLabel}
                  </span>
                  <span className="text-2xl sm:text-3xl font-black text-[#0A0A0A] tracking-tight">
                    {formatFCFA(cartTotal)}
                  </span>
                </div>
              </div>

              <button
                onClick={handleCheckoutClick}
                className="w-full flex items-center justify-center gap-2 py-4 px-4 rounded-xl bg-[#0A0A0A] hover:bg-[#262626] text-white font-bold text-xs sm:text-sm tracking-wider uppercase transition-all shadow-sm active:scale-98"
              >
                <span>{t.proceedToCheckout}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
