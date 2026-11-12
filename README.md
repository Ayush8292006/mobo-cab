# MOBO Cab — Rider App (Frontend Prototype)

Rapido-style ride-hailing app UI built with **React 18 + Vite**. Frontend only — all data is mocked so the full flow can be demoed to the client.

## Run

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # production build in /dist
```

## Flows included
- Splash → Login (+91 mobile) → OTP (auto-read) → Name
- Home: live map with nearby captains, destination search, saved places, ride tiles, offers carousel, refer & safety cards
- Search pickup / drop → Choose ride (Bike, Auto, Cab Economy, Cab Premium) with fare, ETA, payment & coupons
- Finding captain → Captain assigned (OTP, plate, call / chat / share / SOS) → Live trip → Ride complete (fare, rating, tip)
- Cancel ride with reasons, chat with captain (quick replies)
- Activity (ride history + details + book again), Account, Wallet, Parcel, Rentals, Offers, Refer & earn, Safety, Help, Saved places, Profile, Notifications

## Project structure
```
src/
  main.jsx               entry
  App.jsx                screen registry + layout (tabs, sheet, toast)
  styles.css             all styles (design tokens in :root)
  data.js                mock data: places, vehicles, pricing, coupons, captains
  utils.js               formatting & helpers
  context/AppContext.jsx app state, stack navigation (go/back/tab/replace), toast, bottom sheet
  components/ui.jsx      Icon, Art (vehicle illustrations), BackButton, Header, TabBar, TripCard, Option…
  components/iconPaths.js, art.js   icon + illustration SVG data
  map/mapBase.js         SVG city map + overlays (routes, markers)
  map/MapView.jsx        map layer + vehicle animation along a route
  screens/               Auth, Home, Search, Ride (route → done + chat), Tabs, More
  sheets/Sheets.jsx      bottom sheets (payment, fare info, cancel, SOS, share, call…)
```

## Going to production
- Replace `MapView` with Google Maps / Mapbox (keep the same props: route, markers, moving vehicle).
- Replace mock data in `data.js` and the timers in `screens/Ride.jsx` (`T_SEARCH`, `T_APPROACH`, `T_TRIP`) with API + WebSocket ride status.
- Navigation is a small stack in `AppContext` — swap for React Router / React Navigation if needed.
