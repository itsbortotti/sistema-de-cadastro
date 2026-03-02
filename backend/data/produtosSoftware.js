const fs = require('fs');
const path = require('path');

const FILE = path.join(__dirname, 'produtosSoftware.json');

function read() {
  try {
    return JSON.parse(fs.readFileSync(FILE, 'utf8'));
  } catch {
    fs.writeFileSync(FILE, '[]');
    return [];
  }
}

function write(data) {
  fs.writeFileSync(FILE, JSON.stringify(data, null, 2));
}

function listar() {
  return read();
}

function getById(id) {
  return read().find((x) => x.id === id);
}

function criar(dados) {
  const lista = read();
  const id = String(Date.now());
  const novo = {
    id,
    nomeSistema: dados.nomeSistema || '',
    fornecedorId: dados.fornecedorId || null,
    finalidadePrincipal: dados.finalidadePrincipal || '',
    breveDescritivo: dados.breveDescritivo || '',
    marcasAtendidas: dados.marcasAtendidas || '',
    usuariosQtdAproximada: dados.usuariosQtdAproximada != null ? Number(dados.usuariosQtdAproximada) : null,
    areaId: dados.areaId || null,
    responsavelTiId: dados.responsavelTiId || null,
    usuarioNegocioId: dados.usuarioNegocioId || null,
    hospedagemId: dados.hospedagemId || null,
    onPremisesSites: dados.onPremisesSites || '',
    formaAcessoId: dados.formaAcessoId || null,
    integracoes: dados.integracoes || '',
    controleAcessoPorUsuario: Boolean(dados.controleAcessoPorUsuario),
    autenticacaoAdSso: Boolean(dados.autenticacaoAdSso),
    grauSatisfacao: dados.grauSatisfacao != null ? String(dados.grauSatisfacao) : null,
    problemasEnfrentados: dados.problemasEnfrentados || '',
    custoMensalSistema: dados.custoMensalSistema != null && dados.custoMensalSistema !== '' ? Number(dados.custoMensalSistema) : null,
    custoMensalInfraestrutura: dados.custoMensalInfraestrutura != null && dados.custoMensalInfraestrutura !== '' ? Number(dados.custoMensalInfraestrutura) : null,
    timeId: dados.timeId || null,
    dataInicio: dados.dataInicio && String(dados.dataInicio).trim() ? String(dados.dataInicio).trim() : null,
    dataFim: dados.dataFim && String(dados.dataFim).trim() ? String(dados.dataFim).trim() : null,
  };
  lista.push(novo);
  write(lista);
  return novo;
}

function atualizar(id, dados) {
  const lista = read();
  const idx = lista.findIndex((x) => x.id === id);
  if (idx === -1) return null;
  const atual = lista[idx];
  const campos = [
    'nomeSistema', 'fornecedorId', 'finalidadePrincipal', 'breveDescritivo', 'marcasAtendidas',
    'usuariosQtdAproximada', 'areaId', 'responsavelTiId', 'usuarioNegocioId', 'hospedagemId',
    'onPremisesSites', 'formaAcessoId', 'integracoes', 'controleAcessoPorUsuario', 'autenticacaoAdSso',
    'grauSatisfacao', 'problemasEnfrentados', 'custoMensalSistema', 'custoMensalInfraestrutura', 'timeId',
    'dataInicio', 'dataFim',
  ];
  campos.forEach((c) => {
    if (dados[c] !== undefined) {
      if (c === 'usuariosQtdAproximada' || c === 'custoMensalSistema' || c === 'custoMensalInfraestrutura') {
        atual[c] = dados[c] === '' || dados[c] == null ? null : Number(dados[c]);
      } else if (c === 'controleAcessoPorUsuario' || c === 'autenticacaoAdSso') {
        atual[c] = Boolean(dados[c]);
      } else if (c === 'dataInicio' || c === 'dataFim') {
        atual[c] = dados[c] && String(dados[c]).trim() ? String(dados[c]).trim() : null;
      } else {
        atual[c] = dados[c];
      }
    }
  });
  write(lista);
  return atual;
}

function remover(id) {
  const lista = read().filter((x) => x.id !== id);
  if (lista.length === read().length) return false;
  write(lista);
  return true;
}

module.exports = { listar, getById, criar, atualizar, remover };
