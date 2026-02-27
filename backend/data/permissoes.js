const fs = require('fs');
const path = require('path');

const FILE = path.join(__dirname, 'permissoes.json');

const TIPOS = ['admin', 'membro', 'visualizacao'];
const ENTIDADES = ['usuarios', 'fornecedores', 'areas', 'hospedagens', 'formas-acesso', 'times', 'produtos-software'];

function defaultRegras() {
  const regras = [];
  TIPOS.forEach((tipo) => {
    ENTIDADES.forEach((entidade) => {
      let visualizar = true;
      let editar = tipo === 'admin';
      let criar = tipo === 'admin';
      let excluir = tipo === 'admin';
      if (tipo === 'membro') {
        editar = true;
        criar = true;
        excluir = false;
      }
      if (tipo === 'visualizacao') {
        editar = false;
        criar = false;
        excluir = false;
      }
      regras.push({ tipo, entidade, visualizar, editar, criar, excluir });
    });
  });
  return regras;
}

function read() {
  try {
    const data = fs.readFileSync(FILE, 'utf8');
    return JSON.parse(data);
  } catch {
    const initial = defaultRegras();
    fs.writeFileSync(FILE, JSON.stringify(initial, null, 2));
    return initial;
  }
}

function write(regras) {
  fs.writeFileSync(FILE, JSON.stringify(regras, null, 2));
}

function listar() {
  return read();
}

function getPorTipo(tipo) {
  return read().filter((r) => r.tipo === tipo);
}

function getPermissao(tipo, entidade) {
  const r = read().find((x) => x.tipo === tipo && x.entidade === entidade);
  if (r) return r;
  const def = defaultRegras().find((x) => x.tipo === tipo && x.entidade === entidade);
  return def || { tipo, entidade, visualizar: false, editar: false, criar: false, excluir: false };
}

function pode(tipo, entidade, acao) {
  const p = getPermissao(tipo, entidade);
  return Boolean(p[acao]);
}

function salvarTodas(regras) {
  const validas = (regras || []).filter(
    (r) => TIPOS.includes(r.tipo) && ENTIDADES.includes(r.entidade)
  );
  const atuais = read();
  const mapa = new Map(atuais.map((r) => [`${r.tipo}:${r.entidade}`, r]));
  validas.forEach((r) => {
    mapa.set(`${r.tipo}:${r.entidade}`, {
      tipo: r.tipo,
      entidade: r.entidade,
      visualizar: Boolean(r.visualizar),
      editar: Boolean(r.editar),
      criar: Boolean(r.criar),
      excluir: Boolean(r.excluir),
    });
  });
  write(Array.from(mapa.values()));
  return listar();
}

module.exports = {
  listar,
  getPorTipo,
  getPermissao,
  pode,
  salvarTodas,
  TIPOS,
  ENTIDADES,
};
