# fair-plate-app
Split a meal bill by what each person ate. Ionic + Angular (Capacitor), no backend.

## Flow
1. **Split tab**: amount paid, shop, who was there.
2. **Who ate what**: pick a person, add items with +/-. The people icon shares one dish between several people.
3. **Who pays what**: each person's total. Tax/extras (amount paid minus items) are shared in proportion to items. Share the summary.

## Setup data (Shops / People tabs)
Shops (name), menu items (name, price, optional photo), people (name, optional photo).

## Storage
Everything is saved on the device with `@capacitor/preferences` (native storage on phones, localStorage in the browser). Photos are shrunk and stored as data URLs. See `src/app/store.service.ts`.

## Run
```
npm install
npx ionic serve
# phone: npx ionic cap add android && npx ionic cap sync && npx ionic cap open android
```
