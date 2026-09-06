import React, { useState } from 'react';
import { Star, MessageSquare, Check, Reply, ThumbsUp } from 'lucide-react';
import { useRestaurantStore } from '../../store/restaurantStore';
import { AdminHeader } from '../../components/admin/AdminHeader';
import { AdminSidebar } from '../../components/admin/AdminSidebar';

export const AdminReviewsPage: React.FC = () => {
  const { reviews, replyToReview } = useRestaurantStore();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [replyingId, setReplyingId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');

  const averageRating = (
    reviews.reduce((s, r) => s + r.rating, 0) / (reviews.length || 1)
  ).toFixed(1);

  const handleSendReply = (reviewId: string) => {
    if (!replyText.trim()) return;
    replyToReview(reviewId, replyText.trim());
    setReplyingId(null);
    setReplyText('');
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
          title="Avis Clients & Satisfaction"
          subtitle="Suivez les retours d'expérience et répondez aux avis des clients de votre restaurant"
          onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
        />

        <main className="p-4 sm:p-8 space-y-8 max-w-5xl mx-auto w-full">
          {/* Top Rating Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white p-5 rounded-3xl border border-[#EAEAEA] space-y-2 shadow-sm">
              <span className="text-xs uppercase tracking-wider text-[#666666] font-bold">
                Note Moyenne
              </span>
              <div className="flex items-center gap-3">
                <span className="font-display font-black text-3xl text-[#0A0A0A]">
                  {averageRating}
                </span>
                <div className="flex text-[#0A0A0A] text-sm">
                  {'★'.repeat(5)}
                </div>
              </div>
              <p className="text-[11px] text-[#666666]">
                Basé sur {reviews.length} avis vérifiés
              </p>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-[#EAEAEA] space-y-2 shadow-sm">
              <span className="text-xs uppercase tracking-wider text-[#666666] font-bold">
                Taux de Satisfaction
              </span>
              <p className="font-display font-black text-3xl text-[#0A0A0A]">
                96 %
              </p>
              <p className="text-[11px] text-[#666666]">
                Clients recommandant votre table
              </p>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-[#EAEAEA] space-y-2 shadow-sm">
              <span className="text-xs uppercase tracking-wider text-[#666666] font-bold">
                Temps de Réponse
              </span>
              <p className="font-display font-black text-3xl text-[#0A0A0A]">
                &lt; 15 min
              </p>
              <p className="text-[11px] text-[#666666]">
                Excellente réactivité de votre équipe
              </p>
            </div>
          </div>

          {/* Reviews List */}
          <div className="space-y-4">
            <h3 className="font-display font-black text-base text-[#0A0A0A]">
              Derniers retours d'expérience
            </h3>

            {reviews.map(review => (
              <div
                key={review.id}
                className="bg-white p-5 sm:p-6 rounded-3xl border border-[#EAEAEA] space-y-4 shadow-sm hover:border-[#0A0A0A] transition-all"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-[#0A0A0A]">
                        {review.customerName}
                      </span>
                      <span className="text-[11px] text-[#888888]">
                        • Commande #{review.orderId}
                      </span>
                    </div>

                    <div className="flex items-center gap-1 text-[#0A0A0A] text-xs mt-1">
                      {Array.from({ length: 5 }, (_, i) => (
                        <span key={i}>{i < review.rating ? '★' : '☆'}</span>
                      ))}
                      <span className="text-[11px] text-[#666666] ml-1">
                        {review.createdAt}
                      </span>
                    </div>
                  </div>
                </div>

                <p className="text-xs sm:text-sm text-[#333333] leading-relaxed italic">
                  « {review.comment} »
                </p>

                {/* Existing Reply */}
                {review.reply && (
                  <div className="p-3.5 rounded-2xl bg-[#FAFAFA] border border-[#EAEAEA] text-xs space-y-1">
                    <span className="font-bold text-[#0A0A0A] block">
                      Réponse de l'établissement :
                    </span>
                    <p className="text-[#666666]">{review.reply}</p>
                  </div>
                )}

                {/* Reply action button */}
                {!review.reply && (
                  <div>
                    {replyingId === review.id ? (
                      <div className="space-y-2 pt-2 border-t border-[#EEEEEE]">
                        <textarea
                          value={replyText}
                          onChange={e => setReplyText(e.target.value)}
                          placeholder="Écrivez une réponse chaleureuse..."
                          rows={2}
                          className="w-full bg-white border border-[#EAEAEA] focus:border-[#0A0A0A] rounded-xl p-2.5 text-xs text-[#0A0A0A] outline-none resize-none"
                        />
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => setReplyingId(null)}
                            className="px-3 py-1 rounded-lg text-xs text-[#666666] hover:text-[#0A0A0A]"
                          >
                            Annuler
                          </button>
                          <button
                            onClick={() => handleSendReply(review.id)}
                            className="px-4 py-1.5 rounded-lg bg-[#0A0A0A] hover:bg-[#222222] text-white font-bold text-xs shadow-sm"
                          >
                            Publier la réponse
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={() => {
                          setReplyingId(review.id);
                          setReplyText('');
                        }}
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-[#0A0A0A] hover:underline"
                      >
                        <Reply className="w-3.5 h-3.5" />
                        <span>Répondre à ce client</span>
                      </button>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
};
