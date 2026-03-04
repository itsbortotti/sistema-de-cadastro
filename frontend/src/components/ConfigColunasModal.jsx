import { useState, useEffect } from 'react';

const MAX_VISIBLE = 6;

/**
 * Modal para escolher até 6 colunas visíveis e alterar a ordem.
 * @param {{ open: boolean, onClose: () => void, allColumns: Array<{ id: string, label: string }>, visibleIds: string[], onSave: (ids: string[]) => void }} props
 */
export default function ConfigColunasModal({ open, onClose, allColumns, visibleIds, onSave }) {
  const [selected, setSelected] = useState([]);

  useEffect(() => {
    if (open) setSelected([...visibleIds]);
  }, [open, visibleIds]);

  const toggle = (id) => {
    setSelected((prev) => {
      const idx = prev.indexOf(id);
      if (idx >= 0) return prev.filter((x) => x !== id);
      if (prev.length >= MAX_VISIBLE) return prev;
      return [...prev, id];
    });
  };

  const move = (index, dir) => {
    const next = [...selected];
    const to = index + dir;
    if (to < 0 || to >= next.length) return;
    [next[index], next[to]] = [next[to], next[index]];
    setSelected(next);
  };

  const handleSave = () => {
    onSave(selected);
    onClose();
  };

  if (!open) return null;

  return (
    <div className="modal-overlay config-colunas-overlay" onClick={onClose} role="dialog" aria-modal="true" aria-label="Configurar colunas">
      <div className="modal-box config-colunas-modal" onClick={(e) => e.stopPropagation()}>
        <div className="config-colunas-header">
          <h3 className="config-colunas-titulo">Configurar colunas</h3>
          <p className="config-colunas-desc">Selecione até {MAX_VISIBLE} colunas para exibir (a ordem abaixo será usada na tabela).</p>
        </div>
        <ul className="config-colunas-lista">
          {selected.map((id, index) => {
            const col = allColumns.find((c) => c.id === id);
            if (!col) return null;
            return (
              <li key={id} className="config-colunas-item">
                <span className="config-colunas-label">{col.label}</span>
                <div className="config-colunas-botoes">
                  <button type="button" className="btn btn-icone" title="Subir" onClick={() => move(index, -1)} disabled={index === 0}>
                    ▲
                  </button>
                  <button type="button" className="btn btn-icone" title="Descer" onClick={() => move(index, 1)} disabled={index === selected.length - 1}>
                    ▼
                  </button>
                  <button type="button" className="btn btn-icone btn-icone-danger" title="Remover da exibição" onClick={() => toggle(id)}>
                    ✕
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
        <div className="config-colunas-disponiveis">
          <p className="config-colunas-disponiveis-titulo">Incluir coluna:</p>
          <div className="config-colunas-chips">
            {allColumns
              .filter((c) => !selected.includes(c.id))
              .map((c) => (
                <button
                  key={c.id}
                  type="button"
                  className="config-colunas-chip"
                  onClick={() => toggle(c.id)}
                  disabled={selected.length >= MAX_VISIBLE}
                >
                  + {c.label}
                </button>
              ))}
            {allColumns.filter((c) => !selected.includes(c.id)).length === 0 && (
              <span className="config-colunas-todas">Todas as colunas já estão visíveis.</span>
            )}
          </div>
        </div>
        <div className="config-colunas-acoes">
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            Cancelar
          </button>
          <button type="button" className="btn btn-primary" onClick={handleSave}>
            Aplicar
          </button>
        </div>
      </div>
    </div>
  );
}
