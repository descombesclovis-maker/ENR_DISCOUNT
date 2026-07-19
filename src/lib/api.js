export const formatPrice = (value) => {
  const normalizedValue = Number(value || 0);

  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
  }).format(normalizedValue);
};

export const priceLabel = (product) => {
  if (!product) {
    return formatPrice(0);
  }

  if (
    product.on_demand &&
    Number(product.price || 0) <= 0
  ) {
    return "Prix sur demande";
  }

  const basePrice = formatPrice(
    product.price
  );

  return Array.isArray(product.variants) &&
    product.variants.length > 0
    ? `À partir de ${basePrice}`
    : basePrice;
};

export const imageUrl = (image) => {
  return image || "";
};