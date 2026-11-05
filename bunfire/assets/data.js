/* Bunfire — menu data.
   Edit prices, descriptions and categories here; every page reads from this file. */
window.BUNFIRE = {
  brand: {
    name: "Bunfire",
    tagline:
      "Smashed to order on a screaming-hot plancha. Never frozen, never rushed, never boring.",
    address: "14 Char Lane, Bandra West",
    pickupNote: "Pickup ready in ~15 minutes",
  },

  filters: [
    { id: "all", label: "Everything" },
    { id: "signature", label: "Signature" },
    { id: "beef", label: "Beef" },
    { id: "chicken", label: "Chicken" },
    { id: "veggie", label: "Veggie" },
    { id: "sides", label: "Sides" },
  ],

  featured: {
    name: "The Original Smash",
    note: "Most ordered this week",
    image: "assets/images/d85c0964e.jpg",
  },

  products: [
    {
      slug: "honey-hot-bird",
      legacyId: "6addd92f8e2ed66c793ab066",
      name: "Honey Hot Bird",
      price: 29,
      tag: "Chicken",
      categories: ["chicken", "signature"],
      description:
        "Buttermilk-brined thigh fried hard, creamy slaw, thick-cut pickles and a glossy honey-chilli glaze that drips down your wrist.",
      ingredients: ["Buttermilk fried", "Honey chilli", "Crispy"],
      heat: true,
      image: "assets/images/e4ed46228.jpg",
    },
    {
      slug: "forest-floor",
      legacyId: "6addd92f8e2ed66c793ab067",
      name: "Forest Floor",
      price: 39,
      tag: "Beef",
      categories: ["beef"],
      description:
        "Wild mushrooms seared in butter piled over a beef patty with melted swiss and roasted garlic aioli. Deep, savoury and quietly addictive.",
      ingredients: ["Swiss", "Wild mushrooms", "Garlic aioli"],
      image: "assets/images/51acf21c3.jpg",
    },
    {
      slug: "chess-burger",
      legacyId: "6addd92f8e2ed66c793ab068",
      name: "Chess Burger",
      price: 49,
      tag: "Beef",
      categories: ["beef", "signature"],
      badge: "House favourite",
      description: "100% best chess use in this burger",
      ingredients: ["Smoked bacon", "Onion ring", "Bourbon BBQ"],
      heat: true,
      image: "assets/images/c43d63cdd.jpg",
    },
    {
      slug: "garden-beast",
      legacyId: "6addd92f8e2ed66c793ab06a",
      name: "Garden Beast",
      price: 25,
      tag: "Veggie",
      categories: ["veggie"],
      description:
        "Beetroot and black bean patty, smashed avocado, sprouts and vegan aioli on a seeded bun. Nothing apologetic about it. high level of vegitable",
      ingredients: ["Plant based", "Avocado", "Seeded bun"],
      image: "assets/images/38cb5460c.jpg",
    },
    {
      slug: "french-fries",
      legacyId: "6aded7019c0cb25829410f04",
      name: "French Fries",
      price: 20,
      tag: "Sides",
      categories: ["sides"],
      description:
        "Hand-cut, double-fried and dusted with flaky sea salt. Roasted garlic aioli on the side.",
      ingredients: ["Hand-cut", "Sea salt", "Garlic aioli"],
      image: "assets/images/f07af4a5e.jpg",
    },
  ],

  hours: [
    { days: "Mon – Thu", time: "12:00 – 23:00" },
    { days: "Fri – Sun", time: "12:00 – 01:00" },
  ],
};
