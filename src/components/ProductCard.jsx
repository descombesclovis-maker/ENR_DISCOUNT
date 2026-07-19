import React from "react";
import { Link } from "react-router-dom";
import { Plus } from "lucide-react";
import { imageUrl, formatPrice } from "../lib/api";
import { useCart } from "../context/CartContext";
import { toast } from "sonner";

export const ProductCard = ({ product, index = 0 }) => {
  const { addItem } = useCart();

  const handleAdd = (e) => {
    e.preventDefault();
    addItem(product);
    toast.success(`${product.name} ajouté au panier`);
  };

  return (
    <Link
      to={`/produits/${product.id}`}
      data-testid={`product-card-${product.id}`}
      className="group flex flex-col rounded-2xl border border-border bg-card overflow-hidden hover:-translate-y-1 transition-transform duration-200 hover:shadow-lg animate-fade-up"
      style={{ animationDelay: `${index * 60}ms` }}
    >
      <div className="aspect-[4/3] overflow-hidden bg-muted">
        <img
          src={imageUrl(product.image)}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
      </div>
      <div className="p-5 flex flex-col flex-1">
        <h3 className="font-display font-semibold text-base leading-snug mb-1">{product.name}</h3>
        <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{product.description}</p>
        {typeof product.stock === "number" && (
          <p
            data-testid={`stock-${product.id}`}
            className={`text-xs font-semibold mb-3 ${product.stock > 0 ? "text-primary" : "text-amber-600"}`}
          >
            {product.stock > 0
              ? `${product.stock} en stock`
              : "Précommande — délai à confirmer"}
          </p>
        )}
        <div className="mt-auto flex items-center justify-between">
          <span className="font-display font-bold text-lg">
            {!product.price || product.price <= 0 ? "Sur demande" : formatPrice(product.price)}
          </span>
          {!product.price || product.price <= 0 ? (
            <span
              className="w-10 h-10 rounded-full border border-border grid place-items-center text-primary"
              aria-label="Prix sur demande"
            >
              <Plus className="w-5 h-5" />
            </span>
          ) : (
            <button
              onClick={handleAdd}
              data-testid={`add-to-cart-${product.id}`}
              className="w-10 h-10 rounded-full bg-primary text-primary-foreground grid place-items-center hover:bg-primary/90 active:scale-90 transition-transform"
              aria-label="Ajouter au panier"
            >
              <Plus className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>
    </Link>
  );
};
