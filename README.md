# Insight Prototype

This is a video conferencing prototype built with Next.js and LiveKit, designed for a user study on candid interaction in virtual spaces. The project builds on research from the Snapchat paper exploring natural, transparent communication online. It aims to examine how participants behave when given greater awareness and control over presence and visibility.

The prototype integrates with a Chrome extension to track browser activity and synchronize tab status and current site across participants in real time.

## Features

- Real-time video conferencing using LiveKit
- Participant presence detection (browser tab active vs inactive)
- Shared website information and favicon via extension
- Deferred screen sharing: screen is recorded from join time but only visible to others when scrolled into view
- Custom participant identification
- Chrome extension for in-browser monitoring

## Technology Stack

- Next.js
- LiveKit (client SDK + server)
- Chrome Extension API
- GCP buckets for blob storage

## Purpose and Background

This system supports a user study on candidness and transparency in virtual spaces. It draws inspiration from the Snapchat paper, ["Candid Interaction: Revealing Hidden Dynamics in Digital Communication"](https://dl.acm.org/doi/10.1145/2807442.2807449), which explores ambient communication, awareness cues, and synchronous media-sharing. The goal is to evaluate how enhanced visibility, such as tab activity and current URL sharing, influences participants' communication dynamics, comfort levels, and overall interaction experience during video conferencing.

## Cloud Hosted Project
To see a demo of this project hosted on Vercel, visit this site: https://insight-prototype.vercel.app/.
## Getting Started

### 1. Clone the repository

```bash
git clone git@github.com:21go/insight-prototype.git
cd insight-prototype
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create a `.env.local` file:

```env
LIVEKIT_API_KEY=your_livekit_api_key
LIVEKIT_API_SECRET=your_livekit_api_secret
LIVEKIT_URL=https://your-livekit-server

# Optional: GCP settings for recording
GCP_BUCKET=your_bucket_name
GCP_CREDENTIALS_JSON=your_gcp_credentials_json_string
```

### 4. Run the app locally

```bash
npm run dev
```

Open your browser and go to:

```
http://localhost:3000
```

To join a room, visit:

```
http://localhost:3000/rooms/fd5y-ud2t
```

## Chrome Extension Setup

The browser extension is required for monitoring tab status and sharing the current website.

### Installation steps:

1. Open Google Chrome and go to `chrome://extensions`
2. Enable **Developer mode** in the top-right corner
3. Click **"Load unpacked"**
4. Select the `extension/` folder in this repository
5. Once installed, click Details for that new extension
6. Scroll down to Extension Options
7. Enter your participant name in the popup interface. This name should match the name you will use in the meeting room.

The extension will:

- Detect whether the user is focused or away from the browser tab
- Collect the URL of the current site and its favicon
- Send this data to the video app backend for display to other participants

## Optional: Recording API

If cloud recording is configured, you can trigger a recording session by sending a GET to the route below. Note that a GCP bucket and credentials will have to be set up for this to function.

```
/api/record/start?roomName=ROOM_ID
```

Make sure GCP credentials and storage settings are properly configured.

## Project Structure

```
/
├── components/           - React components for LiveKit and UI
├── app/                  - Next.js API routes and page views
├── public/               - Static assets
├── extension/            - Chrome extension source code
├── styles/               - CSS and global styling
├── lib/                  - Utility modules and LiveKit helpers
└── .env.local            - Environment config (you need to add this)
```

## License

This project is open source and available under the Apache License.
