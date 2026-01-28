export const PRODUCTS = [
  {
    slug: "green-oxygen-heavy-jacket",
    title: "'OXYGEN' HEAVY JACKET",
    subtitle: "IN FADED PHTHALO GREEN",
    price: 220,
    currency: "USD",
    img: "assets/images/oxygen-jacket-title.jpg",
    images: [
      "assets/images/oxygen-jacket-1.jpg",
      "assets/images/oxygen-jacket-2.webp",
      "assets/images/oxygen-jacket-3.jpg",
      "assets/images/oxygen-jacket-4.jpg",
      "assets/images/oxygen-jacket-5.jpg",
      "assets/images/oxygen-jacket-6.jpg",
      "assets/images/oxygen-jacket-7.jpg",
    ],
    sizes: ["S", "M", "L", "XL", "2XL"],
    cta: "ADD",

    // DETAILS
    details: ["HEAVYWEIGHT COTTON CANVAS", "FADED PHTHALO GREEN ", "'OXYGEN' EVA PADDING", "WASHED CORDUROY COLLAR", "REMOVABLE SHOULDER PADDING", "LIGHT DISTRESSING", "MUTED-SILVER BRANDED HEM DRAW CORDS / ZIPPERS", "CLASSIC FRONT POCKETS"],
    disclaimer:
      "DUE TO THE NATURE OF OUR WASH / TREATMENT PROCESS SMALL IMPERFECTIONS / DIFFERENCES MAY APPEAR, THESE CHARACTERISTICS ARE CONSIDERED TO BE A PART OF THE DESIGN AND NOT A FLAW.",

    // FIT / SIZING
    sizing: {
      notes: [
        "FITS TRUE TO SIZE",
        "SIZE UP FOR AN OVERSIZED LOOK",
        "AROU IS 6'2 WEARING A SIZE XL",
        "EMMA IS 5'7 WEARING A SIZE LARGE",
      ],
      columns: ["S", "M", "L", "XL", "2XL"],
      rows: [
        { key: "PIT TO PIT", in: [23, 24, 25.5, 27, 29] },
        { key: "LENGTH", in: [24.5, 25.5, 26, 27, 28] },
      ],
    },

    // SHIPPING
    shippingList: [
      "SHIPS WITHIN 1 WEEK",
      "CUSTOMS NOTICE: ALL CUSTOMERS OUTSIDE THE UNITED STATES ARE RESPONSIBLE FOR THE CUSTOMS FEES / DUTIES THAT MAY BE CHARGED BY THEIR COUNTRY FOR IMPORT.",
    ],
  },

  {
    slug: "black-oxygen-padded-zip-up-hoodie",
    title: "'OXYGEN' PADDED ZIP-UP HOODIE",
    subtitle: "IN FADED STEALTH BLACK",
    price: 170,
    currency: "USD",
    img: "assets/images/oxygen-hoodie-black-title.jpg",
    images: [
      "assets/images/oxygen-hoodie-black-1.jpg",
      "assets/images/oxygen-hoodie-black-2.webp",
      "assets/images/oxygen-hoodie-black-3.jpg",
    ],
    sizes: ["S", "M", "L", "XL", "2XL"],
    cta: "ADD",

    details: ["14 OZ. COTTON IN STEALTH BLACK", "CIRCULAR EVA PADDING", "..."],
    disclaimer:
      "DUE TO THE NATURE OF OUR WASH / TREATMENT PROCESS SMALL IMPERFECTIONS / DIFFERENCES MAY APPEAR, THESE CHARACTERISTICS ARE CONSIDERED TO BE A PART OF THE DESIGN AND NOT A FLAW.",

    sizing: {
      notes: [
        "FITS TRUE TO SIZE",
        "MODEL IS 5'10 WEARING SIZE LARGE",
        "SIZE UP FOR AN OVERSIZED LOOK",
      ],
      columns: ["S", "M", "L", "XL", "2XL"],
      rows: [
        { key: "PIT TO PIT", in: [22.5, 24, 25.5, 27, 28.5] },
        { key: "LENGTH", in: [24, 24.5, 25.5, 26, 27] },
      ],
    },

    shippingList: [
      "SHIPS WITHIN 1 WEEK",
      "CUSTOMS NOTICE: ALL CUSTOMERS OUTSIDE THE UNITED STATES ARE RESPONSIBLE FOR THE CUSTOMS FEES / DUTIES THAT MAY BE CHARGED BY THEIR COUNTRY FOR IMPORT.",
    ],
  },
];

export function getProductBySlug(slug) {
  return PRODUCTS.find((p) => p.slug === slug) || null;
}

export function formatMoney(amount, currency = "USD") {
  const value = Number(amount).toFixed(2);
  const symbol = currency === "USD" ? "$" : "";
  return `${symbol}${value}`;
}