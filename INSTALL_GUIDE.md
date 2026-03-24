# ActivityHub PWA — Install on Your Phone

## What's a PWA?
A Progressive Web App works like a native app — it lives on your home screen,
works offline, sends push notifications, and loads instantly. No App Store needed.

---

## Files in this folder
```
activityhub-pwa/
├── index.html          ← Full app (all screens + chat + map)
├── manifest.json       ← App name, icon, theme, shortcuts
├── sw.js               ← Service worker (offline + notifications)
├── offline.html        ← Shown when there's no internet
├── generate-icons.js   ← Script to generate all icon sizes
└── icons/              ← Place your generated icons here
```

---

## Step 1 — Generate app icons

```bash
npm install canvas
node generate-icons.js
# Creates icons/icon-72.png through icon-512.png
```

Or use a free online tool: https://www.pwabuilder.com/imageGenerator
Upload any square image (your logo) and it generates all sizes.

---

## Step 2 — Deploy to Netlify (free, 2 min)

1. Go to https://netlify.com → Sign up free
2. Drag and drop the entire `activityhub-pwa/` folder onto the Netlify dashboard
3. Your app is live at e.g. `https://activityhub-xyz.netlify.app`

OR via CLI:
```bash
npm install -g netlify-cli
cd activityhub-pwa
netlify deploy --prod --dir .
```

---

## Step 3 — Connect your backend

Open `index.html`, find this line near the bottom of the script:
```js
const API = "http://localhost:5000";
```
Change it to your Render.com backend URL:
```js
const API = "https://activityhub-api.onrender.com";
```

---

## Step 4 — Install on your phone

### Android (Chrome):
1. Open `https://your-app.netlify.app` in Chrome
2. Tap the 3-dot menu → "Add to Home screen"
3. Tap "Install" — done!
   (Or wait 3 seconds — the install banner appears automatically)

### iPhone (Safari):
1. Open `https://your-app.netlify.app` in Safari
2. Tap the Share button (box with arrow)
3. Scroll down → tap "Add to Home Screen"
4. Tap "Add" — done!

### Note for iOS:
iOS does not support the automatic install prompt — users must use
Safari's Share → Add to Home Screen manually.

---

## Step 5 — Enable HTTPS (required for PWA)

Netlify automatically provides HTTPS. If self-hosting, use Let's Encrypt:
```bash
certbot --nginx -d yourdomain.com
```
Service workers only work on HTTPS (or localhost for development).

---

## PWA Features included

| Feature | Status |
|---------|--------|
| Add to home screen | Ready |
| Offline fallback page | Ready |
| App icon (all sizes) | Ready (generate with script) |
| Splash screen | Ready |
| Full-screen mode | Ready |
| Theme color (dark) | Ready |
| Push notifications | Ready (needs VAPID key) |
| Background sync | Ready |
| Deep links (?tab=map) | Ready |
| Android back button | Ready |
| App shortcuts | Ready (Map, Chat) |

---

## Push notifications setup (optional)

To enable real push notifications:

1. Generate VAPID keys:
```bash
npm install web-push
npx web-push generate-vapid-keys
```

2. Add to backend `.env`:
```
VAPID_PUBLIC_KEY=your_public_key
VAPID_PRIVATE_KEY=your_private_key
VAPID_EMAIL=mailto:you@email.com
```

3. Add push subscription endpoint to backend:
```js
app.post('/api/push/subscribe', protect, async (req, res) => {
  // Save subscription to user's record in MongoDB
  await User.findByIdAndUpdate(req.user._id, { pushSubscription: req.body });
  res.json({ message: 'Subscribed' });
});
```

4. Uncomment the push subscription code in `index.html`
