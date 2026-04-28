# Hair Stylist App

An AI-powered mobile app that analyzes your face shape, skin tone, and hair texture from a selfie and returns personalized hairstyle recommendations.

---

## Demo

> _Add a screenshot or screen recording here. Drag an image into this section or run `xcrun simctl io booted screenshot screenshot.png` to capture the iOS Simulator._

```
[ Welcome Screen ] → [ Selfie Camera ] → [ AI Analysis ] → [ Results + Recommendations ]
```

---

## What It Does

1. **Welcome** — Onboarding screen introduces the app.
2. **Capture** — The front-facing camera guides the user to center their face in a frame. The photo is captured at 50 % quality and encoded as base64 to keep payload size small.
3. **Analyze** — The base64 image is POSTed to a backend API (`/api/analyze`). The backend runs a MediaPipe face-mesh and hair-segmentation pipeline and returns structured results.
4. **Recommend** — The results screen displays the detected face shape, skin tone, and hair texture alongside a ranked list of hairstyle suggestions, each with a plain-language reason.

---

## Architecture

```
┌─────────────────────────────────┐        HTTP POST /api/analyze
│  React Native / Expo (this repo)│ ─────────────────────────────► Backend server
│                                 │ ◄─────────────────────────────  (separate repo)
│  WelcomeScreen                  │        JSON: faceShape,
│  SelfieCamera (expo-camera)     │              skinTone,
│  ResultsScreen                  │              hairTexture,
│                                 │              suggestions[]
└─────────────────────────────────┘
```

The mobile client only captures and displays. All ML inference lives in the backend.

---

## Technical Challenge: MediaPipe in a Server-Side Node.js Environment

MediaPipe's JavaScript SDK (`@mediapipe/tasks-vision`) is compiled to **WebAssembly** and designed for the browser. It assumes a rich DOM environment — `HTMLCanvasElement`, `OffscreenCanvas`, `ImageBitmap`, `createImageBitmap`, `fetch`, and `self` are all expected to exist at import time.

Running it in Node.js (where none of those exist) causes the WASM module to throw before it can initialize.

### The WASM Shim Approach

The backend solves this with a lightweight compatibility shim loaded **before** any MediaPipe import:

```js
// wasm-shim.js  — loaded first via --require or top of server entry
import { createCanvas } from 'canvas';           // node-canvas for CPU rendering
import { Blob } from 'buffer';
import { fetch } from 'undici';

// Patch globals MediaPipe checks for at init time
globalThis.document = {
  createElement: (tag) => (tag === 'canvas' ? createCanvas(1, 1) : {}),
};
globalThis.window = globalThis;
globalThis.self    = globalThis;
globalThis.fetch   = fetch;
globalThis.Blob    = Blob;
globalThis.ImageData = class ImageData {
  constructor(data, width, height) {
    this.data = data; this.width = width; this.height = height;
  }
};
```

Then the MediaPipe `FilesetResolver` is pointed at the local WASM binary (not a CDN URL) so the module never tries to `fetch` in a browser context:

```js
const vision = await FilesetResolver.forVisionTasks(
  path.join(__dirname, '../node_modules/@mediapipe/tasks-vision/wasm')
);
const segmenter = await ImageSegmenter.createFromOptions(vision, {
  baseOptions: { modelAssetPath: './models/hair_segmentation.tflite' },
  outputCategoryMask: true,
});
```

### Why Not Python?

Python MediaPipe (`mediapipe` package) would also work but adds a heavy native dependency and a cross-language HTTP boundary. Keeping the backend in Node.js means one runtime, one deploy unit, and full TypeScript types end-to-end.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Mobile framework | React Native + Expo SDK 54 |
| Language | TypeScript (strict) |
| Navigation | React Navigation — Native Stack |
| Camera | `expo-camera` |
| Image pick fallback | `expo-image-picker` |
| Backend (separate) | Node.js + MediaPipe WASM + Claude API |

---

## Getting Started

### Prerequisites

- Node.js 20+
- Expo CLI (`npm install -g expo-cli`)
- iOS Simulator (Xcode) or Android Emulator, or the Expo Go app on a physical device

### Install

```bash
git clone https://github.com/your-username/hair-stylist-app.git
cd hair-stylist-app
npm install
```

### Configure

Create `.env` in the project root:

```env
EXPO_PUBLIC_API_URL=http://<your-local-ip>:3000
```

Replace `<your-local-ip>` with your machine's LAN IP (e.g. `192.168.1.42`). The device and your machine must be on the same network. Find it with `ipconfig getifaddr en0` on macOS.

### Run

```bash
npm start          # Expo dev server (scan QR with Expo Go)
npm run ios        # iOS Simulator
npm run android    # Android Emulator
```

---

## Project Structure

```
src/
├── components/
│   └── SelfieCamera.tsx     # Camera preview, capture, gallery fallback
├── screens/
│   ├── WelcomeScreen.tsx    # Onboarding
│   ├── HomeScreen.tsx       # Camera wrapper
│   └── ResultsScreen.tsx    # Analysis display
├── services/
│   └── api.ts               # analyzeFace() — POST to backend
└── types/
    └── navigation.ts        # RootStackParamList
```

---

## Environment Variables

| Variable | Description |
|---|---|
| `EXPO_PUBLIC_API_URL` | Base URL of the backend server, e.g. `http://192.168.1.42:3000` |

---

## License

MIT
