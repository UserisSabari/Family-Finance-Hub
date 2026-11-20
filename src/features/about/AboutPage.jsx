import { Link } from 'react-router-dom';

import {
  IconArrowLeft,
  IconExternalLink,
  IconGithub,
  IconInfo,
  IconShield,
  IconSparkles,
  IconUser,
} from '../../components/icons/Icons';
import './about.css';

export function AboutPage() {
  const version = 'v0.2.0';
  const releaseDate = 'November 2026';
  const repoUrl = 'https://github.com/UserisSabari/Family-Finance-Hub';
  const issuesUrl = `${repoUrl}/issues`;
  const releasesUrl = `${repoUrl}/releases`;
  const profileUrl = 'https://github.com/UserisSabari';

  return (
    <main className="page-content about-page">
      {/* Top Back Navigation */}
      <nav className="about-top-bar" aria-label="Breadcrumb navigation">
        <Link to="/app/settings" className="about-back-btn">
          <IconArrowLeft size={16} />
          <span>Back to Settings</span>
        </Link>
      </nav>

      {/* Hero Identity Bento Card */}
      <section className="about-hero-card" aria-labelledby="about-hub-title">
        <div className="about-hero-header">
          <div className="about-brand-large" aria-hidden="true">
            ₹
          </div>
          <div className="about-hero-titles">
            <div className="about-hero-badge-row">
              <span className="about-pill-version">{version} PWA</span>
              <span className="about-pill-status">
                <span className="about-pill-dot" />
                <span>Production Ready</span>
              </span>
            </div>
            <h1 id="about-hub-title" className="about-hero-title">
              Family Finance Hub
            </h1>
            <p className="about-hero-desc">
              High-speed, collaborative household financial management command center designed for real-world Indian finances — liquid cash-in-hand tracking, UPI peer-to-peer bill splitting, adaptive lifestyle budgeting, and local-first offline persistence.
            </p>
          </div>
        </div>
      </section>

      {/* Developer & Essential Links Card */}
      <section className="about-section-card" aria-labelledby="developer-links-heading">
        <header className="about-card-header">
          <h2 id="developer-links-heading" className="about-card-title">
            Developer & Essential Links
          </h2>
          <p className="about-card-subtitle">
            Source code repository, developer profile, bug reporting, and official release notes.
          </p>
        </header>

        {/* Developer Profile Strip */}
        <div className="dev-profile-strip">
          <div className="dev-profile-left">
            <div className="dev-avatar-circle" aria-hidden="true">
              S
            </div>
            <div className="dev-profile-text">
              <h3>Sabari</h3>
              <p className="dev-profile-role">Lead Architect & Full-Stack Developer</p>
            </div>
          </div>
          <span className="dev-profile-tag">
            <IconUser size={14} />
            <span>@UserisSabari</span>
          </span>
        </div>

        {/* Essential Links Grid */}
        <div className="dev-links-grid">
          <a
            href={repoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="dev-link-tile"
            aria-label="GitHub Repository (opens in new tab)"
          >
            <div>
              <div className="dev-link-tile-top">
                <div className="dev-link-icon-box">
                  <IconGithub size={20} />
                </div>
                <IconExternalLink size={15} className="dev-link-external-icon" />
              </div>
              <h3 className="dev-link-name">GitHub Repository</h3>
              <p className="dev-link-desc">
                Explore the open-source codebase, inspect architecture, and star the project.
              </p>
            </div>
          </a>

          <a
            href={issuesUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="dev-link-tile"
            aria-label="Issue Tracker (opens in new tab)"
          >
            <div>
              <div className="dev-link-tile-top">
                <div className="dev-link-icon-box">
                  <IconShield size={20} />
                </div>
                <IconExternalLink size={15} className="dev-link-external-icon" />
              </div>
              <h3 className="dev-link-name">Issue Tracker</h3>
              <p className="dev-link-desc">
                Submit bug reports, suggest design refinements, or request new features.
              </p>
            </div>
          </a>

          <a
            href={releasesUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="dev-link-tile"
            aria-label="Release Notes (opens in new tab)"
          >
            <div>
              <div className="dev-link-tile-top">
                <div className="dev-link-icon-box">
                  <IconSparkles size={20} />
                </div>
                <IconExternalLink size={15} className="dev-link-external-icon" />
              </div>
              <h3 className="dev-link-name">Releases & Changelog</h3>
              <p className="dev-link-desc">
                Review version updates, performance upgrades, and commit logs.
              </p>
            </div>
          </a>

          <a
            href={profileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="dev-link-tile"
            aria-label="Developer GitHub Profile (opens in new tab)"
          >
            <div>
              <div className="dev-link-tile-top">
                <div className="dev-link-icon-box">
                  <IconUser size={20} />
                </div>
                <IconExternalLink size={15} className="dev-link-external-icon" />
              </div>
              <h3 className="dev-link-name">Developer Profile</h3>
              <p className="dev-link-desc">
                Connect on GitHub and follow upcoming engineering and open-source updates.
              </p>
            </div>
          </a>
        </div>
      </section>

      {/* System Specifications Card */}
      <section className="about-section-card" aria-labelledby="specs-heading">
        <header className="about-card-header">
          <h2 id="specs-heading" className="about-card-title">
            Platform Specifications
          </h2>
          <p className="about-card-subtitle">
            Current build parameters, runtime environment, and storage engine.
          </p>
        </header>

        <div className="about-specs-grid">
          <div className="about-spec-item">
            <span className="spec-item-label">App Version</span>
            <span className="spec-item-value">{version} ({releaseDate})</span>
          </div>
          <div className="about-spec-item">
            <span className="spec-item-label">Frontend Framework</span>
            <span className="spec-item-value">React 18.3 · Vite 7</span>
          </div>
          <div className="about-spec-item">
            <span className="spec-item-label">Database & Sync</span>
            <span className="spec-item-value">Firebase Firestore (IndexedDB Cache)</span>
          </div>
          <div className="about-spec-item">
            <span className="spec-item-label">Offline Capability</span>
            <span className="spec-item-value">Service Worker v3 (Network-First HTML)</span>
          </div>
          <div className="about-spec-item">
            <span className="spec-item-label">Currency & Locale</span>
            <span className="spec-item-value">INR (₹) · Asia/Kolkata (IST)</span>
          </div>
          <div className="about-spec-item">
            <span className="spec-item-label">Hosting & Deployment</span>
            <span className="spec-item-value">Vercel Production Edge</span>
          </div>
        </div>
      </section>

      {/* Core Engineering Pillars */}
      <section className="about-section-card" aria-labelledby="pillars-heading">
        <header className="about-card-header">
          <h2 id="pillars-heading" className="about-card-title">
            Core Design Principles
          </h2>
          <p className="about-card-subtitle">
            Architectural principles that drive the development of Family Finance Hub.
          </p>
        </header>

        <div className="about-pillars-grid">
          <div className="about-pillar-item">
            <h3 className="pillar-title">Privacy & Zero Trackers</h3>
            <p className="pillar-desc">
              No third-party ad pixels, marketing telemetry, or tracking scripts. Your private financial ledger is isolated within your verified workspace.
            </p>
          </div>

          <div className="about-pillar-item">
            <h3 className="pillar-title">Indian Financial Reality</h3>
            <p className="pillar-desc">
              Built from the ground up for Indian banking realities — tracking physical cash alongside bank balances, managing UPI pass-through reimbursements, and group bill splits.
            </p>
          </div>

          <div className="about-pillar-item">
            <h3 className="pillar-title">Local-First Speed</h3>
            <p className="pillar-desc">
              Actions register with zero perceived latency through instant local state and IndexedDB persistence, syncing cleanly in the background.
            </p>
          </div>

          <div className="about-pillar-item">
            <h3 className="pillar-title">Multi-Tenant Collaboration</h3>
            <p className="pillar-desc">
              Seamlessly switch between your private personal finances and shared family workspaces with fine-grained role-based permissions (Owner, Admin, Member).
            </p>
          </div>
        </div>
      </section>

      {/* Footer Note */}
      <footer className="about-footer-note">
        <p>Family Finance Hub &copy; {new Date().getFullYear()} Sabari. Open-source under MIT License.</p>
      </footer>
    </main>
  );
}
