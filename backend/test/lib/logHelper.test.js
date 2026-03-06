const mockCriar = jest.fn();
jest.mock('../../data/logs', () => ({
  criar: (...args) => mockCriar(...args),
}));

const { registrarLog } = require('../../lib/logHelper');

describe('lib/logHelper', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockCriar.mockResolvedValue({});
  });

  it('chama criar com tipo, descricao e usuarioId', async () => {
    await registrarLog('login', 'Login: admin', 'user-1');
    expect(mockCriar).toHaveBeenCalledWith({
      tipo: 'login',
      descricao: 'Login: admin',
      usuarioId: 'user-1',
    });
  });

  it('passa usuarioId null quando não informado', async () => {
    await registrarLog('edicao', 'Editou usuário');
    expect(mockCriar).toHaveBeenCalledWith(
      expect.objectContaining({ usuarioId: null })
    );
  });

  it('não propaga erro (trata internamente)', async () => {
    mockCriar.mockRejectedValue(new Error('DB error'));
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    await expect(registrarLog('login', 'x', 'u1')).resolves.not.toThrow();
    consoleSpy.mockRestore();
  });
});
