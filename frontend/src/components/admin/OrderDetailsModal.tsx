import React, { useState } from 'react';
import {
  X,
  Phone,
  MessageSquare,
  Utensils,
  MapPin,
  Clock,
  Send,
  CheckCircle2,
  Printer,
  CreditCard,
  CheckCircle,
  XCircle,
  ShieldCheck,
} from 'lucide-react';
import { Order, OrderStatus } from '../../types';
import { formatFCFA } from '../../services/whatsappService';
import { OrderStatusBadge } from './OrderStatusBadge';
import { useRestaurantStore } from '../../store/restaurantStore';
import { ThermalReceiptModal } from '../common/ThermalReceiptModal';

interface OrderDetailsModalProps {
  order: Order | null;
  isOpen: boolean;
  onClose: () => void;
}

export const OrderDetailsModal: React.FC<OrderDetailsModalProps> = ({ order, isOpen, onClose }) => {
  const { updateOrderStatus, approveOrderPayment, rejectOrderPayment, restaurant } = useRestaurantStore();
  const [isThermalOpen, setIsThermalOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showRejectInput, setShowRejectInput] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');

  if (!isOpen || !order) return null;

  const handleStatusChange = (newStatus: OrderStatus) => {
    updateOrderStatus(order.id, newStatus);
  };

  const handleApprovePayment = async () => {
    setIsProcessing(true);
    try {
      await approveOrderPayment(order.id);
      onClose();
    } catch (e: any) {
      alert(e.message || "Erreur lors de l'approbation");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRejectPayment = async () => {
    if (!rejectionReason.trim() || rejectionReason.trim().length < 3) {
      alert('Veuillez indiquer un motif de rejet clair (au moins 3 caractères).');
      return;
    }
    setIsProcessing(true);
    try {
      await rejectOrderPayment(order.id, rejectionReason.trim());
      onClose();
    } catch (e: any) {
      alert(e.message || "Erreur lors du rejet");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleContactCustomer = () => {
    const cleanPhone = order.customerPhone.replace(/[^0-9]/g, '');
    const phoneWithCountry = cleanPhone.startsWith('221') ? cleanPhone : `221${cleanPhone}`;
    const text = encodeURIComponent(
      `Bonjour ${order.customerName} 👋\nIci l'équipe de ${restaurant.name}.\nConcernant votre commande #${order.id} : nous vous confirmons sa bonne prise en charge !`
    );
    window.open(`https://wa.me/${phoneWithCountry}?text=${text}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div
        className="w-full max-w-lg bg-white border border-[#EAEAEA] rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b border-[#EEEEEE] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h2 className="font-display font-black text-xl text-[#0A0A0A]">
              Commande #{order.id}
            </h2>
            <OrderStatusBadge status={order.status} size="md" />
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-[#0A0A0A] flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable body */}
        <div className="p-5 overflow-y-auto no-scrollbar space-y-5">
          {/* Customer & Type Card */}
          <div className="p-4 rounded-2xl bg-[#FAFAFA] border border-[#EAEAEA] space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="font-bold text-sm text-[#0A0A0A] block">
                  {order.customerName}
                </span>
                <span className="text-xs text-[#666666]">
                  {order.customerPhone}
                </span>
              </div>

              {order.orderType === 'DINE_IN' ? (
                <span className="bg-[#0A0A0A] text-white text-xs font-black px-3 py-1 rounded-full flex items-center gap-1.5">
                  <Utensils className="w-3 h-3" />
                  <span>TABLE {order.tableNumber}</span>
                </span>
              ) : order.orderType === 'DELIVERY' ? (
                <span className="bg-[#333333] text-white text-xs font-black px-3 py-1 rounded-full flex items-center gap-1.5">
                  <MapPin className="w-3 h-3" />
                  <span>LIVRAISON</span>
                </span>
              ) : (
                <span className="bg-[#EAEAEA] text-[#0A0A0A] text-xs font-black px-3 py-1 rounded-full">
                  À EMPORTER
                </span>
              )}
            </div>

            {order.deliveryAddress && (
              <p className="text-xs text-[#666666] flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-[#0A0A0A] shrink-0" />
                <span>Adresse : {order.deliveryAddress}</span>
              </p>
            )}

            {order.notes && (
              <div className="p-2.5 rounded-xl bg-white border border-[#EAEAEA] text-xs text-[#0A0A0A]">
                <span className="font-bold block text-[11px] text-[#888888] uppercase tracking-wider mb-0.5">Instructions client :</span>
                {order.notes}
              </div>
            )}

            <div className="flex items-center gap-2 pt-1">
              <button
                onClick={handleContactCustomer}
                className="flex-1 py-2 px-3 rounded-xl bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
              >
                <Send className="w-3.5 h-3.5" />
                <span>WhatsApp Client</span>
              </button>
              <a
                href={`tel:${order.customerPhone}`}
                className="p-2 rounded-xl border border-[#EAEAEA] text-[#0A0A0A] hover:bg-gray-100 transition-colors"
                title="Appeler le client"
              >
                <Phone className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Items List */}
          <div className="space-y-3">
            <h4 className="text-xs uppercase tracking-wider text-[#888888] font-bold">
              Articles commandés ({order.items.length})
            </h4>
            <div className="divide-y divide-[#EEEEEE] border-y border-[#EEEEEE]">
              {order.items.map((item, idx) => (
                <div key={idx} className="py-2.5 flex items-center justify-between text-xs">
                  <div className="space-y-0.5">
                    <span className="font-bold text-[#0A0A0A]">
                      {item.quantity}× {item.name}
                    </span>
                    {item.selectedOptionsText && (
                      <p className="text-[11px] text-[#666666]">
                        {item.selectedOptionsText}
                      </p>
                    )}
                  </div>
                  <span className="font-bold text-[#0A0A0A]">
                    {formatFCFA(item.totalPrice)}
                  </span>
                </div>
              ))}
            </div>

            <div className="pt-2 flex items-center justify-between text-sm font-black text-[#0A0A0A]">
              <span>TOTAL</span>
              <span>{formatFCFA(order.total)}</span>
            </div>

            {/* Print Thermal Receipt Button */}
            <button
              onClick={() => setIsThermalOpen(true)}
              className="w-full py-2.5 px-4 rounded-xl bg-[#0A0A0A] hover:bg-[#222222] text-white font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-sm active:scale-95"
            >
              <Printer className="w-4 h-4" />
              <span>Imprimer le ticket thermique (80mm)</span>
            </button>
          </div>

          {/* Bloc de validation du paiement Wave / OM pour le gérant */}
          {order.status === 'AWAITING_PAYMENT_VERIFICATION' && (
            <div className="p-4 rounded-2xl bg-purple-50 border border-purple-200 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-purple-700" />
                  <span className="font-extrabold text-xs text-purple-950 uppercase tracking-wider">
                    Paiement {order.payment?.method === 'OM' ? 'Orange Money' : 'Wave'} à vérifier
                  </span>
                </div>
                <span className="font-mono font-black text-xs text-purple-900 bg-purple-200/60 px-2 py-0.5 rounded-md">
                  {formatFCFA(order.total)}
                </span>
              </div>

              <div className="text-xs text-[#555555] space-y-1 bg-white p-3 rounded-xl border border-purple-100">
                <p>
                  Référence déclarée : <strong className="text-[#0A0A0A] font-mono">{order.payment?.transactionRef || 'Aucune référence'}</strong>
                </p>
                {order.payment?.clientDeclaredAt && (
                  <p className="text-[11px] text-[#777777]">
                    Déclaré le : {new Date(order.payment.clientDeclaredAt).toLocaleString('fr-FR')}
                  </p>
                )}
                <p className="text-[11px] text-purple-900 font-semibold pt-1">
                  ℹ️ Vérifiez la réception sur votre téléphone avant d'approuver. L'approbation transmettra immédiatement la commande en cuisine.
                </p>
              </div>

              {!showRejectInput ? (
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <button
                    type="button"
                    onClick={handleApprovePayment}
                    disabled={isProcessing}
                    className="py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-sm disabled:opacity-50"
                  >
                    <CheckCircle className="w-4 h-4" />
                    <span>APPROUVER</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowRejectInput(true)}
                    disabled={isProcessing}
                    className="py-2.5 px-3 rounded-xl bg-white hover:bg-red-50 text-red-600 border border-red-200 font-bold text-xs flex items-center justify-center gap-1.5 transition-all disabled:opacity-50"
                  >
                    <XCircle className="w-4 h-4" />
                    <span>REJETER</span>
                  </button>
                </div>
              ) : (
                <div className="space-y-2 pt-1 animate-fade-in">
                  <label className="text-[11px] font-bold text-red-900 block">
                    Motif obligatoire du rejet *
                  </label>
                  <input
                    type="text"
                    value={rejectionReason}
                    onChange={e => setRejectionReason(e.target.value)}
                    placeholder="Ex: Montant non reçu, référence erronée..."
                    className="w-full bg-white border border-red-300 focus:border-red-500 rounded-xl px-3 py-2 text-xs text-[#0A0A0A] outline-none"
                  />
                  <div className="flex items-center justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setShowRejectInput(false)}
                      className="px-3 py-1.5 text-xs font-semibold text-[#666666] hover:bg-gray-100 rounded-lg"
                    >
                      Annuler
                    </button>
                    <button
                      type="button"
                      onClick={handleRejectPayment}
                      disabled={isProcessing || rejectionReason.trim().length < 3}
                      className="px-3.5 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white font-bold text-xs disabled:opacity-50"
                    >
                      {isProcessing ? 'En cours...' : 'Confirmer le rejet'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Change Status Controls */}
          <div className="space-y-2 pt-2 border-t border-[#EEEEEE]">
            <h4 className="text-xs uppercase tracking-wider text-[#0A0A0A] font-bold">
              Changer le statut de la commande
            </h4>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                onClick={() => handleStatusChange('CONFIRMED')}
                className={`py-2 px-3 rounded-xl border font-bold transition-all ${
                  order.status === 'CONFIRMED'
                    ? 'bg-[#222222] text-white border-[#222222]'
                    : 'bg-white hover:bg-gray-50 text-[#222222] border-[#EAEAEA]'
                }`}
              >
                ✓ Accepter
              </button>

              <button
                onClick={() => handleStatusChange('PREPARING')}
                className={`py-2 px-3 rounded-xl border font-bold transition-all ${
                  order.status === 'PREPARING'
                    ? 'bg-[#333333] text-white border-[#333333]'
                    : 'bg-white hover:bg-gray-50 text-[#333333] border-[#EAEAEA]'
                }`}
              >
                🍳 En préparation
              </button>

              <button
                onClick={() => handleStatusChange('READY')}
                className={`py-2 px-3 rounded-xl border font-bold transition-all ${
                  order.status === 'READY'
                    ? 'bg-[#0A0A0A] text-white border-[#0A0A0A]'
                    : 'bg-white hover:bg-gray-50 text-[#0A0A0A] border-[#EAEAEA]'
                }`}
              >
                🔔 Prête
              </button>

              <button
                onClick={() => handleStatusChange('SERVED')}
                className={`py-2 px-3 rounded-xl border font-bold transition-all ${
                  order.status === 'SERVED'
                    ? 'bg-[#0A0A0A] text-white border-[#0A0A0A]'
                    : 'bg-white hover:bg-gray-50 text-[#0A0A0A] border-[#EAEAEA]'
                }`}
              >
                🍽️ Servie
              </button>

              <button
                onClick={() => handleStatusChange('CANCELLED')}
                className={`col-span-2 py-2 px-3 rounded-xl border font-bold transition-all ${
                  order.status === 'CANCELLED'
                    ? 'bg-red-600 text-white border-red-600'
                    : 'bg-white hover:bg-red-50 text-red-600 border-[#EAEAEA]'
                }`}
              >
                ❌ Annuler la commande
              </button>
            </div>
          </div>
        </div>
      </div>

      <ThermalReceiptModal
        order={order}
        isOpen={isThermalOpen}
        onClose={() => setIsThermalOpen(false)}
      />
    </div>
  );
};
