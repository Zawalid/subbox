export default defineContentScript({
  matches: ["*://www.youtube.com/channel/*", "*://www.youtube.com/@*", "*://www.youtube.com/*"],
  main() {
    const WEB_URL = import.meta.env.VITE_WEB_URL ?? "http://localhost:3001";

    function isChannelPage(): boolean {
      return (
        location.pathname.startsWith("/channel/") ||
        location.pathname.startsWith("/@")
      );
    }

    function getChannelId(): string | null {
      const canonical = document.querySelector<HTMLLinkElement>("link[rel='canonical']");
      if (canonical?.href) {
        const match = canonical.href.match(/\/channel\/(UC[\w-]+)/);
        if (match) return match[1];
      }
      const urlMatch = location.pathname.match(/\/channel\/(UC[\w-]+)/);
      if (urlMatch) return urlMatch[1];
      return null;
    }

    function getChannelName(): string {
      return (
        document.querySelector<HTMLElement>("yt-formatted-string.ytd-channel-name")?.textContent?.trim() ??
        document.querySelector<HTMLElement>("#channel-header yt-formatted-string")?.textContent?.trim() ??
        document.querySelector<HTMLElement>("h1.ytd-channel-name")?.textContent?.trim() ??
        document.title.replace(" - YouTube", "").trim()
      );
    }

    function getChannelThumbnail(): string {
      return (
        document.querySelector<HTMLImageElement>("#channel-header img")?.src ??
        document.querySelector<HTMLImageElement>("yt-img-shadow#avatar img")?.src ??
        ""
      );
    }

    function injectOverlay(channelId: string, channelName: string) {
      if (document.getElementById("subbox-overlay")) return;

      const overlay = document.createElement("div");
      overlay.id = "subbox-overlay";
      overlay.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        background: #1a1a2e;
        color: white;
        border: 1px solid #6366f1;
        border-radius: 12px;
        padding: 12px 16px;
        z-index: 9999;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        font-size: 13px;
        box-shadow: 0 4px 20px rgba(99, 102, 241, 0.3);
        min-width: 200px;
        max-width: 280px;
      `;

      overlay.innerHTML = `
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px;">
          <span style="font-weight:600;font-size:14px;">📦 Subbox</span>
          <button id="subbox-close" style="background:none;border:none;color:#aaa;cursor:pointer;font-size:16px;padding:0;line-height:1;">×</button>
        </div>
        <div style="color:#a5b4fc;font-size:12px;margin-bottom:8px;word-break:break-word;">${channelName}</div>
        <a href="${WEB_URL}/dashboard" target="_blank" style="
          display:block;
          background:#6366f1;
          color:white;
          text-align:center;
          padding:6px 12px;
          border-radius:6px;
          text-decoration:none;
          font-size:12px;
          font-weight:500;
        ">Open in Subbox ↗</a>
      `;

      document.body.appendChild(overlay);

      document.getElementById("subbox-close")?.addEventListener("click", () => {
        overlay.remove();
      });
    }

    let injected = false;
    let lastUrl = location.href;

    function tryInject() {
      if (!isChannelPage()) return;
      if (injected) return;
      const channelId = getChannelId();
      const channelName = getChannelName();
      if (channelName) {
        injectOverlay(channelId ?? "", channelName);
        injected = true;
      }
    }

    setTimeout(tryInject, 1000);
    setTimeout(tryInject, 2500);

    // Watch for SPA navigation using URL change detection
    const observer = new MutationObserver(() => {
      if (location.href !== lastUrl) {
        lastUrl = location.href;
        injected = false;
        document.getElementById("subbox-overlay")?.remove();
        setTimeout(tryInject, 1000);
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });

    browser.runtime.onMessage.addListener((message: unknown) => {
      const msg = message as { type: string };
      if (msg.type === "GET_CHANNEL_INFO") {
        return Promise.resolve({
          channelId: getChannelId(),
          channelName: getChannelName(),
          thumbnail: getChannelThumbnail(),
          url: location.href,
          isChannelPage: isChannelPage(),
        });
      }
    });
  },
});
