import BtnVoltarHeader from '../../components/BtnVoltarHeader';
import '../usuarios/Usuarios.css';
import './ManualPage.css';

export default function ManualPage() {
  return (
    <div className="usuarios-page manual-page">
      <div className="page-header">
        <BtnVoltarHeader to="/geral" title="Voltar para Configurações" ariaLabel="Voltar" />
        <h1>Manual do sistema</h1>
      </div>
      <p className="manual-intro">
        Este manual descreve como utilizar o sistema de <strong>Gestão de Portfólio</strong>. Use o menu lateral para acessar as diferentes áreas.
      </p>

      <div className="manual-card">
        <section className="manual-secao">
          <h2 className="manual-titulo">Acesso e navegação</h2>
          <p>Após fazer login, você verá o menu lateral (sidebar) à esquerda. As opções disponíveis dependem do seu <strong>perfil de permissões</strong>. Use o botão com ícone de seta no topo das telas para voltar à listagem anterior.</p>
          <p>No canto superior direito há o botão de <strong>tema</strong> (claro/escuro), o nome do usuário logado e o botão de <strong>Sair</strong>.</p>
        </section>

        <section className="manual-secao">
          <h2 className="manual-titulo">Dashboard</h2>
          <p>A tela inicial exibe um resumo do portfólio. Acesse pelo item <strong>DASHBOARD</strong> no menu.</p>
        </section>

        <section className="manual-secao">
          <h2 className="manual-titulo">Financeiro</h2>
          <p>No menu <strong>Financeiro</strong> você encontra:</p>
          <ul>
            <li><strong>Capex</strong> — custos de capital (investimentos). Cadastre entradas com valor, período, área, fornecedor e associe a projetos.</li>
            <li><strong>Opex</strong> — custos operacionais. Mesma estrutura do Capex, com classificações e entradas por período.</li>
            <li><strong>Projetos</strong> — projetos vinculados a sistemas e empresas. Defina status (Planejado, Em andamento, Concluído, Cancelado).</li>
          </ul>
          <p>Em Capex/Opex, use <strong>Novo</strong> para criar um registro. É possível cadastrar <strong>Área</strong> e <strong>Fornecedor</strong> na hora pelo botão &quot;+ Novo&quot; no formulário. Os sistemas associados aparecem automaticamente conforme os projetos selecionados.</p>
        </section>

        <section className="manual-secao">
          <h2 className="manual-titulo">Cadastros</h2>
          <p>Em <strong>Cadastros</strong> ficam as bases utilizadas no sistema:</p>
          <ul>
            <li><strong>Áreas</strong> — áreas organizacionais. Podem ter um responsável (pessoa cadastrada).</li>
            <li><strong>Empresas</strong> — razão social, CNPJ, endereço. O CEP pode ser preenchido automaticamente ao informar o número.</li>
            <li><strong>Formas de Acesso</strong> — como o sistema é acessado (Web, Desktop, API etc.).</li>
            <li><strong>Fornecedores</strong> — fornecedores/desenvolvedores. Endereço com busca por CEP.</li>
            <li><strong>Hospedagens</strong> — onde os sistemas são hospedados (nuvem, on-premises etc.).</li>
            <li><strong>Marcas Atendidas</strong> — marcas que o sistema atende.</li>
            <li><strong>Pessoas</strong> — pessoas com nome, data de nascimento e área. Usadas como responsáveis (ex.: TI e Negócios nos sistemas).</li>
            <li><strong>Sistemas</strong> — produtos de software: nome, empresa, fornecedor, área, responsável TI, responsável Negócio, hospedagem, forma de acesso, marcas atendidas, TI ME, entre outros. Permite importar lista por CSV.</li>
            <li><strong>Usuários</strong> — usuários de acesso ao sistema (login, perfil, permissões).</li>
          </ul>
          <p>Na maioria das telas de cadastro, ao criar ou editar um registro você pode usar <strong>+ Novo</strong> ao lado de campos de seleção para cadastrar um item relacionado (ex.: nova área, novo fornecedor) sem sair da tela.</p>
        </section>

        <section className="manual-secao">
          <h2 className="manual-titulo">Configurações</h2>
          <p>Em <strong>Configurações</strong> estão:</p>
          <ul>
            <li><strong>Geral</strong> — alterar a logo do menu lateral e o favicon da aplicação (ícone da aba). As alterações são salvas no navegador.</li>
            <li><strong>Perfis</strong> — criar e editar perfis de acesso. Em cada perfil é possível definir em quais abas os usuários podem Ver, Editar, Criar e Excluir.</li>
            <li><strong>Logs</strong> — consultar registros de login, edição, criação e exclusão no sistema (conforme permissão).</li>
            <li><strong>Manual</strong> — esta página com o descritivo de uso do sistema.</li>
          </ul>
        </section>

        <section className="manual-secao">
          <h2 className="manual-titulo">Dicas gerais</h2>
          <ul>
            <li>Campos marcados com <strong>*</strong> são obrigatórios.</li>
            <li>Use a busca nas listagens para filtrar por nome ou outros critérios.</li>
            <li>Valores monetários podem ser formatados ao digitar (ex.: Capex/Opex).</li>
            <li>Se não encontrar uma opção em um select, use o botão &quot;+ Novo&quot; para cadastrar na hora.</li>
            <li>Em <strong>Sistemas</strong>, os responsáveis de TI e Negócio devem ser pessoas cadastradas nas áreas &quot;TI&quot; e &quot;Negócios&quot; respectivamente.</li>
          </ul>
        </section>
      </div>
    </div>
  );
}
