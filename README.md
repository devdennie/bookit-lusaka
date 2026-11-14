# bookit-lusaka

PamoHub is a static booking site for this repository. It is published on GitHub Pages at `https://devdennie.github.io/bookit-lusaka/`. There is no account system and no server. Bookings stay in this browser. Pages send `noindex`.

The interface does not label prices, phone numbers or businesses as examples. Where a price is missing, the page says **Price on request**. Empty hours, staff names and addresses are omitted or shown as still to be confirmed.

## Pages

| Page | File | What it shows |
| --- | --- | --- |
| Landing | `index.html` | PamoHub wordmark, hero, and **Choose your campus**. It does not list businesses. |
| Campuses | `campuses.html` | NIPA can be selected. ZCAS, Evelyn Hone College, UNZA (University of Zambia), Cavendish University Zambia and Copperbelt University are marked Coming soon and cannot be selected. Listing an institution does not imply a partnership. |
| NIPA services | `nipa.html` | Barbershop, salon, nail art, lash tech, tutoring, suit steaming, and photocopying and printing. Each card links to a booking page. |
| Booking | `book.html?config=` | One business: services, times, details, review, and WhatsApp when a number is set. |
| Owner | `owner.html?config=` | The schedule saved in this browser. |

Nail art and lash tech are one business, **Dinah's Nail Art & Lashes** (`dinah`). The two cards open the same page at the matching category.

Log in, Sign up, Bookings, Profile and Become a provider go to plain sections on the landing page. **Accounts are opening soon.** There is no password form.

## Run it

Node 20 or newer. The GitHub Pages workflow uses Node 24.

```bash
npm install
npm test
npm run dev
```

