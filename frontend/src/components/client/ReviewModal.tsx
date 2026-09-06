import React, { useState } from 'react';
import { Star, X, Check, Heart, Sparkles } from 'lucide-react';
import { useRestaurantStore } from '../../store/restaurantStore';
import { useLanguage } from '../../services/i18n';

interface ReviewModalProps {
  orderId: string;
  isOpen: boolean;
  onClose: () => void;
}

export const ReviewModal: React.FC<ReviewModalProps> = ({ orderId, isOpen, onClose }) => {
  const { addReview } = useRestaurantStore();
  const { t } = useLanguage();
  const [rating, setRating] = useState(5);
  const [customerName, setCustomerName] = useState('');
  const [comment, setComment] = useState('');
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) return;

    addReview({
      customerName: customerName.trim() || 'Client Teranga',
      rating,
      comment: comment.trim(),
      orderId,
    });

    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      onClose();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-sm bg-luxury-card border border-luxury-border/40 rounded-3xl p-6 space-y-4 shadow-luxury text-center relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-7 h-7 rounded-full bg-white/5 hover:bg-white/10 text-white flex items-center justify-center"
        >
          <X className="w-4 h-4" />
        </button>

        {submitted ? (
          <div className="py-8 space-y-3 animate-fade-in">
            <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 mx-auto flex items-center justify-center">
              <Check className="w-6 h-6 stroke-[3]" />
            </div>
            <h3 className="font-display font-bold text-lg text-white">
              {t.feedbackSuccessTitle}
            </h3>
            <p className="text-xs text-luxury-ivory-subtle">
              {t.feedbackSuccessDesc}
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <span className="text-[10px] uppercase tracking-widest text-luxury-gold font-bold">
                {t.feedbackSectionTag}
              </span>
              <h3 className="font-display font-bold text-lg text-white">
                {t.feedbackSectionTitle}
              </h3>
            </div>

            {/* Stars selection */}
            <div className="flex justify-center gap-2 py-2">
              {[1, 2, 3, 4, 5].map(star => (
                <button
                  type="button"
                  key={star}
                  onClick={() => setRating(star)}
                  className="text-2xl transition-transform hover:scale-125 focus:outline-none"
                >
                  <span className={star <= rating ? 'text-luxury-gold' : 'text-white/20'}>
                    ★
                  </span>
                </button>
              ))}
            </div>

            <div className="space-y-2 text-xs text-left">
              <input
                type="text"
                value={customerName}
                onChange={e => setCustomerName(e.target.value)}
                placeholder={`${t.customerNameLabel} ${t.optionOptional}`}
                className="w-full bg-luxury-elevated border border-white/10 rounded-xl px-3.5 py-2 text-white outline-none"
              />

              <textarea
                required
                rows={3}
                value={comment}
                onChange={e => setComment(e.target.value)}
                placeholder={t.rateCommentPlaceholder}
                className="w-full bg-luxury-elevated border border-white/10 rounded-xl p-3 text-white outline-none resize-none"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-luxury-gold hover:bg-luxury-gold-light text-black font-extrabold text-xs shadow-gold-sm transition-all"
            >
              {t.rateSubmitBtn} ⭐
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
