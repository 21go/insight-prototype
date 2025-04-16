const input = document.getElementById("nameInput");
const button = document.getElementById("saveBtn");
const status = document.getElementById("status");

button.addEventListener("click", () => {
  const name = input.value.trim();
  if (!name) return;

  chrome.storage.local.set({ userName: name }, () => {
    status.textContent = `Saved as "${name}"`;
  });
});

// Pre-fill if previously saved
chrome.storage.local.get("userName", (data) => {
  if (data.userName) {
    input.value = data.userName;
  }
});
