import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';

import { LoginPage } from './LoginPage';
import { RegisterPage } from './RegisterPage';
import { ForgotPasswordPage } from './ForgotPasswordPage';

const auth = {
  signIn: vi.fn(),
  register: vi.fn(),
  signInWithGoogle: vi.fn(),
  resetPassword: vi.fn(),
};

vi.mock('../../hooks/useAuth', () => ({ useAuth: () => auth }));

function renderPage(page) {
  return render(<MemoryRouter>{page}</MemoryRouter>);
}

describe('authentication pages', () => {
  it('requires credentials before submitting login', async () => {
    renderPage(<LoginPage />);

    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));

    expect(await screen.findByRole('alert')).toHaveTextContent(/email and password are required/i);
    expect(auth.signIn).not.toHaveBeenCalled();
  });

  it('shows a user-readable Firebase login error', async () => {
    auth.signIn.mockRejectedValueOnce({ code: 'auth/invalid-credential' });
    renderPage(<LoginPage />);

    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'person@example.com' } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'secret123' } });
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));

    expect(await screen.findByRole('alert')).toHaveTextContent(/email or password is incorrect/i);
  });

  it('validates registration password confirmation', async () => {
    renderPage(<RegisterPage />);

    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'person@example.com' } });
    fireEvent.change(screen.getByLabelText(/^password$/i), { target: { value: 'secret123' } });
    fireEvent.change(screen.getByLabelText(/confirm password/i), { target: { value: 'different' } });
    fireEvent.click(screen.getByRole('button', { name: /create account/i }));

    expect(await screen.findByRole('alert')).toHaveTextContent(/passwords must match/i);
    expect(auth.register).not.toHaveBeenCalled();
  });

  it('sends a password reset request and confirms it', async () => {
    renderPage(<ForgotPasswordPage />);

    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'person@example.com' } });
    fireEvent.click(screen.getByRole('button', { name: /send reset link/i }));

    await waitFor(() => expect(auth.resetPassword).toHaveBeenCalledWith('person@example.com'));
    expect(screen.getByRole('status')).toHaveTextContent(/check your email/i);
  });
});
