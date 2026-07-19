const technicalSpecifications = [
  {
    label: "Puissance AC nominale",
    value: "3 kW / 3 680 W / 4 kW / 4 600 W / 5 kW / 6 kW (selon version)",
  },
  {
    label: "Réseau",
    value: "230 V monophasé",
  },
  {
    label: "Fréquence",
    value: "50 / 60 Hz",
  },
  {
    label: "Nombre de MPPT",
    value: "2",
  },
  {
    label: "Rendement maximal",
    value: "Jusqu’à 98,2 %",
  },
  {
    label: "Rendement européen",
    value: "Jusqu’à 97,5 %",
  },
  {
    label: "Protection",
    value: "IP65",
  },
  {
    label: "Refroidissement",
    value: "Convection naturelle (sans ventilateur)",
  },
  {
    label: "Communication",
    value: "Wi-Fi / Ethernet / 4G via accessoires",
  },
  {
    label: "Surveillance",
    value: "Plateforme ZCS Monitoring",
  },
  {
    label: "Installation",
    value: "Intérieure ou extérieure",
  },
  {
    label: "Certifications",
    value: "CE, EN50549, IEC62109, EMC",
  },
];

export const products = [
  {
    id: "zcs-azzurro-1ph-tlm-v3",
    slug: "zcs-azzurro-1ph-tlm-v3",

    name: "ZCS AZZURRO 1PH TLM-V3",
    brand: "ZCS - ZUCCHETTI CENTRO SISTEMI",
    manufacturer: "ZCS - ZUCCHETTI CENTRO SISTEMI",
    reference: "1PH TLM-V3",
    sku: "1PH-TLM-V3",

    category: "Onduleurs photovoltaïques",

    description:
      "Onduleur photovoltaïque de chaîne monophasé ZCS AZZURRO, Série Plus V3. Idéal pour les installations photovoltaïques résidentielles avec injection réseau, compatible avec la plateforme de surveillance ZCS. Disponible en 6 versions de puissance.",

    price: 0,
    onDemand: true,
    stock: 10,

    image: "/images/zcs-azzurro-1ph-tlm-v3.png",
    images: ["/images/zcs-azzurro-1ph-tlm-v3.png"],

    variants: [
      {
        id: "3000tlm-v3",
        name: "3 kW (3000TLM-V3)",
        label: "3 kW (3000TLM-V3)",
        reference: "3000TLM-V3",
        price: 0,
        stock: 10,
      },
      {
        id: "3680tlm-v3",
        name: "3 680 W (3680TLM-V3)",
        label: "3 680 W (3680TLM-V3)",
        reference: "3680TLM-V3",
        price: 0,
        stock: 10,
      },
      {
        id: "4000tlm-v3",
        name: "4 kW (4000TLM-V3)",
        label: "4 kW (4000TLM-V3)",
        reference: "4000TLM-V3",
        price: 0,
        stock: 10,
      },
      {
        id: "4600tlm-v3",
        name: "4 600 W (4600TLM-V3)",
        label: "4 600 W (4600TLM-V3)",
        reference: "4600TLM-V3",
        price: 0,
        stock: 10,
      },
      {
        id: "5000tlm-v3",
        name: "5 kW (5000TLM-V3)",
        label: "5 kW (5000TLM-V3)",
        reference: "5000TLM-V3",
        price: 0,
        stock: 10,
      },
      {
        id: "6000tlm-v3",
        name: "6 kW (6000TLM-V3)",
        label: "6 kW (6000TLM-V3)",
        reference: "6000TLM-V3",
        price: 0,
        stock: 10,
      },
    ],

    // Plusieurs noms sont conservés provisoirement pour être compatibles
    // avec la structure déjà générée par Emergent.
    specifications: technicalSpecifications,
    technicalSpecifications,
    specs: technicalSpecifications,
  },
];

export const getProductById = (id) =>
  products.find(
    (product) =>
      String(product.id) === String(id) ||
      String(product.slug) === String(id)
  );

export default products;