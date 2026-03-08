import { useState, useEffect } from "react";
import "./App.css";

type ChannelInfo = {
  channelId: string | null;
  channelName: string;
  thumbnail: string;
  url: string;
  isChannelPage: boolean;
};

type AuthStatus = "loading" | "authenticated" | "unauthenticated";

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3000";
const WEB_URL = import.meta.env.VITE_WEB_URL ?? "http://localhost:3001";

const SubboxIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15V6"/><path d="M18.5 18a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z"/>
    <path d="M12 12H3"/><path d="M16 6H3"/><path d="M12 18H3"/>
  </svg>
);

const ExternalIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
    <polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/>
  </svg>
);

function App() {
  const [channelInfo, setChannelInfo] = useState<ChannelInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [authStatus, setAuthStatus] = useState<AuthStatus>("loading");

  useEffect(() => {
    browser.tabs.query({ active: true, currentWindow: true }).then((tabs) => {
      const tab = tabs[0];
      if (!tab?.id) { setIsLoading(false); return; }

      const isYouTube = tab.url?.includes("youtube.com");
      if (!isYouTube) { setIsLoading(false); return; }

      browser.tabs
        .sendMessage(tab.id, { type: "GET_CHANNEL_INFO" })
        .then((response: ChannelInfo) => setChannelInfo(response))
        .catch(() => {})
        .finally(() => setIsLoading(false));
    });

    // Session cookies are set on the web app domain (via proxy), check against WEB_URL
    fetch(`${WEB_URL}/api/auth/get-session`, { credentials: "include" })
      .then((r) => r.json())
      .then((data: { session?: unknown }) =>
        setAuthStatus(data?.session ? "authenticated" : "unauthenticated")
      )
      .catch(() => setAuthStatus("unauthenticated"));
  }, []);

  return (
    <div className="app">
      {/* Header */}
      <header className="header">
        <div className="logo">
          <div className="logo-icon"><SubboxIcon /></div>
          <span className="logo-text">Subbox</span>
        </div>
        <div className="header-actions">
          {authStatus === "authenticated" && (
            <a href={`${WEB_URL}/dashboard`} target="_blank" rel="noopener noreferrer" className="icon-btn">
              Dashboard <ExternalIcon />
            </a>
          )}
        </div>
      </header>

      {/* Content */}
      <div className="content">
        {isLoading || authStatus === "loading" ? (
          <div className="loading">
            <div className="spinner" />
            <span>Loading...</span>
          </div>
        ) : authStatus === "unauthenticated" ? (
          <AuthGate webUrl={WEB_URL} />
        ) : channelInfo?.isChannelPage ? (
          <ChannelView channelInfo={channelInfo} webUrl={WEB_URL} />
        ) : (
          <NoChannel webUrl={WEB_URL} />
        )}
      </div>

      {/* Footer */}
      {authStatus === "authenticated" && (
        <footer className="footer">
          <span className="footer-text">
            <span className="status-dot connected" />
            Connected to Subbox
          </span>
        </footer>
      )}
    </div>
  );
}

function AuthGate({ webUrl }: { webUrl: string }) {
  return (
    <div className="auth-gate">
      <div className="auth-icon">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
          <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
        </svg>
      </div>
      <p className="auth-title">Sign in to Subbox</p>
      <p className="auth-desc">Connect your account to manage subscriptions directly from YouTube.</p>
      <a href={`${webUrl}/login`} target="_blank" rel="noopener noreferrer" className="btn btn-primary">
        Sign in →
      </a>
    </div>
  );
}

function ChannelView({ channelInfo, webUrl }: { channelInfo: ChannelInfo; webUrl: string }) {
  return (
    <div>
      <div className="channel-header">
        {channelInfo.thumbnail ? (
          <img src={channelInfo.thumbnail} alt={channelInfo.channelName} className="channel-avatar" />
        ) : (
          <div className="channel-avatar-placeholder">
            {channelInfo.channelName[0]?.toUpperCase()}
          </div>
        )}
        <div className="channel-meta">
          <div className="channel-name">{channelInfo.channelName}</div>
          {channelInfo.channelId && (
            <div className="channel-url">{channelInfo.channelId}</div>
          )}
        </div>
      </div>
      <div className="channel-actions">
        <a
          href={`${webUrl}/dashboard`}
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn-primary"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15V6"/><path d="M18.5 18a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z"/><path d="M12 12H3"/><path d="M16 6H3"/><path d="M12 18H3"/></svg>
          View in Dashboard
        </a>
        <a
          href={channelInfo.url}
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn-outline"
        >
          Open on YouTube ↗
        </a>
      </div>
    </div>
  );
}

function NoChannel({ webUrl }: { webUrl: string }) {
  return (
    <div className="no-channel">
      <div className="no-channel-icon">📺</div>
      <p className="no-channel-title">No channel detected</p>
      <p className="no-channel-desc">Navigate to a YouTube channel page to see details here.</p>
      <div className="quick-links">
        <a href={`${webUrl}/dashboard`} target="_blank" rel="noopener noreferrer" className="quick-link">
          <span className="quick-link-icon">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15V6"/><path d="M18.5 18a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z"/><path d="M12 12H3"/><path d="M16 6H3"/><path d="M12 18H3"/></svg>
          </span>
          Subscription Dashboard
          <span className="quick-link-arrow">↗</span>
        </a>
        <a href={`${webUrl}/dashboard/analytics`} target="_blank" rel="noopener noreferrer" className="quick-link">
          <span className="quick-link-icon">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>
          </span>
          Analytics
          <span className="quick-link-arrow">↗</span>
        </a>
        <a href={`${webUrl}/dashboard/cleanup`} target="_blank" rel="noopener noreferrer" className="quick-link">
          <span className="quick-link-icon">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
          </span>
          Cleanup Tool
          <span className="quick-link-arrow">↗</span>
        </a>
      </div>
    </div>
  );
}

export default App;
