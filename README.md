# BlogCraft - Editor Avançado para Blogger

BlogCraft é uma aplicação web moderna que substitui o Open Live Writer e outras aplicações descontinuadas, oferecendo uma solução completa para edição e publicação no Blogger com interface moderna e recursos avançados.

## 📋 Funcionalidades

### ✏️ Edição Avançada
- Editor de texto rico estilo Microsoft Word
- Formatação completa de texto, imagens, tabelas e mais
- Conversão otimizada para o formato do Blogger

### 🎨 Interface Moderna
- UI limpa e intuitiva
- Suporte a Dark Mode e Light Mode
- Design responsivo para desktop e mobile

### 📝 Gerenciamento de Conteúdo
- Edição e automação de metadados
- Gestão de títulos, subtítulos, tags e categorias
- Visualização prévia do post

### 📁 Templates
- Criação e salvamento de templates personalizados
- Reutilização rápida para posts similares
- Organização de templates por categorias

### 🚀 Publicação Integrada
- Publicação direta para o Blogger via API oficial
- Agendamento de posts (data e hora)
- Status de publicação em tempo real

### 🔄 Recursos Extras
- Importação de arquivos Word e TXT
- Duplicação de posts existentes
- Salvamento automático de rascunhos
- Backup local de conteúdo

## 🚀 Instalação

### Pré-requisitos
- Node.js 16.x ou superior
- npm ou yarn

### Passos para instalação

1. Clone o repositório
   ```bash
   git clone https://github.com/seu-usuario/blogcraft.git
   cd blogcraft
   ```

2. Instale as dependências
   ```bash
   npm install
   # ou
   yarn install
   ```

3. Configure as variáveis de ambiente
   - Crie um arquivo `.env` na raiz do projeto
   - Adicione sua chave da API TinyMCE:
   ```
   REACT_APP_TINYMCE_API_KEY=sua-chave-aqui
   ```

4. Execute o aplicativo
   ```bash
   npm start
   # ou
   yarn start
   ```

5. Acesse o aplicativo em `http://localhost:3000`

## 🔑 Autenticação

Para usar o BlogCraft, você precisará:
1. Fazer login com sua conta Google associada ao Blogger
2. Autorizar o aplicativo a acessar sua conta do Blogger

O aplicativo usa o protocolo OAuth2 para autenticação segura e não armazena suas credenciais.

## 💻 Tecnologias Utilizadas

- React.js - Framework front-end
- React Router - Navegação
- TinyMCE - Editor de texto rico
- Google OAuth - Autenticação
- Blogger API v3 - Integração com o Blogger

## 🔧 Configuração

No menu de configurações, você pode personalizar:
- Blog padrão para publicação
- Template padrão para novos posts
- Intervalo de salvamento automático
- Opções de backup
- Preferências de tema (claro/escuro)

## 📱 Compatibilidade

- Navegadores modernos (Chrome, Firefox, Safari, Edge)
- Responsivo para desktop, tablet e smartphone
- Funcionalidade offline limitada para edição de rascunhos

## 🔮 Recursos Futuros

- Integração com outras plataformas de blog
- Editor em modo offline completo
- Estatísticas de publicação
- Gerenciamento de comentários
- Suporte a múltiplos autores

## 📄 Licença

Este projeto está licenciado sob a Licença MIT - veja o arquivo [LICENSE](LICENSE) para detalhes.

## 📞 Suporte

Para suporte, dúvidas ou sugestões, abra uma issue no repositório do GitHub ou entre em contato através de [seu-email@exemplo.com].

---

Desenvolvido com ❤️ para a comunidade de blogueiros.