Open [http://localhost:5173/bookit-lusaka/](http://localhost:5173/bookit-lusaka/). The Vite `base` is `/bookit-lusaka/`.

Other pages:

- Campuses: [http://localhost:5173/bookit-lusaka/campuses.html](http://localhost:5173/bookit-lusaka/campuses.html)
- NIPA services: [http://localhost:5173/bookit-lusaka/nipa.html](http://localhost:5173/bookit-lusaka/nipa.html)
- Barber: [http://localhost:5173/bookit-lusaka/book.html?config=barber](http://localhost:5173/bookit-lusaka/book.html?config=barber)
- Salon: [http://localhost:5173/bookit-lusaka/book.html?config=salon](http://localhost:5173/bookit-lusaka/book.html?config=salon)
- Dinah, nails: [http://localhost:5173/bookit-lusaka/book.html?config=dinah#cat-nails](http://localhost:5173/bookit-lusaka/book.html?config=dinah#cat-nails)
- Dinah, lashes: [http://localhost:5173/bookit-lusaka/book.html?config=dinah#cat-lashes](http://localhost:5173/bookit-lusaka/book.html?config=dinah#cat-lashes)
- Tutoring: [http://localhost:5173/bookit-lusaka/book.html?config=tutoring](http://localhost:5173/bookit-lusaka/book.html?config=tutoring)
- Suit steaming: [http://localhost:5173/bookit-lusaka/book.html?config=steaming](http://localhost:5173/bookit-lusaka/book.html?config=steaming)
- Print and copy: [http://localhost:5173/bookit-lusaka/book.html?config=printing](http://localhost:5173/bookit-lusaka/book.html?config=printing)
- Owner: [http://localhost:5173/bookit-lusaka/owner.html](http://localhost:5173/bookit-lusaka/owner.html)

```bash
npm run build
npm run preview
```

The preview is at `http://localhost:4173/bookit-lusaka/`. The build writes `index.html`, `campuses.html`, `nipa.html`, `book.html` and `owner.html` into `dist`.

## Businesses

| File | Page | Notes |
| --- | --- | --- |
| `public/config/barber.json` | Extol the International Barber | Prices and WhatsApp are set. Hours, location, durations and staff name are empty. |
| `public/config/salon.json` | Chipo's Braids & Beauty, Kabulonga | Existing placeholder details. |
| `public/config/dinah.json` | Dinah's Nail Art & Lashes, NIPA Flats | Hours, deposits, WhatsApp and the call number are set. Service prices are empty. |
| `public/config/tutoring.json` | Tutoring | 60- and 90-minute sessions. Prices, hours, location, staff name and phone are empty. |
| `public/config/steaming.json` | Suit Steaming | Two-piece (20 min) and three-piece (30 min). Prices, hours, location and phone are empty. |
| `public/config/printing.json` | Print & Copy | Printing, photocopying and binding, 10 or 15 minutes. Prices, hours, location and phone are empty. Page prices are described in the service text. |

`?config=` must be lowercase letters, numbers and hyphens. The default is `salon` (`DEFAULT_CONFIG` in `src/config.js`).

## Editing provider details

JSON has no comments. Fill a null or empty value in the config file, save, and reload. `npm test` does not need the missing values.

Shared fields:

| Field | Meaning | Format |
| --- | --- | --- |
| `name` | Business name | Text |
| `initials` | Letters in the round mark | Short text |
| `area`, `city`, `address` | Where the business is | Text, or `null` to hide |
| `tagline` | Line under the name | Text |
| `hero.headline`, `hero.blurb` | Booking-page introduction | Text |
| `bubble` | Short line on the collage | Text |
| `collageAlt` | Description of the collage illustration | Text |
| `illustration` | Key in `src/art.js` (`salon`, `barber`, `dinah`, `tutoring`, `steaming`, `printing`) | Text |
| `staffNoun` | Word in “Choose a …” | Text, such as `barber` |
| `phone.whatsappE164` | WhatsApp number for the `wa.me` link and the visible number | Digits only, such as `260971234567`. Shown as `+260 971 234 567`. `null` hides WhatsApp. |
| `phone.call` | Separate call link | Digits as dialled, such as `0573954949`. Shown as `057 395 4949` with `tel:` using those digits. Not rewritten to `+260`. `null` hides Call. |
| `social` | Optional network and handle | `{ "network": "Instagram", "handle": "@name" }`. Handles containing “demo” are not shown. |
| `policies` | Booking policies | `{ "title": "Deposits", "body": "…" }`. Text containing “demo” or “Sample note” is not shown. |
| `intervalMinutes` | Gap between start times | Whole minutes, such as `30` |
| `openingHours` | One key per weekday | `null` means closed, or `{ "open": "09:00", "close": "17:00", "breaks": [] }`. Times are 24-hour `HH:MM`. If every day is `null`, the page says hours are to be confirmed. |
| `staff` | People who can take the booking | `{ "id": "barber", "name": "Ada", "role": "Barber" }`. An empty `name` is shown as Staff. |
| `categories` | Groups of services | `id`, `name`, `blurb`, and `services` |
| `services[].name` | Service name | Text |
| `services[].description` | Short description | Text |
| `services[].durationMinutes` | Length of the visit | Whole minutes, such as `45`. `null` means times are not listed yet. |
| `services[].priceZmw` | Price in Zambian kwacha | Number, such as `50` for K50, shown as `ZMW 50`. `null` shows **Price on request**. |
| `services[].depositZmw` | Deposit for that service, when it differs | Number of kwacha, or omit |
| `services[].staffIds` | Who can do it | Staff `id`s. Omit to allow every staff member. |
| `deposit.enabled` | Whether a deposit is part of this business | `true` or `false` |
| `deposit.amountZmw` | One deposit for every service | Number, or `null` when each service has `depositZmw` |
| `deposit.providers` | Optional on-page provider buttons | `{ "id": "mtn", "name": "MTN MoMo", "swatch": "#ffcb05" }`. An empty list skips that step. No payment is taken on the page. |
| `gallery` | Small illustrations on the booking page | `{ "src": "images/file.svg", "alt": "…" }` |

### Still to fill in

**`public/config/barber.json` (Extol the International Barber)**

- `area`, `city`, `address`
- `openingHours` for each weekday
- `staff[0].name` and `staff[0].role`
- `durationMinutes` on Haircut with dye, Haircut without dye, Lining with dye, Lining without dye, and Plain dyeing
- `social`, if you want any
- `phone.call`, if you want a call number as well as WhatsApp

Already set: name, the five service names, `priceZmw` (50, 40, 30, 15, 20), and `phone.whatsappE164` `260771606619`.

**`public/config/dinah.json` (Dinah's Nail Art & Lashes)**

- `priceZmw` on Full nail set and Lash set
- `city`, if you want one besides NIPA Flats
- `staff[0].role`, if you want one
- `social`, if you want any

Already set: name, staff name Dinah, hours, location NIPA Flats, nail duration 150, lash duration 45, deposits K30 and K50, WhatsApp `260967447059`, call `0573954949`, and the booking policies.

**`public/config/tutoring.json`**

- `name`, if Tutoring should be a business name
- `area`, `city`, `address`
- `openingHours`
- `staff[0].name` and `staff[0].role`
- `priceZmw` on both sessions
- `phone.whatsappE164` and `phone.call`
- `social`, if you want any

Already set: a 60-minute session and a 90-minute session.

**`public/config/steaming.json` (Suit Steaming)**

- `name`, if Suit Steaming should be a business name
- `area`, `city`, `address`
- `openingHours`
- `staff[0].name` and `staff[0].role`
- `priceZmw` on Suit steaming, two-piece and Suit steaming, three-piece
- `phone.whatsappE164` and `phone.call`
- `social`, if you want any

Already set: a 20-minute two-piece service and a 30-minute three-piece service.

**`public/config/printing.json` (Print & Copy)**

- `name`, if Print & Copy should be a business name
- `area`, `city`, `address`
- `openingHours`
- `staff[0].name` and `staff[0].role`
- `priceZmw` on Black and white printing, Colour printing, Photocopying and Binding
- `phone.whatsappE164` and `phone.call`
- `social`, if you want any

Already set: those four services, at 10 or 15 minutes. Descriptions say the price will be per page.

**`public/config/salon.json` (Chipo's Braids & Beauty)**

- Replace `phone.whatsappE164` (`260970000000`) when you have the real number
- Replace `social` handles
- Replace `policies` if you want them on the page. The current wording is hidden because it says “demo” or “Sample note”.

## What a customer can do

1. Pick a service. A number in `priceZmw` is shown in kwacha. `null` is shown as Price on request.
2. Optionally pick a staff member, or leave no preference.
3. Pick a date. Closed days are visible and cannot be selected. If hours are not set, the page says they are to be confirmed.
4. Pick a time, when `durationMinutes` is a number. Open times use 24-hour `HH:MM`. Grey times cannot be booked. A highlighted row is a longer booked stretch, such as `Fully booked 08:00-14:00`.
5. Enter a name and phone number, then review the booking.
6. Where a deposit is set, the review shows it. Provider buttons, when the config lists them, do not take payment.
7. Confirm. The booking is saved in this browser. If `phone.whatsappE164` is set, a `wa.me` link is built with the service, date, time, duration, price, name and phone.

A long visit only appears when the whole sitting fits before closing, misses any break, and does not overlap a booking or a block. For example, knotless braids, jumbo (six hours) only fit on Wednesday at the salon, because that is the day without a lunch break.

## Owner view

`owner.html` keeps the schedule for that business in this browser. On a phone the header is compact and scrolls away.

From a chosen day you can read that day's bookings, block time, remove a block, mark a booking completed or no-show, and restore the original bookings.

A confirmed or completed booking holds its slot. A no-show frees it. A booking made on the booking page is stored in `localStorage` and shows up in the owner view on the same device.

Storage key: `bookit-lusaka:v1:<config id>`.

## Data model

Times are 24-hour `HH:MM` in `Africa/Lusaka`. Dates are `YYYY-MM-DD`. Ranges are half-open: a booking that ends at 11:00 does not block an 11:00 start.

Sample bookings live in `public/data/seed.json`, keyed by the config id. `dayOffset` counts open days from today in Lusaka. They are copied into `localStorage` on first visit. **Restore original bookings** puts that list back.

### Service

```json
{
  "id": "haircut-dye",
  "name": "Haircut with dye",
  "description": "A haircut with dye.",
  "durationMinutes": null,
  "priceZmw": 50,
  "staffIds": ["barber"]
}
```

### Saved booking

Written to `localStorage` when someone confirms, or copied from the seed. Duration and price are copied from the service at that moment.

`status` is `confirmed`, `completed` or `no-show`. `depositDemo` is a provider id if that screen was used, otherwise `null`. It does not mean money moved.

## Slot rules

`src/slots.js` builds the time list. `npm test` covers it. The slot rules are unchanged.

A start time is offered only when all of these are true:

- the weekday is open
- the service finishes at or before closing
- the sitting does not overlap a break
- for the chosen person, or for at least one eligible person when there is no preference, the sitting does not overlap a confirmed or completed booking
- the same is true for blocked time, including whole-shop blocks
- the start is not already in the past when the date is today

No-show and cancelled bookings do not hide a slot.

## Hero background

The landing hero uses one collage, `public/images/pamohub-collage.webp`, as a blurred background behind a deep-teal overlay. Two copies are stacked and drift upward in a loop. It is decorative: hidden from assistive technology, with empty alt text, and it does not receive clicks or focus. Hover or keyboard focus inside the hero pauses the drift. `prefers-reduced-motion` stops it.

Photographer credits are `public/data/credits.json`. The footer lists each photographer and links to the Pexels page for that photo. Photography and laundry are only in the collage. They are not businesses on the NIPA page.

## Colour and type

Deep teal `#102B35`, mint `#D7F5E8`, off-white `#F7F8F5`, charcoal `#242B2E`, and white cards. Muted grey `#899397` is not used for body text, because it does not meet WCAG AA on this background. Secondary text uses `#3E494C`.

Headings are Manrope Bold. Body text is Inter Regular. Buttons and labels are Inter SemiBold. Both families are served by Google Fonts under the SIL Open Font License.

Illustrations on the booking pages are original SVGs. The hero collage is the Pexels photograph sheet listed in `public/data/credits.json`.

## Deploy

`.github/workflows/deploy.yml` publishes `dist` to GitHub Pages on a push to `main`. In the repository settings, set Pages to **GitHub Actions**.

## Licence

MIT. See [LICENSE](LICENSE). The hero collage photographs are used under the Pexels License.
