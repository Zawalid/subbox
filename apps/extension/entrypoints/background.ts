export default defineBackground(() => {
  // Handle messages from content scripts or popup
  browser.runtime.onMessage.addListener((message: unknown, sender) => {
    const msg = message as { type: string; data?: unknown };
    if (msg.type === "PING") {
      return Promise.resolve({ pong: true });
    }
  });
});
