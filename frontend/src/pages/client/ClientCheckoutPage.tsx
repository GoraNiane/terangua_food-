import React, { useState } from 'react';
import { ArrowLeft, Send, Utensils, ShoppingBag, MapPin, Phone, User, MessageSquare, AlertCircle } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { useRestaurantStore } from '../../store/restaurantStore';
import { OrderType } from '../../types';
import { formatFCFA, generateWhatsAppUrl } from '../../services/whatsappService';
import { useLanguage, getProductName, getOptionItemName } from '../../services/i18n';

export const ClientCheckoutPage: React.FC = () => {
  const { cart, cartTotal, restaurant, activeTable, createOrder } = useRestaurantStore();
  const { t, lang } = useLanguage();
  const navigate = useNavigate();

  const [orderType, setOrderType] = useState<OrderType>(activeTable ? 'DINE_IN' : 'DINE_IN');
  const [tableNumber, setTableNumber] = useState(activeTable || '');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [notes, setNotes] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Delivery fee
  const deliveryFee = orderType === 'DELIVERY' ? 1500 : 0;
  const grandTotal = cartTotal + deliveryFee;

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] text-[#0A0A0A] flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white p-8 rounded-3xl text-center space-y-4 border border-[#EAEAEA] shadow-card">
          <div className="w-14 h-14 rounded-full bg-[#F3F3F3] mx-auto flex items-center justify-center text-[#0A0A0A]">
            <ShoppingBag className="w-6 h-6" />
          </div>
          <h2 className="font-sans font-bold text-xl text-[#0A0A0A]">{t.emptyCartTitle}</h2>
          <p className="text-xs text-[#8A8A8A]">
            {t.emptyCartCheckoutNotice}
          </p>
          <Link
            to="/menu"
            className="inline-block px-6 py-3 rounded-xl bg-[#0A0A0A] text-white font-bold text-xs hover:bg-[#262626] transition-all"
          >
            {t.backToMenuBtn}
          </Link>
        </div>
      </div>
    );
  }

  const validate = () => {
    const errs: Record<string, string> = {};

    if (!customerName.trim()) {
      errs.customerName = t.validationNameRequired;
    }

    if (!customerPhone.trim()) {
      errs.customerPhone = t.validationPhoneRequired;
    } else if (customerPhone.replace(/[^0-9]/g, '').length < 8) {
      errs.customerPhone = t.validationPhoneInvalid;
    }

    if (orderType === 'DINE_IN' && !tableNumber.trim()) {
      errs.tableNumber = t.validationTableRequired;
    }

    if (orderType === 'DELIVERY' && !deliveryAddress.trim()) {
      errs.deliveryAddress = t.validationAddressRequired;
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);

    const orderItems = cart.map(item => ({
      productId: item.productId,
      name: item.name,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      totalPrice: item.unitPrice * item.quantity,
      selectedOptionsText: item.selectedOptions.map(o => o.optionName).join(', ') || undefined,
    }));

    const normalizedTable =
      orderType === 'DINE_IN' && tableNumber
        ? String(tableNumber.trim()).padStart(2, '0')
        : undefined;

    // 1. Create order in central store
    const createdOrder = createOrder({
      customerName: customerName.trim(),
      customerPhone: customerPhone.trim(),
      orderType,
      tableNumber: normalizedTable,
      deliveryAddress: orderType === 'DELIVERY' ? deliveryAddress.trim() : undefined,
      notes: notes.trim() || undefined,
      items: orderItems,
      subtotal: cartTotal,
      deliveryFee,
      total: grandTotal,
    });

    // 2. Build WhatsApp URL
    const whatsappUrl = generateWhatsAppUrl(createdOrder, restaurant);

    // 3. Ouvrir WhatsApp si disponible
    try {
      window.open(whatsappUrl, '_blank');
    } catch {
      // Ignorer si popup bloqué
    }

    // 4. Navigate to confirmation screen
    navigate(`/order-confirmation/${createdOrder.id}`);
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-[#0A0A0A] pb-16">
      {/* Header */}
      <header className="bg-white border-b border-[#EEEEEE] px-4 py-3.5 sticky top-0 z-30">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-1.5 text-xs font-semibold text-[#8A8A8A] hover:text-[#0A0A0A] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{t.backBtn}</span>
          </button>
          <span className="font-sans font-bold text-sm text-[#0A0A0A]">
            {t.checkoutHeaderTitle}
          </span>
          <div className="w-12" />
        </div>
      </header>

      {/* Visual Stepper: 01 Panier • 02 Informations • 03 Confirmation */}
      <div className="bg-white border-b border-[#EEEEEE]">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-center gap-6 sm:gap-10 text-xs font-medium">
          <div className="flex items-center gap-1.5 text-[#8A8A8A]">
            <span className="w-5 h-5 rounded-full bg-[#EAEAEA] text-[#0A0A0A] flex items-center justify-center text-[10px] font-bold">
              01
            </span>
            <span>{t.stepCartLabel}</span>
          </div>
          <span className="text-[#EAEAEA]">—</span>
          <div className="flex items-center gap-1.5 text-[#0A0A0A] font-bold">
            <span className="w-5 h-5 rounded-full bg-[#0A0A0A] text-white flex items-center justify-center text-[10px] font-bold">
              02
            </span>
            <span>{t.stepInfoLabel}</span>
          </div>
          <span className="text-[#EAEAEA]">—</span>
          <div className="flex items-center gap-1.5 text-[#8A8A8A]">
            <span className="w-5 h-5 rounded-full bg-[#EAEAEA] text-[#8A8A8A] flex items-center justify-center text-[10px] font-bold">
              03
            </span>
            <span>{t.stepConfirmLabel}</span>
          </div>
        </div>
      </div>

      <main className="max-w-2xl mx-auto px-4 pt-6 space-y-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Section 1: Type de commande */}
          <div className="bg-white border border-[#EAEAEA] p-5 sm:p-6 rounded-2xl shadow-soft space-y-3">
            <label className="text-xs uppercase tracking-wider text-[#0A0A0A] font-bold block">
              1. {t.orderTypeTitle}
            </label>

            <div className="grid grid-cols-3 gap-2.5">
              {/* Sur place */}
              <button
                type="button"
                onClick={() => setOrderType('DINE_IN')}
                className={`p-3.5 rounded-xl border flex flex-col items-center gap-2 text-center transition-all ${
                  orderType === 'DINE_IN'
                    ? 'bg-[#0A0A0A] text-white border-[#0A0A0A] font-bold shadow-sm'
                    : 'bg-white border-[#EAEAEA] text-[#0A0A0A] hover:border-[#0A0A0A]'
                }`}
              >
                <div className={`w-7 h-7 rounded-full flex items-center justify-center ${orderType === 'DINE_IN' ? 'bg-white/20 text-white' : 'bg-[#F3F3F3] text-[#0A0A0A]'}`}>
                  <Utensils className="w-3.5 h-3.5" />
                </div>
                <span className="text-xs">{t.dineIn}</span>
              </button>

              {/* À emporter */}
              <button
                type="button"
                onClick={() => setOrderType('TAKEAWAY')}
                className={`p-3.5 rounded-xl border flex flex-col items-center gap-2 text-center transition-all ${
                  orderType === 'TAKEAWAY'
                    ? 'bg-[#0A0A0A] text-white border-[#0A0A0A] font-bold shadow-sm'
                    : 'bg-white border-[#EAEAEA] text-[#0A0A0A] hover:border-[#0A0A0A]'
                }`}
              >
                <div className={`w-7 h-7 rounded-full flex items-center justify-center ${orderType === 'TAKEAWAY' ? 'bg-white/20 text-white' : 'bg-[#F3F3F3] text-[#0A0A0A]'}`}>
                  <ShoppingBag className="w-3.5 h-3.5" />
                </div>
                <span className="text-xs">{t.takeaway}</span>
              </button>

              {/* Livraison */}
              <button
                type="button"
                onClick={() => setOrderType('DELIVERY')}
                className={`p-3.5 rounded-xl border flex flex-col items-center gap-2 text-center transition-all ${
                  orderType === 'DELIVERY'
                    ? 'bg-[#0A0A0A] text-white border-[#0A0A0A] font-bold shadow-sm'
                    : 'bg-white border-[#EAEAEA] text-[#0A0A0A] hover:border-[#0A0A0A]'
                }`}
              >
                <div className={`w-7 h-7 rounded-full flex items-center justify-center ${orderType === 'DELIVERY' ? 'bg-white/20 text-white' : 'bg-[#F3F3F3] text-[#0A0A0A]'}`}>
                  <MapPin className="w-3.5 h-3.5" />
                </div>
                <span className="text-xs">{t.delivery}</span>
              </button>
            </div>
          </div>

          {/* Section 2: Détails client & coordonnées */}
          <div className="bg-white border border-[#EAEAEA] p-5 sm:p-6 rounded-2xl shadow-soft space-y-4">
            <h3 className="text-xs uppercase tracking-wider text-[#0A0A0A] font-bold">
              2. {t.customerInfoTitle}
            </h3>

            {/* Table if Dine In */}
            {orderType === 'DINE_IN' && (
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs text-[#0A0A0A] font-bold flex items-center gap-1.5">
                    <Utensils className="w-3.5 h-3.5 text-[#0A0A0A]" />
                    <span>{t.tableNumberLabel} *</span>
                  </label>
                  {tableNumber && (
                    <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                      Table {tableNumber.length === 1 ? `0${tableNumber}` : tableNumber}
                    </span>
                  )}
                </div>
                <input
                  type="text"
                  value={tableNumber}
                  onChange={e => setTableNumber(e.target.value)}
                  placeholder={t.tableNumberPlaceholder}
                  className="w-full bg-[#FAFAFA] border border-[#EAEAEA] focus:border-[#0A0A0A] focus:bg-white rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-[#0A0A0A] font-semibold outline-none transition-colors"
                />
                {errors.tableNumber && (
                  <p className="text-[11px] text-red-600 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> {errors.tableNumber}
                  </p>
                )}
              </div>
            )}

            {/* Delivery address if Delivery */}
            {orderType === 'DELIVERY' && (
              <div className="space-y-1.5">
                <label className="text-xs text-[#0A0A0A] font-medium flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-[#0A0A0A]" />
                  <span>{t.deliveryAddressLabel} *</span>
                </label>
                <textarea
                  value={deliveryAddress}
                  onChange={e => setDeliveryAddress(e.target.value)}
                  rows={2}
                  placeholder={t.deliveryAddressPlaceholder}
                  className="w-full bg-[#FAFAFA] border border-[#EAEAEA] focus:border-[#0A0A0A] focus:bg-white rounded-xl p-3 text-xs sm:text-sm text-[#0A0A0A] outline-none resize-none transition-colors"
                />
                {errors.deliveryAddress && (
                  <p className="text-[11px] text-red-600 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> {errors.deliveryAddress}
                  </p>
                )}
              </div>
            )}

            {/* Name */}
            <div className="space-y-1.5">
              <label className="text-xs text-[#0A0A0A] font-medium flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-[#0A0A0A]" />
                <span>{t.customerNameLabel} *</span>
              </label>
              <input
                type="text"
                value={customerName}
                onChange={e => setCustomerName(e.target.value)}
                placeholder={t.customerNamePlaceholder}
                className="w-full bg-[#FAFAFA] border border-[#EAEAEA] focus:border-[#0A0A0A] focus:bg-white rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-[#0A0A0A] outline-none transition-colors"
              />
              {errors.customerName && (
                <p className="text-[11px] text-red-600 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" /> {errors.customerName}
                </p>
              )}
            </div>

            {/* Phone */}
            <div className="space-y-1.5">
              <label className="text-xs text-[#0A0A0A] font-medium flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-[#0A0A0A]" />
                <span>{t.customerPhoneLabel} *</span>
              </label>
              <input
                type="tel"
                value={customerPhone}
                onChange={e => setCustomerPhone(e.target.value)}
                placeholder={t.customerPhonePlaceholder}
                className="w-full bg-[#FAFAFA] border border-[#EAEAEA] focus:border-[#0A0A0A] focus:bg-white rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-[#0A0A0A] outline-none transition-colors"
              />
              {errors.customerPhone && (
                <p className="text-[11px] text-red-600 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" /> {errors.customerPhone}
                </p>
              )}
            </div>

            {/* Special notes */}
            <div className="space-y-1.5">
              <label className="text-xs text-[#8A8A8A] font-medium flex items-center gap-1.5">
                <MessageSquare className="w-3.5 h-3.5 text-[#8A8A8A]" />
                <span>{t.notesLabel}</span>
              </label>
              <input
                type="text"
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder={t.notesPlaceholder}
                className="w-full bg-[#FAFAFA] border border-[#EAEAEA] focus:border-[#0A0A0A] focus:bg-white rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-[#0A0A0A] outline-none transition-colors"
              />
            </div>
          </div>

          {/* Section 3: Récapitulatif */}
          <div className="bg-white border border-[#EAEAEA] p-5 sm:p-6 rounded-2xl shadow-soft space-y-3">
            <h3 className="text-xs uppercase tracking-wider text-[#0A0A0A] font-bold">
              3. {t.orderSummaryTitle}
            </h3>

            <div className="divide-y divide-[#EEEEEE] text-xs space-y-2">
              {cart.map(item => (
                <div key={item.id} className="pt-2 flex justify-between items-start gap-2">
                  <div>
                    <span className="text-[#0A0A0A] font-semibold">
                      {getProductName({ id: item.productId, name: item.name }, lang)}
                    </span>
                    <span className="text-[#8A8A8A] ml-1.5">× {item.quantity}</span>
                    {item.selectedOptions.length > 0 && (
                      <p className="text-[11px] text-[#8A8A8A]">
                        {item.selectedOptions.map(o => getOptionItemName(o.optionName, lang)).join(', ')}
                      </p>
                    )}
                  </div>
                  <span className="font-bold text-[#0A0A0A] shrink-0">
                    {formatFCFA(item.unitPrice * item.quantity)}
                  </span>
                </div>
              ))}

              <div className="pt-3 space-y-1.5">
                <div className="flex justify-between text-[#8A8A8A]">
                  <span>{t.subtotalLabel}</span>
                  <span>{formatFCFA(cartTotal)}</span>
                </div>
                {orderType === 'DELIVERY' && (
                  <div className="flex justify-between text-[#8A8A8A]">
                    <span>{t.deliveryFeeLabel} (Dakar)</span>
                    <span className="text-[#0A0A0A] font-medium">{formatFCFA(deliveryFee)}</span>
                  </div>
                )}
                <div className="flex justify-between text-base font-extrabold text-[#0A0A0A] pt-2 border-t border-[#EEEEEE]">
                  <span>{t.totalToPayLabel}</span>
                  <span className="text-[#0A0A0A] text-lg font-black">{formatFCFA(grandTotal)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* WhatsApp Submit Action */}
          <div className="space-y-2.5">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex items-center justify-center gap-3 py-4 px-6 rounded-xl bg-[#0A0A0A] hover:bg-[#262626] text-white font-bold text-sm sm:text-base tracking-wide transition-all shadow-sm active:scale-98"
            >
              <Send className="w-4 h-4 fill-white" />
              <span>{t.confirmWhatsAppBtn.toUpperCase()}</span>
            </button>
            <p className="text-[11px] text-center text-[#8A8A8A]">
              {t.whatsAppOrderNotice.replace('{name}', restaurant.name)}
            </p>
          </div>
        </form>
      </main>
    </div>
  );
};
