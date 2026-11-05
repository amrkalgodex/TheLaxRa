# Bunfire — site code

A static, dependency-free rebuild of the Bunfire burger site. No build step:
every file is edited directly and served as-is.

```
bunfire/
├── index.html              home — hero, 9.00 challenge, lineup, footer
├── menu.html               item page, reads ?item=<slug>
└── assets/
    ├── styles.css          all styling and breakpoints
    ├── data.js             menu content — prices, copy, categories, images
    ├── app.js              lineup, bag, checkout, stopwatch
    └── images/             burger photography (jpg)
```

## Editing

- **Menu, prices, copy** — `assets/data.js`. `slug` is the URL key
  (`menu.html?item=honey-hot-bird`), `categories` drive the lineup filters,
  `tag` is the pill on the card.
- **Look and feel** — `assets/styles.css`. Brand tokens live at the top in
  `:root` (cream `#fcfaf6`, ink `#1e1a17`, orange `#d7542d`, dark `#26201d`).
- **Behaviour** — `assets/app.js`: bag state in `localStorage`
  (`bunfire.bag.v1`), orders in `bunfire.orders.v1`, and the stopwatch.

## Locally

The repository root is already served on port 3000, so this folder is at
`http://localhost:3000/bunfire/`.

## Known limits

- Checkout is client-side only: an order is written to the browser's
  `localStorage` and shown to the customer, but nothing is sent anywhere yet.
  Connecting an order endpoint (or a WhatsApp/phone handoff) is the next step
  before taking real orders.
- The stopwatch compares hundredths against exactly `9.00`; the code shown on
  a win is generated in the browser, not validated server-side.
- Fonts load from Google Fonts (Instrument Serif + Inter) with Georgia/system
  fallbacks if they are unreachable.
