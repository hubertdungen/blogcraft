# BlogCraft - Editor Avançado para Blogger

O BlogCraft é uma aplicação web moderna concebida para substituir ferramentas descontinuadas como o Open Live Writer, oferecendo uma solução abrangente para edição e publicação no Blogger com uma interface avançada e recursos poderosos.

Estado: Alpha/Preview — executável localmente. Fluxos principais (login com Google, listar blogs e posts, criar/atualizar/publicar, templates e definições) já implementados.

## 🚀 Início Rápido

### Release portátil descarregada

Para utilizadores Windows, o caminho mais simples é o executável portátil sem
instalação:

1. Descarregar o `.exe` portátil da release.
2. Executar o ficheiro.
3. Abrir `http://localhost:3000` se o navegador não abrir automaticamente.
4. Iniciar sessão com a conta Google que possui ou pode editar os seus blogues
   do Blogger.

Utilizadores normais não precisam de criar um projeto na Google Cloud, ativar
APIs nem editar ficheiros `.env`. Só precisam de aprovar o acesso ao Blogger no
início de sessão Google. O Google Authenticator não é um requisito do BlogCraft;
o Google pode pedir a autenticação de dois fatores normal se a conta a tiver
ativa.

### Pré-requisitos para código-fonte/desenvolvimento

- Node.js 18.x ou superior (recomendado)
- npm (v9+) ou Yarn (v1.22+)
- Conta Google com acesso ao Blogger

### Executar a partir do código-fonte

1. Clonar o repositório
   ```bash
   git clone https://github.com/hubertdungen/blogcraft.git
   cd blogcraft
   ```

2. Instalar dependências
   ```bash
   npm install
   # ou
   yarn install
   ```

3. Configuração local opcional
   - Copie `.env.example` para `.env` apenas se quiser substituir valores
     predefinidos.
   - `REACT_APP_GOOGLE_CLIENT_ID` é opcional para uso local normal, porque o
     BlogCraft inclui um ID de cliente OAuth predefinido.
   - `REACT_APP_TINYMCE_API_KEY` também é opcional.

4. Executar a aplicação
   ```bash
   # No macOS/Linux
   ./run.sh

   # No Windows
   run.bat

   # Ou iniciar manualmente
   npm start
   ```

5. Aceder à aplicação em `http://localhost:3000`

## ✨ Novidades

- Login Google via `@react-oauth/google` com escopo do Blogger
- Melhorias no manuseio de token em `AuthService` e `TokenManager` (verificações de sessão, armazenamento mais seguro)
- `BloggerService` com cache, timeouts e mensagens de erro mais claras (401/403/429)
- Dashboard: seleção de blog, posts recentes e estatísticas mensais básicas
- Editor (TinyMCE): rascunho/publicar, agendamento, etiquetas, injeção de metadados, importação (TXT/HTML/Word) e exportação para Word
- Gestor de Templates: criar, editar, apagar e reutilizar templates de conteúdo
- Definições: tema (escuro/claro), predefinições, opções de autosave/backup
- Fundações de i18n (`en-US`, `pt-PT`) e melhorias de estilo

## 🔑 Guia de Autenticação

### Início de sessão normal

O BlogCraft usa OAuth da Google para pedir permissão de acesso ao Blogger.
Durante o login, escolha a mesma conta Google que aparece no Blogger. Se o
BlogCraft disser "Nenhum blogue encontrado", use **Trocar Conta Google** e
escolha a conta que possui ou tem permissão de autor/admin nos blogues.

A API do Blogger só devolve blogues onde a conta autenticada tem autoria ou
permissões de administrador. Se um blogue aparecer no Blogger noutra conta
Google, ele não aparece no BlogCraft até essa conta ser escolhida.

### Configuração de cliente OAuth próprio

A maioria dos utilizadores não precisa desta secção. Use-a apenas para manter
uma release pública, correr um fork ou substituir o ID de cliente OAuth incluído.

1. **Criar Projeto na Google Cloud**
   - Visitar [Google Cloud Console](https://console.cloud.google.com/)
   - Criar um novo projeto ou selecionar um existente

2. **Ativar APIs**
   - Navegar para "APIs e Serviços"
   - Ativar "API do Blogger"

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
   - IDs de cliente OAuth são identificadores públicos, mas segredos de cliente
     nunca devem ser usados na app de navegador nem enviados para o controlo de
     versão
   - Manter o ecrã de consentimento OAuth publicado/configurado para os
     utilizadores pretendidos
   - Se a app OAuth ficar em modo de teste, apenas utilizadores de teste
     configurados conseguem iniciar sessão

### Resolução de Problemas
- Verificar a conta Google mostrada no topo do dashboard do BlogCraft
- Usar **Trocar Conta Google** se o Blogger mostrar os blogues noutra conta
- Garantir que a conta Google tem acesso de autor/admin no Blogger
- Verificar se o ID de Cliente e âmbitos correspondem à aplicação
- Verificar conectividade de rede
- Garantir que o navegador suporta fluxos OAuth modernos
- Se receber 401/403, termine sessão e inicie sessão novamente
- O projeto usa `react-scripts` com `--openssl-legacy-provider` nos scripts `npm` para compatibilidade no Node 18

## 🧪 Build & Testes

```bash
npm run build
npm test -- --watchAll=false
npm run serve
```

O build de produção será criado em `build/`. Pode abrir `build/index.html`
diretamente para verificar a interface, mas o login Google OAuth deve ser usado
através de `http://localhost:3000`, porque o Google não aceita origens `file://`.
Para testar o build completo localmente, execute `npm run serve`.

## 📦 Releases Portáteis

No Windows, pode criar um executável portátil sem instalação:

```bat
build-release.bat
```

ou:

```bash
npm run release
```

O ficheiro Windows fica em `dist/blogcraft-x.y.z-windows-x64.exe`.

No macOS e Linux, pode criar um binário portátil para o sistema atual:

```bash
./build-release.sh
# ou
npm run release:current
```

Outros alvos disponíveis:

```bash
npm run release:win
npm run release:linux
npm run release:macos
npm run release:all
```

O binário de release inicia o servidor local do BlogCraft. Execute-o e abra
`http://localhost:3000` no navegador. O primeiro build de release pode
descarregar binários de runtime Node usados pelo `pkg`. Os binários macOS não
são assinados, por isso utilizadores Apple podem ter de autorizar a aplicação
nas definições de segurança do macOS ou executá-la pelo Terminal.

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

## 🗺️ Roadmap (curto prazo)
- Upload de imagens e gestão de media aprimorados
- Variáveis/snippets de template mais poderosos
- Experiência offline/autosalvamento melhorada

---

Desenvolvido com ❤️ para a comunidade de bloguistas
