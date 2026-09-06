import React, { useState } from 'react';
import { Plus, Edit2, Trash2, X, Check, Eye, EyeOff, Tags } from 'lucide-react';
import { useRestaurantStore } from '../../store/restaurantStore';
import { AdminHeader } from '../../components/admin/AdminHeader';
import { AdminSidebar } from '../../components/admin/AdminSidebar';
import { Category } from '../../types';

export const AdminCategoriesPage: React.FC = () => {
  const { categories, products, addCategory, updateCategory, deleteCategory } = useRestaurantStore();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    icon: '🍲',
    isActive: true,
  });

  const handleOpenAdd = () => {
    setEditingCategory(null);
    setFormData({ name: '', icon: '🍲', isActive: true });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (cat: Category) => {
    setEditingCategory(cat);
    setFormData({ name: cat.name, icon: cat.icon || '🍲', isActive: cat.isActive });
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const slug = formData.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

    if (editingCategory) {
      updateCategory(editingCategory.id, {
        name: formData.name,
        slug,
        icon: formData.icon,
        isActive: formData.isActive,
      });
    } else {
      addCategory({
        name: formData.name,
        slug,
        icon: formData.icon,
        sortOrder: categories.length + 1,
        isActive: formData.isActive,
      });
    }

    setIsModalOpen(false);
  };

  const handleDelete = (id: string, name: string) => {
    if (confirm(`Supprimer la catégorie "${name}" ? Les plats associés resteront dans le catalogue.`)) {
      deleteCategory(id);
    }
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
          title="Gestion des catégories"
          subtitle="Organisez les sections et l'ordre d'affichage du menu digital"
          onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
        />

        <main className="p-4 sm:p-8 space-y-6 max-w-5xl mx-auto w-full">
          <div className="flex items-center justify-between">
            <p className="text-xs text-[#666666] font-medium">
              {categories.length} catégories configurées pour votre carte
            </p>

            <button
              onClick={handleOpenAdd}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-[#0A0A0A] hover:bg-[#222222] text-white font-bold text-xs shadow-sm transition-all"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>Ajouter une catégorie</span>
            </button>
          </div>

          {/* Categories Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {categories.map(category => {
              const productCount = products.filter(p => p.categoryId === category.id).length;

              return (
                <div
                  key={category.id}
                  className="bg-white p-5 rounded-2xl border border-[#EAEAEA] hover:border-[#0A0A0A] transition-all shadow-sm flex flex-col justify-between space-y-4"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{category.icon}</span>
                      <div>
                        <h4 className="font-display font-bold text-sm text-[#0A0A0A]">
                          {category.name}
                        </h4>
                        <p className="text-[11px] text-[#666666]">
                          {productCount} plat{productCount > 1 ? 's' : ''} associé{productCount > 1 ? 's' : ''}
                        </p>
                      </div>
                    </div>

                    <span
                      className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold border ${
                        category.isActive
                          ? 'bg-[#0A0A0A] text-white border-[#0A0A0A]'
                          : 'bg-gray-100 text-[#666666] border-[#EAEAEA]'
                      }`}
                    >
                      {category.isActive ? 'Actif' : 'Masqué'}
                    </span>
                  </div>

                  <div className="pt-3 border-t border-[#EEEEEE] flex items-center justify-between">
                    <button
                      onClick={() =>
                        updateCategory(category.id, { isActive: !category.isActive })
                      }
                      className="text-xs text-[#666666] hover:text-[#0A0A0A] flex items-center gap-1.5 font-medium transition-colors"
                    >
                      {category.isActive ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      <span>{category.isActive ? 'Masquer' : 'Activer'}</span>
                    </button>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleOpenEdit(category)}
                        className="w-8 h-8 rounded-lg bg-white border border-[#EAEAEA] hover:bg-gray-100 text-[#0A0A0A] flex items-center justify-center transition-colors"
                        title="Modifier"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(category.id, category.name)}
                        className="w-8 h-8 rounded-lg bg-white border border-[#EAEAEA] hover:bg-red-50 text-[#0A0A0A] hover:text-red-600 flex items-center justify-center transition-colors"
                        title="Supprimer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </main>
      </div>

      {/* Add / Edit Category Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-sm bg-white border border-[#EAEAEA] rounded-3xl p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#EEEEEE] pb-3">
              <h3 className="font-display font-black text-base text-[#0A0A0A]">
                {editingCategory ? 'Modifier la catégorie' : 'Nouvelle catégorie'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-[#0A0A0A] flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs text-[#0A0A0A] font-bold">Nom de la catégorie *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ex: Grillades & Dibi"
                  className="w-full bg-white border border-[#EAEAEA] focus:border-[#0A0A0A] rounded-xl px-3.5 py-2 text-xs text-[#0A0A0A] outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs text-[#0A0A0A] font-bold">Émoji / Icône</label>
                <input
                  type="text"
                  value={formData.icon}
                  onChange={e => setFormData({ ...formData, icon: e.target.value })}
                  placeholder="Ex: 🍲, 🔥, 🍔, 🍕, 🍹"
                  className="w-full bg-white border border-[#EAEAEA] focus:border-[#0A0A0A] rounded-xl px-3.5 py-2 text-xs text-[#0A0A0A] outline-none"
                />
              </div>

              <div className="flex items-center gap-3 pt-1">
                <input
                  type="checkbox"
                  id="catActive"
                  checked={formData.isActive}
                  onChange={e => setFormData({ ...formData, isActive: e.target.checked })}
                  className="w-4 h-4 accent-[#0A0A0A] rounded"
                />
                <label htmlFor="catActive" className="text-xs text-[#666666] font-medium cursor-pointer">
                  Visible sur le menu client
                </label>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs text-[#666666] hover:text-[#0A0A0A]"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#0A0A0A] hover:bg-[#222222] text-white font-bold text-xs shadow-sm"
                >
                  Enregistrer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
