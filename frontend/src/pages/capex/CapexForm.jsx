import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { capexApi, areasApi, fornecedoresApi } from '../../api/client';
import '../usuarios/Usuarios.css';
import '../CadastroFormLayout.css';

const PERIODOS = [
  { value: 'mensal', label: 'Mensal' },
  { value: 'semestral', label: 'Semestral' },
  { value: 'anual', label: 'Anual' },
];

const TIPOS = [
  { value: 'sistema', label: 'Sistema' },
  { value: 'infraestrutura', label: 'Infraestrutura' },
];

export default function CapexForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdicao = Boolean(id);

  const [areas, setAreas] = useState([]);
  const [fornecedores, setFornecedores] = useState([]);

  const [areaId, setAreaId] = useState('');
  const [periodo, setPeriodo] = useState('mensal');
  const [tipo, setTipo] = useState('sistema');
  const [fornecedorId, setFornecedorId] = useState('');
  const [valor, setValor] = useState('');
  const [ano, setAno] = useState('');

  const [erro, setErro] = useState('');
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    Promise.all([areasApi.listar(), fornecedoresApi.listar()])
      .then(([areasList, fornList]) => {
        setAreas(Array.isArray(areasList) ? areasList : []);
        setFornecedores(Array.isArray(fornList) ? fornList : []);
      })
      .catch((e) => setErro(e.message));
  }, []);

  useEffect(() => {
    if (isEdicao && id) {
      capexApi
        .buscar(id)
        .then((c) => {
          setAreaId(c.areaId ?? '');
          setPeriodo(c.periodo ?? 'mensal');
          setTipo(c.tipo ?? 'sistema');
          setFornecedorId(c.fornecedorId ?? '');
          setValor(c.valor != null ? String(c.valor) : '');
          setAno(c.ano != null ? String(c.ano) : '');
        })
        .catch((e) => setErro(e.message));
    }
  }, [id, isEdicao]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErro('');
    if (!areaId || !areaId.trim()) {
      setErro('Área é obrigatória.');
      return;
    }
    const valorNum = valor === '' ? null : Number(valor);
    if (valorNum != null && Number.isNaN(valorNum)) {
      setErro('Valor deve ser um número.');
      return;
    }
    setEnviando(true);
    try {
      const payload = {
        areaId: areaId.trim(),
        periodo,
        tipo,
        fornecedorId: fornecedorId.trim() || null,
        valor: valorNum,
        ano: ano === '' ? null : Number(ano) || null,
      };
      if (isEdicao) await capexApi.atualizar(id, payload);
      else await capexApi.criar(payload);
      navigate('/capex');
    } catch (err) {
      setErro(err.message);
    } finally {
      setEnviando(false);
    }
  };

  const anoAtual = new Date().getFullYear();

  return (
    <div className="usuarios-page form-cadastro-page">
      <div className="page-header">
        <h1>{isEdicao ? 'Editar Capex' : 'Novo Capex'}</h1>
        <Link to="/capex" className="btn btn-secondary">Voltar</Link>
      </div>
      <form className="form-card form-cadastro" onSubmit={handleSubmit}>
        {erro && <p className="erro-msg">{erro}</p>}

        <section className="form-secao">
          <h2 className="form-secao-titulo">Dados do Capex</h2>
          <label className="form-group">
            <span className="form-label">Área *</span>
            <select value={areaId} onChange={(e) => setAreaId(e.target.value)} required>
              <option value="">— Selecione a área —</option>
              {areas.map((a) => (
                <option key={a.id} value={a.id}>{a.nome}</option>
              ))}
            </select>
          </label>
          <label className="form-group">
            <span className="form-label">Período</span>
            <select value={periodo} onChange={(e) => setPeriodo(e.target.value)}>
              {PERIODOS.map((p) => (
                <option key={p.value} value={p.value}>{p.label}</option>
              ))}
            </select>
          </label>
          <label className="form-group">
            <span className="form-label">Tipo</span>
            <select value={tipo} onChange={(e) => setTipo(e.target.value)}>
              {TIPOS.map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </label>
          <label className="form-group">
            <span className="form-label">Fornecedor</span>
            <select value={fornecedorId} onChange={(e) => setFornecedorId(e.target.value)}>
              <option value="">— Nenhum / Selecione —</option>
              {fornecedores.map((f) => (
                <option key={f.id} value={f.id}>{f.nome}</option>
              ))}
            </select>
          </label>
          <label className="form-group">
            <span className="form-label">Valor (R$)</span>
            <input
              type="number"
              step="0.01"
              min={0}
              value={valor}
              onChange={(e) => setValor(e.target.value)}
              placeholder="0,00"
            />
          </label>
          <label className="form-group">
            <span className="form-label">Ano (referência)</span>
            <input
              type="number"
              min={2000}
              max={2100}
              value={ano}
              onChange={(e) => setAno(e.target.value)}
              placeholder={String(anoAtual)}
            />
          </label>
        </section>

        <div className="form-actions">
          <button type="submit" className="btn btn-primary" disabled={enviando}>
            {enviando ? 'Salvando...' : isEdicao ? 'Salvar alterações' : 'Cadastrar Capex'}
          </button>
          <Link to="/capex" className="btn btn-secondary">Cancelar</Link>
        </div>
      </form>
    </div>
  );
}
