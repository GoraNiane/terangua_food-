import React, { useState } from 'react';
import { Search, Users, Phone, Send, Crown, Sparkles } from 'lucide-react';
import { useRestaurantStore } from '../../store/restaurantStore';
import { AdminHeader } from '../../components/admin/AdminHeader';
import { AdminSidebar } from '../../components/admin/AdminSidebar';
import { formatFCFA } from '../../services/whatsappService';

export const AdminCustomersPage: React.FC = () => {
  const { customers, restaurant } = useRestaurantStore();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredCustomers = customers.filter(c => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return c.name.toLowerCase().includes(q) || c.phone.includes(q);
  });

  const totalClients = customers.length;
  const vipClients = customers.filter(c => c.isVip || c.ordersCount >= 5).length;
  const totalVolume = customers.reduce((s, c) => s + c.totalSpent, 0);

  const handleWhatsAppCustomer = (cName: string, phone: string) => {
    const clean = phone.replace(/[^0-9]/g, '');
    const full = clean.startsWith('221') ? clean : `221${clean}`;
    const text = encodeURIComponent(
      `Bonjour ${cName} 👋\nNous vous remercions pour votre fidélité chez ${restaurant.name} ! Profitez d'une remise exclusive sur votre prochain plat de la carte.`
    );
    window.open(`https://wa.me/${full}?text=${text}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-[#0A0A0A] flex">
      {/* Desktop Sidebar */}
      <div className="hidden md:block w-64 shrink-0">
        <div className="fixed inset-y-0 w-64">
          <AdminSidebar />
        </div>
      </div>

      {/* Mobile Drawer */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          <div className="relative z-10 w-64 max-w-xs h-full">
            <AdminSidebar onCloseMobile={() => setIsMobileMenuOpen(false)} />
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        <AdminHeader
          title="Répertoire Clients & Fidélité"
          subtitle="Consultez les coordonnées, l'historique et la fidélité de vos clients"
          onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
        />

        <main className="p-4 sm:p-8 space-y-6 max-w-6xl mx-auto w-full">
          {/* Quick Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-[#EAEAEA] space-y-1 shadow-sm">
              <span className="text-xs uppercase tracking-wider text-[#666666] font-bold">
                Clients enregistrés
              </span>
              <p className="font-display font-black text-2xl text-[#0A0A0A]">{totalClients}</p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-[#EAEAEA] space-y-1 shadow-sm">
              <span className="text-xs uppercase tracking-wider text-[#666666] font-bold">
                Clients VIP / Fidèles
              </span>
              <p className="font-display font-black text-2xl text-[#0A0A0A] flex items-center gap-2">
                <span>{vipClients}</span>
                <Crown className="w-5 h-5 text-[#0A0A0A]" />
              </p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-[#EAEAEA] space-y-1 shadow-sm">
              <span className="text-xs uppercase tracking-wider text-[#666666] font-bold">
                Volume d'achats cumulé
              </span>
              <p className="font-display font-black text-2xl text-[#0A0A0A]">
                {formatFCFA(totalVolume)}
              </p>
            </div>
          </div>

          {/* Search bar */}
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#888888]" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Rechercher par nom de client ou téléphone..."
              className="w-full bg-white border border-[#EAEAEA] focus:border-[#0A0A0A] rounded-2xl pl-10 pr-4 py-2.5 text-xs sm:text-sm text-[#0A0A0A] placeholder:text-[#999999] outline-none shadow-sm"
            />
          </div>

          {/* Customers Table */}
          <div className="bg-white rounded-3xl border border-[#EAEAEA] overflow-hidden shadow-sm">
            <div className="overflow-x-auto no-scrollbar">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-[#EEEEEE] text-[#666666] uppercase tracking-wider bg-[#FAFAFA]">
                    <th className="p-4 font-bold">Client</th>
                    <th className="p-4 font-bold">Téléphone</th>
                    <th className="p-4 font-bold text-center">Commandes</th>
                    <th className="p-4 font-bold">Total dépensé</th>
                    <th className="p-4 font-bold">Dernière commande</th>
                    <th className="p-4 font-bold text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EEEEEE]">
                  {filteredCustomers.map(customer => {
                    const isVip = customer.isVip || customer.ordersCount >= 5;

                    return (
                      <tr key={customer.id} className="hover:bg-gray-50 transition-colors">
                        <td className="p-4">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-full bg-[#0A0A0A] text-white flex items-center justify-center font-bold">
                              {customer.name.charAt(0)}
                            </div>
                            <div>
                              <span className="font-bold text-[#0A0A0A] block">{customer.name}</span>
                              {isVip && (
                                <span className="inline-flex items-center gap-1 text-[10px] font-extrabold text-[#0A0A0A] bg-gray-100 border border-[#EAEAEA] px-1.5 py-0.2 rounded">
                                  <Crown className="w-3 h-3 text-[#0A0A0A]" /> VIP
                                </span>
                              )}
                            </div>
                          </div>
                        </td>

                        <td className="p-4 text-[#666666] font-medium">
                          <div className="flex items-center gap-1.5">
                            <Phone className="w-3.5 h-3.5 text-[#0A0A0A]" />
                            <span>{customer.phone}</span>
                          </div>
                        </td>

                        <td className="p-4 text-center font-black text-[#0A0A0A]">
                          {customer.ordersCount}
                        </td>

                        <td className="p-4 font-black text-[#0A0A0A]">
                          {formatFCFA(customer.totalSpent)}
                        </td>

                        <td className="p-4 text-[#666666]">
                          {customer.lastOrderDate}
                        </td>

                        <td className="p-4 text-right">
                          <button
                            onClick={() => handleWhatsAppCustomer(customer.name, customer.phone)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#0A0A0A] hover:bg-[#222222] text-white text-xs font-bold transition-colors shadow-sm"
                          >
                            <Send className="w-3.5 h-3.5" />
                            <span>WhatsApp</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};
