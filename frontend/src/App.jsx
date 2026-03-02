import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { PermissoesProvider } from './context/PermissoesContext';
import Login from './pages/Login';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import UsuariosList from './pages/usuarios/UsuariosList';
import UsuarioForm from './pages/usuarios/UsuarioForm';
import FornecedoresList from './pages/fornecedores/FornecedoresList';
import FornecedorForm from './pages/fornecedores/FornecedorForm';
import AreasList from './pages/areas/AreasList';
import AreaForm from './pages/areas/AreaForm';
import HospedagensList from './pages/hospedagens/HospedagensList';
import HospedagemForm from './pages/hospedagens/HospedagemForm';
import FormasAcessoList from './pages/formasAcesso/FormasAcessoList';
import FormaAcessoForm from './pages/formasAcesso/FormaAcessoForm';
import TimesList from './pages/times/TimesList';
import TimeForm from './pages/times/TimeForm';
import ProdutosSoftwareList from './pages/produtosSoftware/ProdutosSoftwareList';
import ProdutoSoftwareForm from './pages/produtosSoftware/ProdutoSoftwareForm';
import CapexList from './pages/capex/CapexList';
import CapexForm from './pages/capex/CapexForm';
import PermissoesPage from './pages/configuracoes/PermissoesPage';

function PrivateRoute({ children }) {
  const { usuario, carregando } = useAuth();
  if (carregando) return <div className="carregando">Carregando...</div>;
  if (!usuario) return <Navigate to="/login" replace />;
  return children;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        path="/"
        element={
          <PrivateRoute>
            <Layout />
          </PrivateRoute>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="usuarios" element={<UsuariosList />} />
        <Route path="usuarios/novo" element={<UsuarioForm />} />
        <Route path="usuarios/editar/:id" element={<UsuarioForm />} />
        <Route path="fornecedores" element={<FornecedoresList />} />
        <Route path="fornecedores/novo" element={<FornecedorForm />} />
        <Route path="fornecedores/editar/:id" element={<FornecedorForm />} />
        <Route path="areas" element={<AreasList />} />
        <Route path="areas/novo" element={<AreaForm />} />
        <Route path="areas/editar/:id" element={<AreaForm />} />
        <Route path="hospedagens" element={<HospedagensList />} />
        <Route path="hospedagens/novo" element={<HospedagemForm />} />
        <Route path="hospedagens/editar/:id" element={<HospedagemForm />} />
        <Route path="formas-acesso" element={<FormasAcessoList />} />
        <Route path="formas-acesso/novo" element={<FormaAcessoForm />} />
        <Route path="formas-acesso/editar/:id" element={<FormaAcessoForm />} />
        <Route path="times" element={<TimesList />} />
        <Route path="times/novo" element={<TimeForm />} />
        <Route path="times/editar/:id" element={<TimeForm />} />
        <Route path="produtos-software" element={<ProdutosSoftwareList />} />
        <Route path="produtos-software/novo" element={<ProdutoSoftwareForm />} />
        <Route path="produtos-software/editar/:id" element={<ProdutoSoftwareForm />} />
        <Route path="capex" element={<CapexList />} />
        <Route path="capex/novo" element={<CapexForm />} />
        <Route path="capex/editar/:id" element={<CapexForm />} />
        <Route path="configuracoes" element={<PermissoesPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <PermissoesProvider>
        <AppRoutes />
      </PermissoesProvider>
    </AuthProvider>
  );
}
