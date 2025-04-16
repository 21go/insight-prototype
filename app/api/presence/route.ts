import { NextRequest, NextResponse } from 'next/server';

type PresenceInfo = {
  url: string;
  favicon: string;
  timestamp: number;
};

const presenceMap = new Map<string, PresenceInfo>();

const STUDY_APP_URL = 'https://readily-helped-roughy.ngrok-free.app';
const DEFAULT_FAVICON = `${STUDY_APP_URL}/favicon.ico`;
const now = Date.now();

// Gender-neutral names
const names = [
  "Alex",
  "Casey",
  "Charlie",
  "Dakota",
  "Drew",
  "Elliot",
  "Emerson",
  "Finley",
  "Harper",
  "Jamie",
  "Jordan",
  "Kai",
  "Logan",
  "Morgan",
  "Parker",
  "Quinn",
  "Reese",
  "Riley",
  "Rowan",
  "Taylor"
];

// ✅ Initialize presenceMap with defaults
for (const name of names) {
  presenceMap.set(name, {
    url: STUDY_APP_URL,
    favicon: DEFAULT_FAVICON,
    timestamp: now,
  });
}

export async function POST(req: NextRequest) {
  const { name, url, favicon, timestamp } = await req.json();

  if (!name || !url || !timestamp) {
    return NextResponse.json({ error: 'Missing name, url, or timestamp' }, { status: 400 });
  }

  presenceMap.set(name, { url, favicon, timestamp });

  console.log(presenceMap);

  return NextResponse.json({ status: 'ok' });
}

export async function GET() {
  const data = Object.fromEntries(presenceMap.entries());
  return NextResponse.json(data);
}