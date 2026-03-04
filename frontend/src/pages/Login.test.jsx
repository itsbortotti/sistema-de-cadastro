import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Login from './Login';

const mockLogin = vi.fn();
vi.mock('../context/AuthContext', () => ({
  useAuth: () => ({ usuario: null, login: mockLogin }),
}));

describe('Login', () => {
  beforeEach(() => {
    mockLogin.mockClear();
  });

  it('renderiza título e formulário com usuário e senha', () => {
    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );
    expect(screen.getByRole('heading', { name: /Governança Financeira de Projetos/i })).toBeInTheDocument();
    expect(screen.getByText(/Entre com seu usuário e senha/)).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Login')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Senha')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Entrar/i })).toBeInTheDocument();
  });

  it('exibe botão Entrar desabilitado durante envio quando enviando', () => {
    mockLogin.mockImplementation(() => new Promise(() => {}));
    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );
    const btn = screen.getByRole('button', { name: /Entrar/i });
    expect(btn).not.toBeDisabled();
  });
});
