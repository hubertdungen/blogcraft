# Estrutura do Projeto BlogCraft

Abaixo está a estrutura de arquivos recomendada para o projeto BlogCraft:

```
blogcraft/
├── node_modules/
├── public/
│   ├── index.html
│   ├── logo.svg
│   ├── logo192.png
│   ├── logo512.png
│   ├── manifest.json
│   └── robots.txt
├── src/
│   ├── components/
│   │   ├── Dashboard.js
│   │   ├── PostEditor.js
│   │   ├── Settings.js
│   │   ├── Sidebar.js
│   │   └── TemplatesManager.js
│   ├── services/
│   │   └── BloggerService.js
│   ├── styles/
│   │   ├── dashboard.css
│   │   ├── editor.css
│   │   ├── settings.css
│   │   └── templates.css
│   ├── utils/
│   │   ├── dateUtils.js
│   │   └── fileUtils.js
│   ├── App.css
│   ├── App.js
│   ├── App.test.js
│   ├── index.css
│   ├── index.js
│   ├── logo.svg
│   ├── reportWebVitals.js
│   └── setupTests.js
├── .gitignore
├── package-lock.json
├── package.json
└── README.md
```

## Passos para Implementação

1. **Configuração da Estrutura de Pastas**:
   - Criar as pastas `components`, `services`, `styles` e `utils` dentro de `src`
   - Mover os arquivos desenvolvidos para as pastas apropriadas

2. **Instalar Dependências**:
   ```bash
   npm install @tinymce/tinymce-react react-datetime-picker file-saver @react-oauth/google react-router-dom
   ```

3. **Configuração do OAuth**:
   - Confirmar que o Client ID do OAuth está correto em `index.js`:
   ```javascript
   const CLIENT_ID = "404858006833-cs2qa9oank867t1jkpttus0uq1m7nnfm.apps.googleusercontent.com";
   ```

4. **Implementação dos Componentes**:
   - Copiar os componentes desenvolvidos para suas respectivas pastas
   - Atualizar as importações em cada arquivo para refletir a nova estrutura

5. **Implementação dos Estilos**:
   - Copiar os estilos CSS para seus respectivos arquivos
   - Importar os estilos em `App.css` ou nos componentes apropriados

6. **Configuração dos Arquivos Principais**:
   - Atualizar `App.js` e `index.js` com o código desenvolvido

## Utilitários Adicionais

### dateUtils.js

```javascript
/**
 * Formata uma data para exibição
 * @param {string|Date} date - Data para formatar
 * @returns {string} Data formatada
 */
export const formatDate = (date) => {
  if (!date) return '';
  
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  return dateObj.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

/**
 * Verifica se uma data está no futuro
 * @param {string|Date} date - Data para verificar
 * @returns {boolean} True se a data estiver no futuro
 */
export const isFutureDate = (date) => {
  if (!date) return false;
  
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  
  return dateObj > now;
};
```

### fileUtils.js

```javascript
/**
 * Extrai nome e extensão de um arquivo
 * @param {string} filename - Nome do arquivo
 * @returns {Object} Objeto contendo nome e extensão
 */
export const parseFileName = (filename) => {
  const lastDot = filename.lastIndexOf('.');
  
  if (lastDot === -1) {
    return { name: filename, extension: '' };
  }
  
  return {
    name: filename.substring(0, lastDot),
    extension: filename.substring(lastDot + 1).toLowerCase()
  };
};

/**
 * Verifica se a extensão do arquivo é suportada
 * @param {string} filename - Nome do arquivo
 * @param {Array} supportedExtensions - Lista de extensões suportadas
 * @returns {boolean} True se a extensão for suportada
 */
export const isExtensionSupported = (filename, supportedExtensions) => {
  const { extension } = parseFileName(filename);
  
  return supportedExtensions.includes(extension);
};
```

## Considerações Finais

Ao implementar o projeto, certifique-se de:

1. Verificar que todas as importações estão corretas
2. Testar o fluxo completo de autenticação e integração com o Blogger
3. Verificar a responsividade em diferentes dispositivos
4. Testar o tema claro e escuro
5. Verificar o tratamento de erros em todos os componentes

Para obter uma chave da API do TinyMCE, visite [https://www.tiny.cloud/](https://www.tiny.cloud/) e registre-se para uma conta gratuita. A chave deve ser adicionada nos componentes que utilizam o editor.