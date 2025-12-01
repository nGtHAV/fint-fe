"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Plus,
  Trash2,
  Edit2,
  Save,
  X,
  Tag,
  AlertTriangle,
  Palette,
} from "lucide-react";
import { authApi, categoriesApi, Category } from "@/lib/api";

const COLOR_OPTIONS = [
  { name: "gray", class: "bg-gray-500" },
  { name: "red", class: "bg-red-500" },
  { name: "orange", class: "bg-orange-500" },
  { name: "amber", class: "bg-amber-500" },
  { name: "yellow", class: "bg-yellow-500" },
  { name: "lime", class: "bg-lime-500" },
  { name: "green", class: "bg-green-500" },
  { name: "emerald", class: "bg-emerald-500" },
  { name: "teal", class: "bg-teal-500" },
  { name: "cyan", class: "bg-cyan-500" },
  { name: "sky", class: "bg-sky-500" },
  { name: "blue", class: "bg-blue-500" },
  { name: "indigo", class: "bg-indigo-500" },
  { name: "violet", class: "bg-violet-500" },
  { name: "purple", class: "bg-purple-500" },
  { name: "fuchsia", class: "bg-fuchsia-500" },
  { name: "pink", class: "bg-pink-500" },
  { name: "rose", class: "bg-rose-500" },
];

