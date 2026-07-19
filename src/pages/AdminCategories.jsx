import React, {
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  ArrowLeft,
  Edit3,
  FolderPlus,
  LoaderCircle,
  Plus,
  RefreshCw,
  Save,
  Trash2,
  X,
} from "lucide-react";

import { Link } from "react-router-dom";
import { toast } from "sonner";

import { supabase } from "../lib/supabase";

const initialForm = {
  name: "",
  slug: "",
  description: "",
  display_order: "0",
  is_active: true,
};

function createSlug(value) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export default function AdminCategories() {
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState(initialForm);

  const [editingId, setEditingId] = useState(null);
  const [slugManuallyChanged, setSlugManuallyChanged] =
    useState(false);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] =
    useState(false);
  const [deletingId, setDeletingId] =
    useState(null);

  const loadCategories = useCallback(async () => {
    setLoading(true);

    try {
      const { data, error } = await supabase
        .from("categories")
        .select(`
          id,
          name,
          slug,
          description,
          display_order,
          is_active,
          created_at
        `)
        .order("display_order", {
          ascending: true,
        })
        .order("name", {
          ascending: true,
        });

      if (error) {
        throw error;
      }

      setCategories(data || []);
    } catch (error) {
      console.error(
        "Erreur lors du chargement des catégories :",
        error
      );

      toast.error(
        error?.message ||
          "Impossible de charger les catégories."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    document.title =
      "Gestion des catégories | ENR Discount";

    loadCategories();
  }, [loadCategories]);

  const resetForm = () => {
    setForm(initialForm);
    setEditingId(null);
    setSlugManuallyChanged(false);
  };

  const handleFieldChange = (event) => {
    const {
      name,
      value,
      checked,
      type,
    } = event.target;

    const nextValue =
      type === "checkbox" ? checked : value;

    setForm((currentForm) => {
      const updatedForm = {
        ...currentForm,
        [name]: nextValue,
      };

      if (
        name === "name" &&
        !slugManuallyChanged
      ) {
        updatedForm.slug = createSlug(value);
      }

      return updatedForm;
    });
  };

  const handleSlugChange = (event) => {
    setSlugManuallyChanged(true);

    setForm((currentForm) => ({
      ...currentForm,
      slug: createSlug(event.target.value),
    }));
  };

  const handleEdit = (category) => {
    setEditingId(category.id);
    setSlugManuallyChanged(true);

    setForm({
      name: category.name || "",
      slug: category.slug || "",
      description: category.description || "",
      display_order: String(
        category.display_order ?? 0
      ),
      is_active: Boolean(category.is_active),
    });

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const validateForm = () => {
    if (!form.name.trim()) {
      return "Le nom de la catégorie est obligatoire.";
    }

    if (!form.slug.trim()) {
      return "Le slug est obligatoire.";
    }

    if (
      Number.isNaN(Number(form.display_order)) ||
      Number(form.display_order) < 0
    ) {
      return "L’ordre d’affichage doit être supérieur ou égal à zéro.";
    }

    return "";
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const validationError = validateForm();

    if (validationError) {
      toast.error(validationError);
      return;
    }

    setSubmitting(true);

    const payload = {
      name: form.name.trim(),
      slug: createSlug(form.slug),

      description:
        form.description.trim() || null,

      display_order: Number.parseInt(
        form.display_order,
        10
      ),

      is_active: form.is_active,
    };

    try {
      if (editingId) {
        const { error } = await supabase
          .from("categories")
          .update(payload)
          .eq("id", editingId);

        if (error) {
          throw error;
        }

        toast.success(
          "Catégorie modifiée avec succès."
        );
      } else {
        const { error } = await supabase
          .from("categories")
          .insert(payload);

        if (error) {
          throw error;
        }

        toast.success(
          "Catégorie créée avec succès."
        );
      }

      resetForm();
      await loadCategories();
    } catch (error) {
      console.error(
        "Erreur lors de l’enregistrement de la catégorie :",
        error
      );

      let message =
        error?.message ||
        "Impossible d’enregistrer la catégorie.";

      if (
        message
          .toLowerCase()
          .includes("duplicate key")
      ) {
        message =
          "Une catégorie possède déjà ce nom ou ce slug.";
      }

      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (category) => {
    try {
      const {
        count,
        error: countError,
      } = await supabase
        .from("products")
        .select("*", {
          count: "exact",
          head: true,
        })
        .eq("category_id", category.id);

      if (countError) {
        throw countError;
      }

      if ((count || 0) > 0) {
        toast.error(
          `Cette catégorie contient ${count} produit${
            count > 1 ? "s" : ""
          }. Déplace ou supprime ces produits avant de supprimer la catégorie.`
        );

        return;
      }

      const confirmation = window.confirm(
        `Supprimer définitivement la catégorie « ${category.name} » ?`
      );

      if (!confirmation) {
        return;
      }

      setDeletingId(category.id);

      const { error } = await supabase
        .from("categories")
        .delete()
        .eq("id", category.id);

      if (error) {
        throw error;
      }

      setCategories((currentCategories) =>
        currentCategories.filter(
          (currentCategory) =>
            currentCategory.id !== category.id
        )
      );

      if (editingId === category.id) {
        resetForm();
      }

      toast.success("Catégorie supprimée.");
    } catch (error) {
      console.error(
        "Erreur lors de la suppression de la catégorie :",
        error
      );

      toast.error(
        error?.message ||
          "Impossible de supprimer la catégorie."
      );
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div
      className="min-h-screen bg-secondary/30"
      data-testid="admin-categories"
    >
      <header className="border-b border-border bg-card">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 min-h-20 py-4 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="font-display font-black text-xl">
              ENR Discount
            </p>

            <p className="text-xs text-muted-foreground">
              Administration
            </p>
          </div>

          <Link
            to="/admin"
            className="inline-flex items-center gap-2 h-10 px-5 rounded-full border border-border font-semibold text-sm hover:bg-secondary transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Tableau de bord
          </Link>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-5 sm:px-8 py-10">
        <div className="mb-9">
          <p className="overline text-primary mb-2">
            Catalogue
          </p>

          <h1 className="font-display font-black text-3xl sm:text-4xl tracking-tight">
            Gestion des catégories
          </h1>

          <p className="text-muted-foreground mt-2">
            Crée, modifie, masque ou supprime les catégories du catalogue.
          </p>
        </div>

        <div className="grid lg:grid-cols-[380px_1fr] gap-7 items-start">
          <section className="rounded-3xl border border-border bg-card p-6 lg:sticky lg:top-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-11 h-11 rounded-xl bg-primary/10 text-primary grid place-items-center">
                {editingId ? (
                  <Edit3 className="w-5 h-5" />
                ) : (
                  <FolderPlus className="w-5 h-5" />
                )}
              </div>

              <div>
                <h2 className="font-display font-bold text-xl">
                  {editingId
                    ? "Modifier la catégorie"
                    : "Nouvelle catégorie"}
                </h2>

                <p className="text-sm text-muted-foreground">
                  {editingId
                    ? "Modifie les informations existantes."
                    : "Ajoute une catégorie au catalogue."}
                </p>
              </div>
            </div>

            <form
              onSubmit={handleSubmit}
              className="space-y-5"
            >
              <div>
                <label
                  htmlFor="category-name"
                  className="block text-sm font-semibold mb-2"
                >
                  Nom *
                </label>

                <input
                  id="category-name"
                  name="name"
                  type="text"
                  value={form.name}
                  onChange={handleFieldChange}
                  disabled={submitting}
                  placeholder="Pompes à chaleur"
                  className="w-full h-12 rounded-xl border border-border bg-background px-4 outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                />
              </div>

              <div>
                <label
                  htmlFor="category-slug"
                  className="block text-sm font-semibold mb-2"
                >
                  Slug *
                </label>

                <input
                  id="category-slug"
                  name="slug"
                  type="text"
                  value={form.slug}
                  onChange={handleSlugChange}
                  disabled={submitting}
                  placeholder="pompes-a-chaleur"
                  className="w-full h-12 rounded-xl border border-border bg-background px-4 outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                />
              </div>

              <div>
                <label
                  htmlFor="category-description"
                  className="block text-sm font-semibold mb-2"
                >
                  Description
                </label>

                <textarea
                  id="category-description"
                  name="description"
                  value={form.description}
                  onChange={handleFieldChange}
                  disabled={submitting}
                  rows={5}
                  placeholder="Description de la catégorie."
                  className="w-full rounded-xl border border-border bg-background px-4 py-3 outline-none resize-y focus:ring-2 focus:ring-primary/30 focus:border-primary"
                />
              </div>

              <div>
                <label
                  htmlFor="category-order"
                  className="block text-sm font-semibold mb-2"
                >
                  Ordre d’affichage
                </label>

                <input
                  id="category-order"
                  name="display_order"
                  type="number"
                  min="0"
                  step="1"
                  value={form.display_order}
                  onChange={handleFieldChange}
                  disabled={submitting}
                  className="w-full h-12 rounded-xl border border-border bg-background px-4 outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                />
              </div>

              <label className="flex items-start gap-3 rounded-2xl border border-border p-4 cursor-pointer">
                <input
                  name="is_active"
                  type="checkbox"
                  checked={form.is_active}
                  onChange={handleFieldChange}
                  disabled={submitting}
                  className="mt-1"
                />

                <span>
                  <span className="block text-sm font-semibold">
                    Catégorie active
                  </span>

                  <span className="block text-xs text-muted-foreground mt-1">
                    Disponible dans les formulaires produit.
                  </span>
                </span>
              </label>

              <div className="flex flex-col gap-3">
                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex items-center justify-center gap-2 h-12 px-6 rounded-full bg-primary text-primary-foreground font-semibold hover:bg-primary/90 disabled:opacity-60"
                >
                  {submitting ? (
                    <>
                      <LoaderCircle className="w-5 h-5 animate-spin" />
                      Enregistrement…
                    </>
                  ) : editingId ? (
                    <>
                      <Save className="w-5 h-5" />
                      Enregistrer
                    </>
                  ) : (
                    <>
                      <Plus className="w-5 h-5" />
                      Créer la catégorie
                    </>
                  )}
                </button>

                {editingId && (
                  <button
                    type="button"
                    onClick={resetForm}
                    disabled={submitting}
                    className="inline-flex items-center justify-center gap-2 h-12 px-6 rounded-full border border-border font-semibold hover:bg-secondary"
                  >
                    <X className="w-4 h-4" />
                    Annuler la modification
                  </button>
                )}
              </div>
            </form>
          </section>

          <section className="rounded-3xl border border-border bg-card overflow-hidden">
            <div className="px-6 py-5 border-b border-border flex items-center justify-between gap-4">
              <div>
                <h2 className="font-display font-bold text-xl">
                  Catégories existantes
                </h2>

                <p className="text-sm text-muted-foreground mt-1">
                  {categories.length} catégorie
                  {categories.length > 1 ? "s" : ""}
                </p>
              </div>

              <button
                type="button"
                onClick={loadCategories}
                disabled={loading}
                className="inline-flex items-center justify-center gap-2 h-10 px-4 rounded-full border border-border font-semibold text-sm hover:bg-secondary disabled:opacity-60"
              >
                <RefreshCw
                  className={`w-4 h-4 ${
                    loading ? "animate-spin" : ""
                  }`}
                />

                Actualiser
              </button>
            </div>

            {loading ? (
              <div className="py-20 text-center">
                <LoaderCircle className="w-10 h-10 animate-spin text-primary mx-auto mb-4" />

                <p className="font-semibold">
                  Chargement des catégories…
                </p>
              </div>
            ) : categories.length === 0 ? (
              <div className="py-20 px-6 text-center">
                <FolderPlus className="w-12 h-12 text-muted-foreground mx-auto mb-4" />

                <h3 className="font-display font-bold text-xl">
                  Aucune catégorie
                </h3>
              </div>
            ) : (
              <div className="divide-y divide-border">
                {categories.map((category) => (
                  <article
                    key={category.id}
                    className="p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center gap-4"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-display font-bold text-lg">
                          {category.name}
                        </h3>

                        <span
                          className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                            category.is_active
                              ? "bg-primary/10 text-primary"
                              : "bg-secondary text-muted-foreground"
                          }`}
                        >
                          {category.is_active
                            ? "Active"
                            : "Masquée"}
                        </span>
                      </div>

                      <p className="text-sm text-muted-foreground mt-1">
                        /{category.slug}
                      </p>

                      {category.description && (
                        <p className="text-sm text-muted-foreground mt-3 leading-relaxed">
                          {category.description}
                        </p>
                      )}

                      <p className="text-xs text-muted-foreground mt-3">
                        Ordre :{" "}
                        {category.display_order ?? 0}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          handleEdit(category)
                        }
                        title="Modifier la catégorie"
                        className="w-10 h-10 rounded-full border border-border grid place-items-center hover:bg-secondary"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          handleDelete(category)
                        }
                        disabled={
                          deletingId === category.id
                        }
                        title="Supprimer la catégorie"
                        className="w-10 h-10 rounded-full border border-destructive/30 text-destructive grid place-items-center hover:bg-destructive/10 disabled:opacity-50"
                      >
                        {deletingId === category.id ? (
                          <LoaderCircle className="w-4 h-4 animate-spin" />
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}