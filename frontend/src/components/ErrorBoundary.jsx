import { Component } from 'react';

export class ErrorBoundary extends Component {
  state = { hasError: false, error: null };

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      const msg = this.state.error?.message || 'Erro ao carregar';
      return (
        <div className="error-boundary" style={{
          padding: '2rem',
          margin: '1rem',
          background: '#fef2f2',
          border: '1px solid #fecaca',
          borderRadius: '8px',
          color: '#991b1b',
        }}>
          <h2 style={{ margin: '0 0 0.5rem', fontSize: '1.25rem' }}>Algo deu errado</h2>
          <p style={{ margin: 0, fontFamily: 'monospace', fontSize: '0.875rem' }}>{msg}</p>
          <button
            type="button"
            onClick={() => this.setState({ hasError: false, error: null })}
            style={{ marginTop: '1rem', padding: '0.5rem 1rem', cursor: 'pointer' }}
          >
            Tentar novamente
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
