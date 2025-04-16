const API_URL = "https://readily-helped-roughy.ngrok-free.app/api/presence";

function sendPresence(name, tab) {
  if (!tab || !tab.url || !tab.url.startsWith("http")) return;

  const url = new URL(tab.url);
  const favicon = url.origin + "/favicon.ico";

  const payload = {
    name,
    url: tab.url,
    favicon,
    timestamp: Date.now(),
  };

  fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  }).catch((err) => console.error("Tracking error:", err));
}

function trackTab(tab) {
  chrome.storage.local.get("userName", (data) => {
    const name = data.userName;
    if (!name) {
      console.warn(
        "[Website Tracker] No name set. Open extension options to set it."
      );
      return;
    }
    sendPresence(name, tab);
  });
}

chrome.tabs.onActivated.addListener(({ tabId }) => {
  chrome.tabs.get(tabId, (tab) => {
    trackTab(tab);
  });
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === "complete") {
    trackTab(tab);
  }
});

// Open onboarding page after install
chrome.runtime.onInstalled.addListener(({ reason }) => {
  if (reason === "install") {
    chrome.runtime.openOptionsPage();
  }
});
