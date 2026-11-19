import { useEffect, useState } from 'react';

import { useTheme } from '../../app/AppProviders';
import { useAuth } from '../../hooks/useAuth';
import { useWorkspace } from '../../hooks/useWorkspace';
import { addCategory, getCategories, removeCategory, updateProfile } from './settingsRepository';
import { ProfileSelector } from './ProfileSelector';
import { DEFAULT_PROFILE_ID } from '../../lib/profiles/profileConfig';
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

  return (
    <main className="page-content settings-page">
      <header className="page-header">
        <div>
          <p className="eyebrow">Preferences & App Info</p>
          <h1>Settings</h1>
        </div>
      </header>
      {error && <div className="settings-message settings-error" role="alert">{error}</div>}
      {message && <div className="settings-message" role="status">{message}</div>}

      <section className="settings-card" aria-labelledby="profile-heading">
        <div className="profile-card-header">
          <div className="user-avatar-circle" aria-hidden="true">
            {displayName ? displayName.charAt(0).toUpperCase() : (user?.email ? user.email.charAt(0).toUpperCase() : 'U')}
          </div>
          <div className="profile-header-text">
            <h2 id="profile-heading" style={{ margin: 0 }}>Profile</h2>
            <p className="muted" style={{ margin: '0.15rem 0 0', fontSize: '0.8125rem' }}>
              Manage your personal display name and account details
            </p>
          </div>
          {workspace?.role && (
            <span className="workspace-role-pill">{workspace.role}</span>
          )}
        </div>

        <form onSubmit={saveProfile} style={{ marginTop: 'var(--space-4)' }}>
          <label htmlFor="settings-display-name">Display name</label>
          <input
            id="settings-display-name"
            value={displayName}
            onChange={(event) => setDisplayName(event.target.value)}
            placeholder="Your name"
          />
          <label htmlFor="settings-email">Email</label>
          <input id="settings-email" value={user?.email ?? ''} readOnly />
          <button type="submit">Save profile</button>
        </form>
      </section>

      <section className="settings-card" aria-labelledby="lifestyle-heading">
        <h2 id="lifestyle-heading">Financial Profile & Lifestyle</h2>
        <p className="muted" style={{ fontSize: '0.875rem', margin: '0 0 var(--space-2)' }}>
          Choose your financial stage to automatically adapt quick amounts, categories, and budgeting tools:
        </p>
        <ProfileSelector currentProfile={financialProfile} onSelect={handleSelectProfile} />
      </section>

      <section className="settings-card" aria-labelledby="display-heading">
        <h2 id="display-heading">Display & Preferences</h2>
        <div className="display-setting-row">
          <span className="display-setting-label">Active Currency</span>
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
              />
              <span>Light Mode</span>
            </label>
            <label className={`theme-option ${theme === 'dark' ? 'selected' : ''}`}>
              <input
                type="radio"
                name="theme"
                value="dark"
                checked={theme === 'dark'}
                onChange={() => setTheme('dark')}
              />
              <span>Dark Mode</span>
            </label>
          </div>
        </fieldset>
      </section>

      {canManageCategories && (
        <section className="settings-card" aria-labelledby="categories-heading">
          <h2 id="categories-heading">Custom Categories</h2>
          <p className="muted" style={{ margin: '0 0 var(--space-3)', fontSize: '0.875rem' }}>
            Customize your transaction categories for tailored spending classification.
          </p>
          <form onSubmit={createCategory} className="new-category-form">
            <label htmlFor="new-category">New category</label>
            <div className="inline-category-row">
              <input
                id="new-category"
                value={category}
                onChange={(event) => setCategory(event.target.value)}
                placeholder="e.g. Travel, Electronics, Bills"
              />
              <button type="submit">Add category</button>
            </div>
          </form>
          <ul className="category-list">
            {categories.map((value) => (
              <li key={value} className="category-item">
                <span className="category-name">{value}</span>
                <button
                  type="button"
                  className="btn-remove-category"
                  onClick={() => deleteCategory(value)}
                  aria-label={`Remove ${value}`}
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}

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
        </div>
      </section>

      <section className="settings-card settings-danger" aria-labelledby="account-heading">
        <h2 id="account-heading">Account</h2>
        <p className="muted" style={{ margin: '0 0 var(--space-3)', fontSize: '0.875rem' }}>
          Sign out of your session on this device.
        </p>
        <button type="button" onClick={signOut}>Sign out</button>
      </section>
    </main>
  );
}
