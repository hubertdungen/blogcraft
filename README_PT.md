# BlogCraft - Editor Avançado para Blogger

O BlogCraft é uma aplicação web moderna concebida para substituir ferramentas descontinuadas como o Open Live Writer, oferecendo uma solução abrangente para edição e publicação no Blogger com uma interface avançada e recursos poderosos.

## 🚀 Início Rápido

### Pré-requisitos
- Node.js 18.x ou superior (recomendado)
- npm (v9+) ou Yarn (v1.22+)
- Conta Google com acesso ao Blogger

### Instalação

1. Clonar o repositório
   ```bash
   git clone https://github.com/seu-utilizador/blogcraft.git
   cd blogcraft
   ```

2. Instalar dependências
   ```bash
   npm install
   # ou
   yarn install
   ```

3. Configurar variáveis de ambiente
   - Criar um ficheiro `.env` na raiz do projeto com o seguinte:
   ```
   # ID de Cliente OAuth do Google (da Google Cloud Console)
   REACT_APP_GOOGLE_CLIENT_ID=seu-id-cliente.apps.googleusercontent.com

   # Chave API do TinyMCE (opcional mas recomendado)
   REACT_APP_TINYMCE_API_KEY=sua-chave-tinymce
   ```

4. Configurar OAuth do Google
   - Aceder à [Google Cloud Console](https://console.cloud.google.com/)
   - Criar um novo projeto ou selecionar um existente
   - Ativar a API do Blogger
   - Criar credenciais OAuth 2.0:
     * Tipo de aplicação: Aplicação web
     * Origens JavaScript autorizadas: `http://localhost:3000`
     * URIs de redirecionamento autorizados: `http://localhost:3000`
   - Copiar o ID de Cliente para o ficheiro `.env`

5. Executar a aplicação
   ```bash
   npm start
   # ou
   yarn start
   ```

6. Aceder à aplicação em `http://localhost:3000`

## 🔑 Guia de Autenticação

### Configuração OAuth do Google

1. **Criar Projeto na Google Cloud**
   - Visitar [Google Cloud Console](https://console.cloud.google.com/)
   - Criar um novo projeto ou selecionar um existente

2. **Ativar APIs**
   - Navegar para "APIs e Serviços"
   - Ativar "API do Blogger"
   - Ativar "API do Google+"

3. **Criar Credenciais OAuth**
   - Ir para "Credenciais"
   - Clicar em "Criar Credenciais" > "ID de cliente OAuth"
   - Selecionar "Aplicação web"
   - Adicionar origens e URIs de redirecionamento autorizados
     * Para desenvolvimento local: `http://localhost:3000`
     * Para produção: O seu domínio atual

4. **Configurar Ecrã de Consentimento**
   - Configurar ecrã de consentimento OAuth
   - Adicionar âmbitos necessários:
     * `.../auth/blogger` (API do Blogger)
     * `email`
     * `perfil`

5. **Considerações de Segurança**
   - Manter o ID de Cliente e credenciais confidenciais
   - Nunca submeter informações sensíveis ao controlo de versão
   - Utilizar variáveis de ambiente para dados sensíveis

### Resolução de Problemas
- Garantir que a conta Google tem acesso ao Blogger
- Verificar se o ID de Cliente e âmbitos correspondem à aplicação
- Verificar conectividade de rede
- Garantir que o navegador suporta fluxos OAuth modernos

## 📚 Mais Ajuda
- [Documentação da API do Blogger](https://developers.google.com/blogger/docs/3.0/getting_started)
- [Guia OAuth do Google](https://developers.google.com/identity/protocols/oauth2)

## 💻 Dicas de Desenvolvimento
- Usar navegação anónima/privada para testar fluxos de início de sessão
- Limpar cache do navegador se ocorrerem problemas de autenticação
- Verificar mensagens de erro na consola do navegador

## 🛡️ Permissões
O BlogCraft requer permissões mínimas para:
- Ler os seus blogues do Blogger
- Criar, editar e gerir artigos de blogue
- Aceder a informações básicas de perfil

---

Desenvolvido com ❤️ para a comunidade de bloguistas