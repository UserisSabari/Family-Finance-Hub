import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import { useTheme } from '../../app/AppProviders';
import { useAuth } from '../../hooks/useAuth';
import { useWorkspace } from '../../hooks/useWorkspace';
import { addCategory, getCategories, removeCategory, updateProfile } from './settingsRepository';
import { ProfileSelector } from './ProfileSelector';
import { DEFAULT_PROFILE_ID } from '../../lib/profiles/profileConfig';
import {
  IconBudgets,
  IconGoals,
  IconLogout,
  IconMoon,
  IconPlus,
  IconSun,
  IconTrash,
} from '../../components/icons/Icons';
import './settings.css';

export function SettingsPage() {
  const { user, signOut } = useAuth();
  const { profile, workspace, refresh } = useWorkspace();
  const { theme, setTheme } = useTheme();
  const [displayName, setDisplayName] = useState(profile?.displayName ?? '');
  const [financialProfile, setFinancialProfile] = useState(profile?.financialProfile || DEFAULT_PROFILE_ID);
  const [category, setCategory] = useState('');
  const [categories, setCategories] = useState(profile?.categories ?? []);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    if (!workspace?.id) return () => { active = false; };
    getCategories(workspace.id)
      .then((values) => { if (active) setCategories(values); })
      .catch((reason) => { if (active) setError(reason.message || 'Unable to load categories.'); });
    return () => { active = false; };
  }, [workspace?.id]);

  const canManageCategories = workspace?.kind === 'personal' || workspace?.role === 'owner';

  async function saveProfile(event) {
    event.preventDefault();
    setError('');
    setMessage('');
    try {
      const updates = { displayName };
      if (financialProfile !== profile?.financialProfile && profile?.financialProfile !== undefined) {
        updates.financialProfile = financialProfile;
      }
      await updateProfile(user.uid, updates);
      await refresh?.();
      setMessage('Profile saved.');
    } catch (reason) {
      setError(reason.message || 'Unable to save profile.');
    }
  }

  async function handleSelectProfile(profileId) {
    setFinancialProfile(profileId);
    setError('');
    setMessage('');
    try {
      await updateProfile(user.uid, { financialProfile: profileId });
      await refresh?.();
      setMessage('Financial profile updated.');
    } catch (reason) {
      setError(reason.message || 'Unable to switch profile.');
    }
  }

  async function createCategory(event) {
    event.preventDefault();
    setError('');
    setMessage('');
    if (!category.trim()) {
      setError('Category name is required.');
      return;
    }
    try {
      const next = await addCategory(workspace?.id, category);
      setCategories(next ?? [...categories, category.trim()]);
      setCategory('');
      setMessage('Category added.');
    } catch (reason) {
      setError(reason.message || 'Unable to add category.');
    }
  }

  async function deleteCategory(value) {
    setError('');
    try {
      setCategories(await removeCategory(workspace?.id, value));
    } catch (reason) {
      setError(reason.message || 'Unable to remove category.');
    }
  }

  const userInitial = displayName
    ? displayName.charAt(0).toUpperCase()
    : (user?.email ? user.email.charAt(0).toUpperCase() : 'U');

  return (
    <main className="page-content settings-page">
      <header className="settings-header">
        <p className="eyebrow">Preferences & App Info</p>
        <h1>Settings</h1>
        <p className="muted">Manage your profile, lifestyle presets, visual theme, and system options.</p>
      </header>

      {error && <div className="settings-message settings-error" role="alert">{error}</div>}
      {message && <div className="settings-message" role="status">{message}</div>}

      {/* Profile & Account Card */}
      <section className="settings-card profile-hero-card" aria-labelledby="profile-heading">
        <div className="profile-hero-top">
          <div className="profile-hero-avatar-wrap">
            <div className="user-avatar-circle" aria-hidden="true">
              {userInitial}
            </div>
          </div>
          <div className="profile-hero-info">
            <h2 id="profile-heading" style={{ margin: 0 }}>Profile</h2>
            <span className="profile-hero-email">{user?.email ?? 'No email associated'}</span>
            <div className="profile-hero-badges">
              {workspace?.role && (
                <span className="workspace-role-pill">Role: {workspace.role}</span>
              )}
              <span className="workspace-kind-pill">
                {workspace?.kind === 'family' ? 'Family Workspace' : 'Personal Workspace'}
              </span>
            </div>
          </div>
        </div>

        <form onSubmit={saveProfile} className="settings-form-grid" style={{ marginTop: 'var(--space-5)' }}>
          <div className="settings-form-row">
            <label htmlFor="settings-display-name">
              <span>Display name</span>
              <input
                id="settings-display-name"
                value={displayName}
                onChange={(event) => setDisplayName(event.target.value)}
                placeholder="Your name"
              />
            </label>

            <label htmlFor="settings-email">
              <span>Email</span>
              <input id="settings-email" value={user?.email ?? ''} readOnly />
            </label>
          </div>

          <button type="submit" className="btn btn-primary" style={{ alignSelf: 'start', marginTop: 'var(--space-2)' }}>
            Save profile
          </button>
        </form>
      </section>

      {/* Financial Profile & Lifestyle Presets */}
      <section className="settings-card" aria-labelledby="lifestyle-heading">
        <div className="settings-section-header">
          <h2 id="lifestyle-heading">Financial Profile & Lifestyle</h2>
          <p className="muted">
            Choose your financial stage to automatically adapt quick amounts, categories, and budgeting tools:
          </p>
        </div>
        <ProfileSelector currentProfile={financialProfile} onSelect={handleSelectProfile} />
      </section>

      {/* Financial Planning & Controls Hub */}
      <section className="settings-card" aria-labelledby="planning-hub-heading">
        <div className="settings-section-header">
          <h2 id="planning-hub-heading">Financial Planning & Controls</h2>
          <p className="muted">
            Manage your monthly budget caps, burn rates, and long-term milestone savings goals:
          </p>
        </div>

        <div className="planning-hub-grid">
          <Link to="/app/budgets" className="planning-card">
            <div className="planning-card-icon" aria-hidden="true">
              <IconBudgets size={22} />
            </div>
            <div className="planning-card-body">
              <div className="planning-card-title-row">
                <strong className="planning-card-title">Monthly Budgets</strong>
                <span className="planning-card-arrow" aria-hidden="true">→</span>
              </div>
              <p className="planning-card-desc">
                Set category spending limits, track burn rates, and receive overspending alerts.
              </p>
            </div>
          </Link>

          <Link to="/app/goals" className="planning-card">
            <div className="planning-card-icon" aria-hidden="true">
              <IconGoals size={22} />
            </div>
            <div className="planning-card-body">
              <div className="planning-card-title-row">
                <strong className="planning-card-title">Savings Goals</strong>
                <span className="planning-card-arrow" aria-hidden="true">→</span>
              </div>
              <p className="planning-card-desc">
                Track progress toward emergency funds, travel, big purchases, and milestones.
              </p>
            </div>
          </Link>
        </div>
      </section>

      {/* Display & Preferences */}
      <section className="settings-card" aria-labelledby="display-heading">
        <div className="settings-section-header">
          <h2 id="display-heading">Display & Preferences</h2>
          <p className="muted">Configure appearance and accounting units.</p>
        </div>

        <div className="display-setting-row">
          <div className="display-setting-text">
            <span className="display-setting-label">Active Currency</span>
            <small className="muted" style={{ display: 'block', fontSize: '0.78rem' }}>
              Standardized across all workspaces and calculation engines
            </small>
          </div>
          <span className="currency-badge">Indian rupee (INR) ₹</span>
        </div>

        <fieldset className="theme-fieldset">
          <legend>Theme</legend>
          <div className="theme-options-grid">
            <label className={`theme-option ${theme === 'light' ? 'selected' : ''}`}>
              <input
                type="radio"
                name="theme"
                value="light"
                checked={theme === 'light'}
                onChange={() => setTheme('light')}
                className="theme-radio-input"
              />
              <div className="theme-option-content">
                <div className="theme-icon-box theme-icon-sun">
                  <IconSun size={20} />
                </div>
                <div className="theme-text-group">
                  <span className="theme-title">Light Mode</span>
                  <small className="theme-sub">Crisp contrast</small>
                </div>
              </div>
            </label>

            <label className={`theme-option ${theme === 'dark' ? 'selected' : ''}`}>
              <input
                type="radio"
                name="theme"
                value="dark"
                checked={theme === 'dark'}
                onChange={() => setTheme('dark')}
                className="theme-radio-input"
              />
              <div className="theme-option-content">
                <div className="theme-icon-box theme-icon-moon">
                  <IconMoon size={20} />
                </div>
                <div className="theme-text-group">
                  <span className="theme-title">Dark Mode</span>
                  <small className="theme-sub">OLED optimized</small>
                </div>
              </div>
            </label>
          </div>
        </fieldset>
      </section>

      {/* Custom Categories */}
      {canManageCategories && (
        <section className="settings-card" aria-labelledby="categories-heading">
          <div className="settings-section-header">
            <h2 id="categories-heading">Custom Categories</h2>
            <p className="muted">
              Customize your transaction categories for tailored spending classification.
            </p>
          </div>

          <form onSubmit={createCategory} className="new-category-form">
            <label htmlFor="new-category" className="sr-only">New category</label>
            <div className="inline-category-row">
              <input
                id="new-category"
                value={category}
                onChange={(event) => setCategory(event.target.value)}
                placeholder="e.g. Travel, Electronics, Bills"
              />
              <button type="submit" className="btn btn-primary btn-sm">
                <IconPlus size={16} />
                <span>Add category</span>
              </button>
            </div>
          </form>

          <ul className="category-list">
            {categories.map((value) => (
              <li key={value} className="category-item">
                <div className="category-item-info">
                  <span className="category-color-dot" />
                  <span className="category-name">{value}</span>
                </div>
                <button
                  type="button"
                  className="btn-remove-category"
                  onClick={() => deleteCategory(value)}
                  aria-label={`Remove ${value}`}
                  title={`Remove ${value}`}
                >
                  <IconTrash size={14} />
                  <span>Remove</span>
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* About Section */}
      <section className="settings-card about-us-card" aria-labelledby="about-heading">
        <div className="about-header">
          <div>
            <h2 id="about-heading" style={{ margin: 0 }}>About Family Finance Hub</h2>
            <p className="muted" style={{ margin: '0.25rem 0 0', fontSize: '0.875rem' }}>
              High-speed personal & family financial command center
            </p>
          </div>
          <span className="about-version-badge">v0.2.0 PWA</span>
        </div>

        <div className="about-content">
          <p className="about-description">
            Family Finance Hub provides instant, offline-capable expense tracking and analytics designed for real-world Indian financial life — UPI pass-through payments, group bill splitting, cash-in-hand reconciliation, and adaptive lifestyle budgeting.
          </p>

          <div className="about-highlights-grid">
            <div className="about-highlight-item">
              <strong className="about-highlight-title">Local-First Speed</strong>
              <span className="about-highlight-desc">Instant IndexedDB offline caching and background service worker sync.</span>
            </div>
            <div className="about-highlight-item">
              <strong className="about-highlight-title">Multi-Tab Sync</strong>
              <span className="about-highlight-desc">Live reactive state updates across all open windows via BroadcastChannel.</span>
            </div>
            <div className="about-highlight-item">
              <strong className="about-highlight-title">Privacy Focused</strong>
              <span className="about-highlight-desc">Zero tracking scripts, client-isolated workspace data, and encrypted sync.</span>
            </div>
            <div className="about-highlight-item">
              <strong className="about-highlight-title">Tailored for India</strong>
              <span className="about-highlight-desc">Native INR (₹) formatting, liquid cash tracking, and UPI split notes.</span>
            </div>
          </div>

          <div className="about-diagnostics-bar" aria-label="System architecture diagnostics">
            <div className="diagnostic-item">
              <span className="diagnostic-label">Offline Engine</span>
              <span className="diagnostic-badge">IndexedDB Persistent Cache</span>
            </div>
            <div className="diagnostic-item">
              <span className="diagnostic-label">Sync Mode</span>
              <span className="diagnostic-badge">Multi-Tab Reactive Sync</span>
            </div>
            <div className="diagnostic-item">
              <span className="diagnostic-label">PWA Status</span>
              <span className="diagnostic-badge">Service Worker Active</span>
            </div>
          </div>
        </div>
      </section>

      {/* Account / Session Card */}
      <section className="settings-card settings-danger" aria-labelledby="account-heading">
        <h2 id="account-heading">Account</h2>
        <p className="muted" style={{ margin: '0 0 var(--space-4)', fontSize: '0.875rem' }}>
          Sign out of your session on this device.
        </p>
        <button type="button" onClick={signOut} className="btn-sign-out">
          <IconLogout size={16} />
          <span>Sign out</span>
        </button>
      </section>
    </main>
  );
}
