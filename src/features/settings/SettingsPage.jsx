import { useEffect, useState } from 'react';

import { useTheme } from '../../app/AppProviders';
import { useAuth } from '../../hooks/useAuth';
import { useWorkspace } from '../../hooks/useWorkspace';
import { addCategory, getCategories, removeCategory, updateProfile } from './settingsRepository';
import './settings.css';

export function SettingsPage() {
  const { user, signOut } = useAuth();
  const { profile, workspace, refresh } = useWorkspace();
  const { theme, setTheme } = useTheme();
  const [displayName, setDisplayName] = useState(profile?.displayName ?? '');
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
      await updateProfile(user.uid, { displayName });
      await refresh?.();
      setMessage('Profile saved.');
    } catch (reason) {
      setError(reason.message || 'Unable to save profile.');
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
        <div><p className="eyebrow">Preferences</p><h1>Settings</h1></div>
      </header>
      {error && <div className="settings-message settings-error" role="alert">{error}</div>}
      {message && <div className="settings-message" role="status">{message}</div>}
      <section className="settings-card" aria-labelledby="profile-heading">
        <h2 id="profile-heading">Profile</h2>
        <form onSubmit={saveProfile}>
          <label htmlFor="settings-display-name">Display name</label>
          <input id="settings-display-name" value={displayName} onChange={(event) => setDisplayName(event.target.value)} />
          <label htmlFor="settings-email">Email</label>
          <input id="settings-email" value={user?.email ?? ''} readOnly />
          <button type="submit">Save profile</button>
        </form>
      </section>
      <section className="settings-card" aria-labelledby="display-heading">
        <h2 id="display-heading">Display</h2>
        <p>Currency: <strong>Indian rupee (INR)</strong></p>
        <fieldset>
          <legend>Theme</legend>
          <label><input type="radio" name="theme" value="light" checked={theme === 'light'} onChange={() => setTheme('light')} /> Light</label>
          <label><input type="radio" name="theme" value="dark" checked={theme === 'dark'} onChange={() => setTheme('dark')} /> Dark</label>
        </fieldset>
      </section>
      {canManageCategories && <section className="settings-card" aria-labelledby="categories-heading">
        <h2 id="categories-heading">Categories</h2>
        <form onSubmit={createCategory}>
          <label htmlFor="new-category">New category</label>
          <input id="new-category" value={category} onChange={(event) => setCategory(event.target.value)} />
          <button type="submit">Add category</button>
        </form>
        <ul className="category-list">
          {categories.map((value) => <li key={value}><span>{value}</span><button type="button" onClick={() => deleteCategory(value)}>Remove</button></li>)}
        </ul>
      </section>}
      <section className="settings-card settings-danger" aria-labelledby="account-heading">
        <h2 id="account-heading">Account</h2>
        <button type="button" onClick={signOut}>Sign out</button>
      </section>
    </main>
  );
}
