import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { areasApi } from '../../api/client';
import '../usuarios/Usuarios.css';
import '../CadastroListLayout.css';

function v(val) {
  return val != null && String(val).trim() !== '' ? String(val).trim() : '—';
}

export default function AreasList() {
  const [lista, setLista] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');
  const [excluindo, setExcluindo] = useState(null);

  const carregar = () => {
    setCarregando(true);
    setErro('');
    areasApi.listar().then(setLista).catch((e) => setErro(e.message)).finally(() => setCarregando(false));
  };
  useEffect(() => carregar(), []);

  const handleExcluir = (id, nome) => {
    if (!window.confirm(`Excluir "${nome}"?`)) return;
    setExcluindo(id);
    areasApi.remover(id).then(carregar).catch((e) => setErro(e.message)).finally(() => setExcluindo(null));
  };

  if (carregando) return <p className="page-loading">Carregando...</p>;
  if (erro) return <p className="erro-msg">{erro}</p>;

  return (
    <div className="usuarios-page cadastro-list-page">
      <div className="page-header">
        <h1>Áreas</h1>
        <Link to="/areas/novo" className="btn btn-primary">Nova área</Link>
      </div>
      <div className="table-wrap">
        <table className="table table-cadastro">
          <thead>
            <tr>
              <th>Nome</th>
              <th>Código</th>
              <th>Responsável</th>
              <th>Descrição</th>
              <th className="th-acoes">Ações</th>
            </tr>
          </thead>
          <tbody>
            {lista.length === 0 ? (
              <tr><td colSpan={5}>Nenhum cadastrado.</td></tr>
            ) : (
              lista.map((item) => (
                <tr key={item.id}>
                  <td className="td-texto" title={item.nome}>{v(item.nome)}</td>
                  <td>{v(item.codigo)}</td>
                  <td className="td-texto" title={item.responsavel}>{v(item.responsavel)}</td>
                  <td className="td-texto" title={item.descricao}>{v(item.descricao)}</td>
                  <td className="td-acoes">
                    <Link to={`/areas/editar/${item.id}`} className="btn btn-sm">Editar</Link>
                    <button type="button" className="btn btn-sm btn-danger" onClick={() => handleExcluir(item.id, item.nome)} disabled={excluindo === item.id}>
                      {excluindo === item.id ? '...' : 'Excluir'}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
