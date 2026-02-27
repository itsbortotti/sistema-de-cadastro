import { useAuth } from '../context/AuthContext';

export default function Dashboard() {
  const { usuario } = useAuth();

  return (
    <div>
      <h1>Bem-vindo, {usuario?.nome || usuario?.login}</h1>
      <p style={{ marginTop: '0.5rem', color: '#64748b' }}>
        Use o menu lateral para acessar os cadastros.
      </p>
    </div>
  );
}
