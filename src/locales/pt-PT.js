/**
 * Traduções para Português de Portugal (pt-PT)
 */
const translations = {
    app: {
      name: 'BlogCraft',
      slogan: 'Editor Avançado para Blogger',
      version: 'Versão {version}'
    },
    
    auth: {
      login: 'Iniciar Sessão',
      loginWithGoogle: 'Iniciar Sessão com Google',
      logout: 'Terminar Sessão',
      loggingIn: 'A iniciar sessão...',
      confirmLogout: 'Tem a certeza que deseja terminar a sessão? Os seus dados locais serão mantidos.',
      loginError: 'Falha na autenticação: {message}'
    },
    
    nav: {
      dashboard: 'Painel',
      editor: 'Novo Artigo',
      templates: 'Modelos',
      settings: 'Definições'
    },
    
    dashboard: {
      welcome: 'Bem-vindo ao BlogCraft!',
      welcomeSubtitle: 'O seu editor avançado para o Blogger.',
      quickActions: 'Ações Rápidas',
      createNew: 'Criar Novo Artigo',
      manageTemplates: 'Gerir Modelos',
      yourBlogs: 'Os Seus Blogues',
      loadingBlogs: 'A carregar blogues...',
      noBlogs: 'Nenhum blogue encontrado. Verifique se tem acesso a blogues no Blogger.',
      selectBlog: 'Selecionar Blogue:',
      stats: {
        publishedPosts: 'Artigos Publicados',
        drafts: 'Rascunhos',
        scheduled: 'Agendados',
        postsByMonth: 'Publicações por Mês'
      },
      posts: {
        recentPosts: 'Artigos Recentes',
        noPosts: 'Nenhum artigo encontrado.',
        createFirst: 'Criar Primeiro Artigo',
        status: {
          published: 'Publicado',
          draft: 'Rascunho',
          scheduled: 'Agendado'
        },
        dates: {
          publishedOn: 'Publicado em: {date}',
          updatedOn: 'Atualizado em: {date}',
          scheduledFor: 'Agendado para: {date}'
        },
        actions: {
          edit: 'Editar',
          duplicate: 'Duplicar',
          delete: 'Eliminar',
          view: 'Visualizar',
          confirmDelete: 'Tem a certeza que deseja eliminar este artigo? Esta ação não pode ser desfeita.'
        },
        controls: {
          sortBy: 'Ordenar por:',
          sortOptions: {
            date: 'Data',
            title: 'Título'
          },
          invertOrder: 'Inverter ordem',
          filter: 'Filtrar:',
          status: {
            all: 'Todos',
            published: 'Publicado',
            draft: 'Rascunho',
            scheduled: 'Agendado'
          },
          category: 'Categoria:',
          allTags: 'Todas as tags'
        }
      }
    },
    
    editor: {
      title: 'Editor de Artigo',
      placeholders: {
        title: 'Título do artigo',
        tags: 'Exemplo: tecnologia, tutorial, dicas'
      },
      labels: {
        blog: 'Blogue:',
        title: 'Título:',
        tags: 'Etiquetas (separadas por vírgula):',
        template: 'Modelo:',
        schedule: 'Agendar publicação',
        draft: 'Guardar como rascunho',
        metadata: 'Editar Metadados'
      },
      buttons: {
        saveDraft: 'Guardar Rascunho',
        publish: 'Publicar',
        schedule: 'Agendar',
        saveTemplate: 'Guardar como Modelo',
        showMetadata: 'Editar Metadados',
        hideMetadata: 'Ocultar Metadados',
        exportWord: 'Exportar como Word',
        importFile: 'Importar Ficheiro'
      },
      templates: {
        select: 'Selecionar modelo',
        none: 'Nenhum',
        templateName: 'Nome do modelo:'
      },
      metadata: {
        title: 'Metadados',
        description: 'Descrição (SEO):',
        descriptionPlaceholder: 'Breve descrição do artigo para motores de busca',
        author: 'Autor:',
        authorPlaceholder: 'Nome do autor',
        keywords: 'Palavras-chave (SEO):',
        keywordsPlaceholder: 'Palavras-chave separadas por vírgula'
      },
      saving: {
        saving: 'A guardar...',
        saved: 'Guardado com sucesso!',
        error: 'Erro ao guardar: {message}',
        autoSave: 'Guardado automaticamente às {time}'
      },
      notifications: {
        draftSaved: 'Rascunho guardado com sucesso!',
        published: 'Artigo publicado com sucesso!',
        scheduled: 'Artigo agendado com sucesso!',
        error: 'Ocorreu um erro: {message}'
      },
      errors: {
        selectBlog: 'Por favor, selecione um blogue antes de guardar o artigo.',
        enterTitle: 'Por favor, insira um título para o artigo.',
        loadBlogs: 'Não foi possível carregar os seus blogues. Por favor, verifique a sua conexão e tente novamente.',
        loadPost: 'Não foi possível carregar o artigo. Por favor, verifique a sua conexão e tente novamente.'
      }
    },

    templates: {
      title: 'Gestor de Modelos',
      createNew: 'Criar Novo Modelo',
      exportAll: 'Exportar Todos',
      importTemplates: 'Importar Modelos',
      availableTemplates: 'Modelos Disponíveis ({count})',
      noTemplates: 'Nenhum modelo disponível.',
      createOrImport: 'Crie um novo modelo ou importe modelos existentes.',
      selectToEdit: 'Selecione um modelo para editar',
      orCreateNew: 'Ou clique em "Criar Novo Modelo" para começar um novo.',
      newTemplate: 'Novo Modelo',
      editTemplate: 'Editar Modelo',
      templateName: 'Nome do Modelo:',
      templateDescription: 'Descrição (opcional):',
      templateContent: 'Conteúdo do Modelo:',
      placeholders: {
        name: 'Digite um nome para o modelo',
        description: 'Uma breve descrição do modelo'
      },
      actions: {
        save: 'Guardar Modelo',
        cancel: 'Cancelar',
        use: 'Usar',
        export: 'Exportar',
        delete: 'Eliminar',
        confirmDelete: 'Tem a certeza que deseja eliminar este modelo? Esta ação não pode ser desfeita.',
        cancelConfirm: 'Há alterações não guardadas. Deseja realmente cancelar?'
      },
      tips: {
        title: 'Dicas para Modelos',
        items: [
          'Crie modelos para tipos específicos de artigos (análises, tutoriais, notícias, etc.)',
          'Inclua espaços reservados para o conteúdo que normalmente adiciona',
          'Use estilos consistentes para manter a identidade visual do seu blogue',
          'Exporte os seus modelos favoritos para partilhar com outros utilizadores'
        ]
      },
      notifications: {
        saved: 'Modelo guardado com sucesso!',
        deleted: 'Modelo eliminado com sucesso!',
        nameRequired: 'Por favor, informe um nome para o modelo.',
        contentRequired: 'O conteúdo do modelo não pode estar vazio.',
        editorNotReady: 'Editor não inicializado. Por favor, tente novamente.',
        noTemplatesExport: 'Não há modelos para exportar.',
        loadError: 'Erro ao carregar modelos. Os dados podem estar corrompidos.'
      },
      importDialog: {
        importSuccess: 'Importação concluída! {count} modelos importados.',
        importError: 'Erro ao importar modelos: {message}',
        replaceOrMerge: 'Importar {count} modelos. Deseja substituir todos os modelos existentes?',
        replaceConfirm: 'OK para substituir ou Cancelar para mesclar com os modelos existentes.',
        conflictDetected: '{count} modelos têm IDs conflitantes.',
        conflictAction: 'Deseja sobrescrever os modelos existentes com o mesmo ID?',
        conflictConfirm: 'OK para sobrescrever ou Cancelar para manter os modelos existentes.',
        noValidTemplates: 'Nenhum modelo válido encontrado no ficheiro.',
        invalidJson: 'Ficheiro JSON inválido.'
      }
    },
    
    settings: {
      title: 'Definições',
      sections: {
        general: 'Preferências Gerais',
        autoSave: 'Guardamento Automático',
        security: 'Segurança',
          appearance: 'Aparência',
          api: 'Configurações de API',
          dataManagement: 'Gestão de Dados',
          debug: 'Depuração'
        },
        fields: {
        defaultBlog: 'Blogue Predefinido:',
        defaultBlogDesc: 'Blogue selecionado por predefinição ao criar um novo artigo.',
        defaultTemplate: 'Modelo Predefinido:',
        defaultTemplateDesc: 'Modelo carregado automaticamente ao criar um novo artigo.',
        publishStatus: 'Estado de Publicação Predefinido:',
        publishStatusDesc: 'Estado predefinido ao guardar artigos.',
        autoSaveInterval: 'Intervalo de Guardamento Automático (minutos):',
        autoSaveIntervalDesc: 'Intervalo de tempo para guardamento automático de rascunhos.',
        autoBackup: 'Cópia de Segurança Automática de Rascunhos',
        autoBackupDesc: 'Cria cópias locais de segurança dos seus rascunhos.',
        confirmDelete: 'Confirmar antes de eliminar',
        confirmDeleteDesc: 'Solicita confirmação antes de eliminar artigos ou modelos.',
        theme: 'Tema:',
        themeLight: 'Claro',
        themeDark: 'Escuro',
        themeDesc: 'Escolha entre tema claro ou escuro para a interface.',
        wideLayout: 'Área de conteúdo ampla',
        wideLayoutDesc: 'Expande a largura do conteúdo para mais espaço de edição.',
        alignment: 'Alinhamento do conteúdo:',
        alignLeft: 'Esquerda',
        alignCenter: 'Centro',
        alignRight: 'Direita',
        alignmentDesc: 'Define como a área de conteúdo é alinhada em relação à barra lateral.',
        language: 'Idioma:',
        languageDesc: 'Idioma da interface da aplicação.',
        customClientId: 'Usar ID de Cliente personalizado',
        customClientIdDesc: 'Ative esta opção para usar um ID de Cliente do Google personalizado em vez do predefinido.',
        clientId: 'ID de Cliente do Google:',
        clientIdDesc: 'Insira o ID de Cliente obtido na Google Cloud Console.',
        showDebugger: 'Mostrar janela de depuração',
        showDebuggerDesc: 'Exibe a janela de depuração de autenticação.'
        },
      buttons: {
        save: 'Guardar Definições',
        reset: 'Restaurar Definições Predefinidas',
        clearData: 'Limpar Todos os Dados Locais',
        logout: 'Terminar Sessão'
      },
      confirmations: {
        saveSuccess: 'Definições guardadas com sucesso!',
        resetConfirm: 'Tem a certeza que deseja restaurar as definições predefinidas? Esta ação não pode ser desfeita.',
        clearDataConfirm: 'ATENÇÃO: Isto apagará todos os seus dados locais, incluindo modelos e definições. Esta ação não pode ser desfeita. Deseja continuar?',
        apiChanged: 'As configurações de API foram alteradas. A aplicação precisa de ser reiniciada para aplicar as alterações. Deseja reiniciar agora?'
      },
      apiInfo: {
        title: 'Sobre as Configurações de API',
        steps: [
          'Criar um projeto na Google Cloud Console',
          'Habilitar a API do Blogger',
          'Criar credenciais OAuth 2.0 para aplicação Web',
          'Adicionar {origin} como origem JavaScript autorizada',
          'Adicionar {origin} como URI de redirecionamento'
        ],
        important: 'Importante: Alterações nesta configuração exigirão que inicie sessão novamente.'
      }
    },
    
    common: {
      loading: 'A carregar...',
      error: 'Erro: {message}',
      success: 'Sucesso!',
      confirmDelete: 'Tem a certeza que deseja eliminar isto?',
      yes: 'Sim',
      no: 'Não',
      ok: 'OK',
      cancel: 'Cancelar',
      save: 'Guardar',
      delete: 'Eliminar',
      edit: 'Editar',
      create: 'Criar',
      search: 'Pesquisar...',
      filter: 'Filtrar',
      noResults: 'Nenhum resultado encontrado',
      learnMore: 'Saiba mais',
      selectOption: 'Selecionar...',
      today: 'Hoje',
      yesterday: 'Ontem',
      tomorrow: 'Amanhã',
      timeFormat: 'HH:mm',
      dateFormat: 'DD/MM/YYYY'
    }
  };
  
  export default translations;