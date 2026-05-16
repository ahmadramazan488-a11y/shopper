# Customizing Bayad Pizza

Most restaurant content now lives in small data files, so you can update the menu without touching the cart and checkout logic.

## Menu items

Edit `data/products.js` to change dishes, prices, badges, descriptions, photos, colors, and detail text.

Each item supports:

- `name`: dish name shown on cards, cart, and detail view
- `price`: menu price in US dollars
- `badge`: small label such as `Popular` or `Bayad special`
- `image`: local or remote image URL
- `imageAlt`: image description for accessibility
- `description`: short card text
- `detail`: longer dish detail text

## Interface text

Edit `data/translations.js` to change reusable button labels, cart messages, detail bullets, and toast messages.

Add another language by creating a new language key beside `en`, then matching the same text keys.

## App behavior

The cart, product rendering, search, modals, and checkout behavior stay in `script.js`.
