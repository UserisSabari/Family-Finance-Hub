import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';

import { AboutPage } from './AboutPage';

describe('AboutPage', () => {
  it('renders application details and version badge', () => {
    render(
      <MemoryRouter>
        <AboutPage />
      </MemoryRouter>,
    );

    expect(screen.getByRole('heading', { level: 1, name: /family finance hub/i })).toBeInTheDocument();
    expect(screen.getAllByText(/v0\.2\.0/i).length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText(/Production Ready/i)).toBeInTheDocument();
  });

  it('renders developer profile and essential GitHub links', () => {
    render(
      <MemoryRouter>
        <AboutPage />
      </MemoryRouter>,
    );

    expect(screen.getAllByText(/Sabari/i).length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText(/@UserisSabari/i)).toBeInTheDocument();

    const repoLink = screen.getByRole('link', { name: /github repository/i });
    expect(repoLink).toHaveAttribute('href', 'https://github.com/UserisSabari/Family-Finance-Hub');

    const issuesLink = screen.getByRole('link', { name: /issue tracker/i });
    expect(issuesLink).toHaveAttribute('href', 'https://github.com/UserisSabari/Family-Finance-Hub/issues');

    const releasesLink = screen.getByRole('link', { name: /release notes/i });
    expect(releasesLink).toHaveAttribute('href', 'https://github.com/UserisSabari/Family-Finance-Hub/releases');
  });

  it('provides navigation back to settings', () => {
    render(
      <MemoryRouter>
        <AboutPage />
      </MemoryRouter>,
    );

    const backLink = screen.getByRole('link', { name: /back to settings/i });
    expect(backLink).toHaveAttribute('href', '/app/settings');
  });
});
