import { listFinancialProfiles } from '../../lib/profiles/profileConfig';

export function ProfileSelector({ currentProfile, onSelect, disabled = false }) {
  const profiles = listFinancialProfiles();

  return (
    <div className="profile-selector-grid" role="radiogroup" aria-label="Financial profile selection">
      {profiles.map((profile) => {
        const isSelected = currentProfile === profile.id;
        return (
          <button
            key={profile.id}
            type="button"
            role="radio"
            aria-checked={isSelected}
            className={`profile-card ${isSelected ? 'selected' : ''}`}
            onClick={() => onSelect(profile.id)}
            disabled={disabled}
          >
            <div className="profile-card-top">
              <div className="profile-avatar-wrap">
                <span className="profile-emoji">{profile.emoji}</span>
              </div>
              <div className="profile-title-group">
                <span className="profile-label">{profile.label}</span>
                <span className="profile-persona-meta">
                  {profile.id === 'student' && 'Campus & Daily Living'}
                  {profile.id === 'salaried' && 'Monthly Income & EMIs'}
                  {profile.id === 'freelancer' && 'Invoices & Payouts'}
                  {profile.id === 'family' && 'Shared Household'}
                </span>
              </div>
              <div className={`profile-radio-indicator ${isSelected ? 'indicator-selected' : ''}`}>
                {isSelected ? '✓' : ''}
              </div>
            </div>

            <p className="profile-tagline">{profile.tagline}</p>

            <div className="profile-card-footer">
              <span className="profile-presets-title">Included presets:</span>
              <div className="profile-sample-categories">
                {profile.expenseCategories.slice(0, 3).map((cat) => (
                  <span key={cat} className="sample-category-pill">{cat}</span>
                ))}
                <span className="sample-category-more">+{profile.expenseCategories.length - 3} more</span>
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}