export default function CategoriesPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [migrateToCategory, setMigrateToCategory] = useState("");
  const [receiptCount, setReceiptCount] = useState(0);
  const [newCategory, setNewCategory] = useState({
    name: "",
    icon: "tag",
    color: "gray",
  });
  const [error, setError] = useState("");

  useEffect(() => {
    if (!authApi.isAuthenticated()) {
      router.push("/login");
      return;
    }
    loadCategories();
  }, [router]);

  const loadCategories = async () => {
    try {
      setLoading(true);
      const data = await categoriesApi.getAll();
      setCategories(data);
    } catch (error) {
      console.error("Failed to load categories:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCategory = async () => {
    if (!newCategory.name.trim()) {
      setError("Please enter a category name");
      return;
    }

    try {
      await categoriesApi.createCustom({
        name: newCategory.name.trim(),
        icon: newCategory.icon,
        color: newCategory.color,
      });
      setShowAddModal(false);
      setNewCategory({ name: "", icon: "tag", color: "gray" });
      setError("");
      loadCategories();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create category");
    }
  };

  const handleUpdateCategory = async () => {
    if (!editingCategory || !editingCategory.id) return;

    try {
      await categoriesApi.updateCustom(editingCategory.id, {
        name: editingCategory.name,
        icon: editingCategory.icon || undefined,
        color: editingCategory.color || undefined,
      });
      setEditingCategory(null);
      loadCategories();
    } catch (err) {
      console.error("Failed to update category:", err);
    }
  };

  const handleDeleteClick = async (category: Category) => {
    if (!category.id) return;
    
    setSelectedCategory(category);
    try {
      const { receipt_count } = await categoriesApi.getReceiptCount(category.id);
      setReceiptCount(receipt_count);
      setShowDeleteModal(true);
    } catch (err) {
      console.error("Failed to get receipt count:", err);
    }
  };

  const handleDeleteCategory = async () => {
    if (!selectedCategory || !selectedCategory.id) return;

    try {
      if (receiptCount > 0 && !migrateToCategory) {
        setError("Please select a category to migrate receipts to");
        return;
      }

      await categoriesApi.deleteCustom(
        selectedCategory.id,
        receiptCount > 0 ? migrateToCategory : undefined
      );
      setShowDeleteModal(false);
      setSelectedCategory(null);
      setMigrateToCategory("");
      setReceiptCount(0);
      setError("");
      loadCategories();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete category");
    }
  };

  const getColorClass = (color: string) => {
    const found = COLOR_OPTIONS.find((c) => c.name === color);
    return found?.class || "bg-gray-500";
  };

  const customCategories = categories.filter((c) => c.is_custom);
  const defaultCategories = categories.filter((c) => !c.is_custom && !c.is_other);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>
          <div className="flex-1">
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">Categories</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">Manage your spending categories</p>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto p-4 space-y-6">
        {/* Custom Categories */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
            <h2 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <Tag className="w-5 h-5" />
              Your Custom Categories
            </h2>
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-1 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm rounded-lg transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add Category
            </button>
          </div>

          {customCategories.length === 0 ? (
            <div className="p-8 text-center">
              <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                <Tag className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-gray-500 dark:text-gray-400 mb-4">No custom categories yet</p>
              <button
                onClick={() => setShowAddModal(true)}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors"
              >
                Create Your First Category
              </button>
            </div>
          ) : (
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {customCategories.map((category) => {
                const isEditing = editingCategory?.id === category.id;

                return (
                  <div key={category.id} className="p-4">
                    <div className="flex items-center gap-4">
                      <div
                        className={`w-10 h-10 rounded-lg flex items-center justify-center ${getColorClass(
                          isEditing ? editingCategory?.color || "gray" : category.color || "gray"
                        )}`}
                      >
                        <Tag className="w-5 h-5 text-white" />
                      </div>

                      {isEditing ? (
                        <div className="flex-1 space-y-3">
                          <input
                            type="text"
                            value={editingCategory.name}
                            onChange={(e) =>
                              setEditingCategory({ ...editingCategory, name: e.target.value })
                            }
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                          />
                          <div>
                            <label className="text-xs text-gray-500 dark:text-gray-400 mb-1 block">
                              Color
                            </label>
                            <div className="flex flex-wrap gap-1">
                              {COLOR_OPTIONS.map((color) => (
                                <button
                                  key={color.name}
                                  onClick={() =>
                                    setEditingCategory({ ...editingCategory, color: color.name })
                                  }
                                  className={`w-6 h-6 rounded-full ${color.class} ${
                                    editingCategory.color === color.name
                                      ? "ring-2 ring-offset-2 ring-gray-400"
                                      : ""
                                  }`}
                                />
                              ))}
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="flex-1">
                          <h3 className="font-medium text-gray-900 dark:text-white">
                            {category.name}
                          </h3>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            Custom category
                          </p>
                        </div>
                      )}

                      <div className="flex items-center gap-1">
                        {isEditing ? (
                          <>
                            <button
                              onClick={handleUpdateCategory}
                              className="p-2 hover:bg-emerald-100 dark:hover:bg-emerald-900/30 rounded-lg transition-colors"
                            >
                              <Save className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                            </button>
                            <button
                              onClick={() => setEditingCategory(null)}
                              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                            >
                              <X className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={() => setEditingCategory(category)}
                              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                            >
                              <Edit2 className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                            </button>
                            <button
                              onClick={() => handleDeleteClick(category)}
                              className="p-2 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                            >
                              <Trash2 className="w-4 h-4 text-red-600 dark:text-red-400" />
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Default Categories */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
            <h2 className="font-semibold text-gray-900 dark:text-white">Default Categories</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              These categories are available to all users
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 p-4">
            {defaultCategories.map((category, index) => (
              <div
                key={index}
                className="flex items-center gap-2 p-2 rounded-lg bg-gray-50 dark:bg-gray-700/50"
              >
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center ${getColorClass(
                    category.color || "gray"
                  )}`}
                >
                  <Tag className="w-4 h-4 text-white" />
                </div>
                <span className="text-sm text-gray-700 dark:text-gray-300 truncate">
                  {category.name}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Add Category Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowAddModal(false)}
          />
          <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-md animate-scale-in">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Add Category</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Create a custom category for your expenses
              </p>
            </div>

            <div className="p-6 space-y-4">
              {error && (
                <div className="p-3 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg text-sm">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Category Name
                </label>
                <input
                  type="text"
                  value={newCategory.name}
                  onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                  placeholder="e.g., Pet Supplies"
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <Palette className="w-4 h-4 inline mr-1" />
                  Color
                </label>
                <div className="flex flex-wrap gap-2">
                  {COLOR_OPTIONS.map((color) => (
                    <button
                      key={color.name}
                      onClick={() => setNewCategory({ ...newCategory, color: color.name })}
                      className={`w-8 h-8 rounded-full ${color.class} transition-all ${
                        newCategory.color === color.name
                          ? "ring-2 ring-offset-2 ring-gray-400 scale-110"
                          : "hover:scale-105"
                      }`}
                    />
                  ))}
                </div>
              </div>

              {/* Preview */}
              <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Preview</p>
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-lg flex items-center justify-center ${getColorClass(
                      newCategory.color
                    )}`}
                  >
                    <Tag className="w-5 h-5 text-white" />
                  </div>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {newCategory.name || "Category Name"}
                  </span>
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex gap-3">
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setError("");
                }}
                className="flex-1 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateCategory}
                className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl transition-colors font-medium"
              >
                Create Category
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Category Modal */}
      {showDeleteModal && selectedCategory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => {
              setShowDeleteModal(false);
              setError("");
            }}
          />
          <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-md animate-scale-in">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
                  <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">Delete Category</h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Delete &quot;{selectedCategory.name}&quot;
                  </p>
                </div>
              </div>
            </div>

            <div className="p-6 space-y-4">
              {error && (
                <div className="p-3 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg text-sm">
                  {error}
                </div>
              )}

              {receiptCount > 0 ? (
                <>
                  <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                    <p className="text-sm text-yellow-800 dark:text-yellow-400">
                      <strong>{receiptCount}</strong> receipt{receiptCount !== 1 ? "s" : ""}{" "}
                      currently use{receiptCount === 1 ? "s" : ""} this category. Please select
                      another category to migrate them to.
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Move receipts to:
                    </label>
                    <select
                      value={migrateToCategory}
                      onChange={(e) => setMigrateToCategory(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    >
                      <option value="">Select a category...</option>
                      {categories
                        .filter((c) => c.name !== selectedCategory.name && !c.is_other)
                        .map((c, index) => (
                          <option key={c.id || index} value={c.name}>
                            {c.name}
                          </option>
                        ))}
                    </select>
                  </div>
                </>
              ) : (
                <p className="text-gray-600 dark:text-gray-400">
                  No receipts are using this category. It can be safely deleted.
                </p>
              )}
            </div>

            <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex gap-3">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setError("");
                  setMigrateToCategory("");
                }}
                className="flex-1 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteCategory}
                className="flex-1 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl transition-colors font-medium"
              >
                Delete Category
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
