const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

const FILE = path.join(__dirname, 'usuarios.json');

function read() {
  try {
    const data = fs.readFileSync(FILE, 'utf8');
    return JSON.parse(data);
  } catch {
    const initial = [
      {
        id: '1',
        nome: 'Administrador',
        login: 'admin',
        email: '',
        senhaHash: bcrypt.hashSync('admin', 10),
        tipo: 'admin',
      },
    ];
    fs.writeFileSync(FILE, JSON.stringify(initial, null, 2));
    return initial;
  }
}

function write(usuarios) {
  fs.writeFileSync(FILE, JSON.stringify(usuarios, null, 2));
}

function getUsuarios() {
  return read();
}

function getById(id) {
  return read().find(u => u.id === id);
}

function getByLogin(login, excludeId = null) {
  return read().find(u => u.login === login && u.id !== excludeId);
}

const TIPOS_VALIDOS = ['admin', 'membro', 'visualizacao'];

function criar(dados) {
  const usuarios = read();
  const id = String(Date.now());
  const tipo = TIPOS_VALIDOS.includes(dados.tipo) ? dados.tipo : 'membro';
  const senhaHash = bcrypt.hashSync(dados.senha || '123456', 10);
  const novo = {
    id,
    nome: dados.nome,
    login: dados.login,
    email: dados.email != null ? String(dados.email).trim() : '',
    senhaHash,
    tipo,
  };
  usuarios.push(novo);
  write(usuarios);
  return { ...novo, senhaHash: undefined };
}

function atualizar(id, dados) {
  const usuarios = read();
  const idx = usuarios.findIndex(u => u.id === id);
  if (idx === -1) return null;
  usuarios[idx].nome = dados.nome ?? usuarios[idx].nome;
  usuarios[idx].login = dados.login ?? usuarios[idx].login;
  if (dados.email !== undefined) usuarios[idx].email = String(dados.email).trim();
  if (TIPOS_VALIDOS.includes(dados.tipo)) usuarios[idx].tipo = dados.tipo;
  if (dados.senha) usuarios[idx].senhaHash = bcrypt.hashSync(dados.senha, 10);
  write(usuarios);
  const { senhaHash, ...rest } = usuarios[idx];
  return rest;
}

function remover(id) {
  const usuarios = read().filter(u => u.id !== id);
  if (usuarios.length === read().length) return false;
  write(usuarios);
  return true;
}

module.exports = {
  getUsuarios,
  getById,
  getByLogin,
  criar,
  atualizar,
  remover,
};
