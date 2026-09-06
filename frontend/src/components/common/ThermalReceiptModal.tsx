import React, { useRef } from 'react';
import { X, Printer, Share2, Check, Utensils, MapPin, Clock } from 'lucide-react';
import { Order } from '../../types';
import { formatFCFA } from '../../services/whatsappService';
import { useRestaurantStore } from '../../store/restaurantStore';

interface ThermalReceiptModalProps {
  order: Order | null;
  isOpen: boolean;
  onClose: () => void;
}

export const ThermalReceiptModal: React.FC<ThermalReceiptModalProps> = ({ order, isOpen, onClose }) => {
  const { restaurant } = useRestaurantStore();
  const receiptRef = useRef<HTMLDivElement>(null);

  if (!isOpen || !order) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleShareWhatsApp = () => {
    const cleanPhone = order.customerPhone.replace(/[^0-9]/g, '');
    const phoneWithCountry = cleanPhone.startsWith('221') ? cleanPhone : `221${cleanPhone}`;
    const itemsList = order.items
      .map(i => `• ${i.quantity}x ${i.name} (${formatFCFA(i.totalPrice)})`)
      .join('\n');
    const msg = encodeURIComponent(
      `🧾 *TICKET DE CAISSE #${order.id}*\n` +
      `🍽️ *${restaurant.name}*\n` +
      `📅 ${new Date(order.createdAt).toLocaleString('fr-FR')}\n\n` +
      `Client : ${order.customerName}\n` +
      `Mode : ${order.orderType === 'DINE_IN' ? `Sur place (Table ${order.tableNumber})` : order.orderType === 'DELIVERY' ? `Livraison (${order.deliveryAddress})` : 'À emporter'}\n\n` +
      `*Détail de la commande :*\n${itemsList}\n\n` +
      `*TOTAL RÉGLÉ : ${formatFCFA(order.total)}*\n\n` +
      `Merci de votre confiance et bon appétit ! 🌟`
    );
    window.open(`https://wa.me/${phoneWithCountry}?text=${msg}`, '_blank');
  };

  const formattedDate = new Date(order.createdAt).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
  const formattedTime = new Date(order.createdAt).toLocaleTimeString('fr-FR', {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in no-print">
      <div
        className="w-full max-w-sm bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[95vh] border border-[#EAEAEA]"
        onClick={e => e.stopPropagation()}
      >
        {/* Modal Action Header */}
        <div className="p-4 border-b border-[#EEEEEE] flex items-center justify-between bg-[#FAFAFA]">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-[#0A0A0A] text-white flex items-center justify-center font-bold">
              <Printer className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-[#0A0A0A]">Ticket Thermique (80mm)</h3>
              <p className="text-[11px] text-[#666666]">Format standard de caisse</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-[#0A0A0A] flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Receipt Body (Styled as realistic 80mm thermal receipt) */}
        <div className="p-5 overflow-y-auto bg-gray-50 flex justify-center">
          <div
            id="printable-thermal-receipt"
            ref={receiptRef}
            className="w-full max-w-[300px] bg-white p-5 border border-dashed border-gray-300 rounded-lg shadow-sm font-mono text-xs text-[#0A0A0A] space-y-3 selection:bg-black selection:text-white"
          >
            {/* Header */}
            <div className="text-center space-y-1 pb-2 border-b border-dashed border-gray-300">
              <h2 className="font-black text-sm tracking-wider uppercase">{restaurant.name}</h2>
              <p className="text-[10px] text-gray-500">{restaurant.address}</p>
              <p className="text-[10px] text-gray-500">Tél: {restaurant.phone}</p>
              <p className="text-[10px] text-gray-500">Dakar, Sénégal</p>
            </div>

            {/* Ticket Info */}
            <div className="text-[11px] space-y-0.5 border-b border-dashed border-gray-300 pb-2">
              <div className="flex justify-between font-bold">
                <span>TICKET N° {order.id}</span>
                <span>{formattedTime}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Date: {formattedDate}</span>
                <span>Caisse: 01</span>
              </div>
              <div className="pt-1 flex items-center gap-1 font-semibold text-black">
                {order.orderType === 'DINE_IN' ? (
                  <>
                    <Utensils className="w-3 h-3" />
                    <span>SUR PLACE — TABLE {order.tableNumber}</span>
                  </>
                ) : order.orderType === 'DELIVERY' ? (
                  <>
                    <MapPin className="w-3 h-3" />
                    <span>LIVRAISON</span>
                  </>
                ) : (
                  <>
                    <Clock className="w-3 h-3" />
                    <span>À EMPORTER</span>
                  </>
                )}
              </div>
              <div className="text-gray-600">
                Client: <span className="font-semibold text-black">{order.customerName}</span> ({order.customerPhone})
              </div>
              {order.deliveryAddress && (
                <div className="text-gray-600 text-[10px]">
                  Adresse: {order.deliveryAddress}
                </div>
              )}
            </div>

            {/* Line Items Table */}
            <div className="space-y-1.5 border-b border-dashed border-gray-300 pb-2">
              <div className="flex justify-between font-bold text-[10px] text-gray-500 uppercase pb-0.5 border-b border-gray-200">
                <span>Article</span>
                <span>Total</span>
              </div>
              {order.items.map((item, idx) => (
                <div key={idx} className="space-y-0.5">
                  <div className="flex justify-between items-baseline">
                    <span className="font-semibold">
                      {item.quantity}x {item.name}
                    </span>
                    <span className="font-bold">{formatFCFA(item.totalPrice)}</span>
                  </div>
                  {item.selectedOptionsText && (
                    <p className="text-[9px] text-gray-500 pl-3">↳ {item.selectedOptionsText}</p>
                  )}
                </div>
              ))}
            </div>

            {/* Totals */}
            <div className="space-y-1 border-b border-dashed border-gray-300 pb-2 text-[11px]">
              <div className="flex justify-between text-gray-600">
                <span>Sous-total:</span>
                <span>{formatFCFA(order.subtotal)}</span>
              </div>
              {order.deliveryFee > 0 && (
                <div className="flex justify-between text-gray-600">
                  <span>Frais de livraison:</span>
                  <span>{formatFCFA(order.deliveryFee)}</span>
                </div>
              )}
              <div className="flex justify-between font-black text-sm pt-1 text-black">
                <span>TOTAL TTC:</span>
                <span>{formatFCFA(order.total)}</span>
              </div>
              <div className="flex justify-between text-[10px] text-gray-500 pt-0.5">
                <span>Mode règlement:</span>
                <span>Espèces / Wave / OM</span>
              </div>
            </div>

            {/* Simulated Barcode / QR Section */}
            <div className="text-center pt-1 space-y-1">
              <div className="inline-block px-3 py-1 bg-gray-100 rounded text-[9px] tracking-widest font-mono text-gray-700">
                *TF-{order.id}-{order.customerPhone.slice(-4)}*
              </div>
              <p className="text-[9px] text-gray-500 font-sans italic">
                Merci de votre visite et à très bientôt !
              </p>
              <p className="text-[8px] text-gray-400 font-sans">
                Propulsé par TERANGA FOOD by GORATECH
              </p>
            </div>
          </div>
        </div>

        {/* Footer Buttons */}
        <div className="p-4 border-t border-[#EEEEEE] bg-white flex items-center gap-2">
          <button
            onClick={handlePrint}
            className="flex-1 py-3 px-4 rounded-xl bg-[#0A0A0A] hover:bg-[#222222] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all active:scale-95"
          >
            <Printer className="w-4 h-4" />
            <span>Imprimer (80mm)</span>
          </button>

          <button
            onClick={handleShareWhatsApp}
            className="py-3 px-4 rounded-xl bg-gray-100 hover:bg-gray-200 text-[#0A0A0A] font-bold text-xs flex items-center justify-center gap-2 transition-colors active:scale-95"
            title="Envoyer au client par WhatsApp"
          >
            <Share2 className="w-4 h-4" />
            <span>WhatsApp</span>
          </button>
        </div>
      </div>
    </div>
  );
};
