export const PRODUCT_EXTRA_BY_SLUG = {
  "green-oxygen-heavy-jacket": {
    sizes: ["S", "M", "L", "XL", "2XL"],
    cta: "ADD",
    details: [
      "HEAVYWEIGHT COTTON CANVAS",
      "FADED PHTHALO GREEN",
      "'OXYGEN' EVA PADDING",
      "WASHED CORDUROY COLLAR",
      "REMOVABLE SHOULDER PADDING",
      "LIGHT DISTRESSING",
      "MUTED-SILVER BRANDED HEM DRAW CORDS / ZIPPERS",
      "CLASSIC FRONT POCKETS",
    ],
    disclaimer:
      "DUE TO THE NATURE OF OUR WASH / TREATMENT PROCESS SMALL IMPERFECTIONS / DIFFERENCES MAY APPEAR, THESE CHARACTERISTICS ARE CONSIDERED TO BE A PART OF THE DESIGN AND NOT A FLAW.",
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
    shippingList: [
      "SHIPS WITHIN 1 WEEK",
      "CUSTOMS NOTICE: ALL CUSTOMERS OUTSIDE THE UNITED STATES ARE RESPONSIBLE FOR THE CUSTOMS FEES / DUTIES THAT MAY BE CHARGED BY THEIR COUNTRY FOR IMPORT.",
    ],
    currency: "USD",
  },

  "black-oxygen-padded-zip-up-hoodie": {
    sizes: ["S", "M", "L", "XL", "2XL"],
    cta: "ADD",
    details: [
      "14 OZ. COTTON IN STEALTH BLACK",
      "CIRCULAR EVA PADDING",
      "SIGNATURE GATHER STITCH DETAILING",
      "WAFFLE THERMAL LINING",
      "SMALL REMOVABLE SHOULDER PADS",
      "DOUBLE-LAYERED HOOD",
      "BOX FRONT POCKET",
      "RIBBED WAISTBAND / SLEEVE CUFFS",
      "HEM DRAW CORDS",
      "HEAVY WASH - SLIGHTLY DISTRESSED",
    ],
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
    currency: "USD",
  },

  "green-oxygen-padded-zip-up-hoodie": {
    sizes: ["S", "M", "L", "XL", "2XL"],
    cta: "ADD",
    details: [
      "14 OZ. COTTON IN STEALTH BLACK",
      "CIRCULAR EVA PADDING",
      "SIGNATURE GATHER STITCH DETAILING",
      "WAFFLE THERMAL LINING",
      "SMALL REMOVABLE SHOULDER PADS",
      "DOUBLE-LAYERED HOOD",
      "BOX FRONT POCKET",
      "RIBBED WAISTBAND / SLEEVE CUFFS",
      "HEM DRAW CORDS",
      "HEAVY WASH - SLIGHTLY DISTRESSED",
    ],
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
    currency: "USD",
  },

  "bubblegum-oxygen-padded-zip-up-hoodie": {
    sizes: ["S", "M", "L", "XL", "2XL"],
    cta: "ADD",
    details: [
      "14 OZ. COTTON IN BUBBLEGUM",
      "CIRCULAR EVA PADDING",
      "SIGNATURE GATHER STITCH DETAILING",
      "WAFFLE THERMAL LINING",
      "SMALL REMOVABLE SHOULDER PADS",
      "DOUBLE-LAYERED HOOD",
      "BOX FRONT POCKET",
      "RIBBED WAISTBAND / SLEEVE CUFFS",
      "HEM DRAW CORDS",
      "HEAVY WASH - SLIGHTLY DISTRESSED",
    ],
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
    currency: "USD",
  },
};

export function getExtraBySlug(slug) {
  return PRODUCTS_EXTRA.find((p) => p.slug === slug) || null;
}