/**
 * Translations for English (en-US)
 */
const translations = {
    app: {
      name: 'BlogCraft',
      slogan: 'Advanced Editor for Blogger',
      version: 'Version {version}'
    },
    
    auth: {
      login: 'Login',
      loginWithGoogle: 'Continue with Google',
      logout: 'Logout',
      loggingIn: 'Logging in...',
      confirmLogout: 'Are you sure you want to log out? Your local data will be preserved.',
      loginError: 'Authentication failed: {message}'
    },
    
    nav: {
      dashboard: 'Dashboard',
      editor: 'New Post',
      templates: 'Templates',
      settings: 'Settings'
    },
    
    dashboard: {
      welcome: 'Welcome to BlogCraft!',
      welcomeSubtitle: 'Your advanced editor for Blogger.',
      quickActions: 'Quick Actions',
      createNew: 'Create New Post',
      manageTemplates: 'Manage Templates',
      yourBlogs: 'Your Blogs',
      loadingBlogs: 'Loading blogs...',
      noBlogs: 'No blogs found. Make sure you have access to blogs on Blogger.',
      selectBlog: 'Select Blog:',
      stats: {
        publishedPosts: 'Published Posts',
        drafts: 'Drafts',
        scheduled: 'Scheduled',
        postsByMonth: 'Posts by Month'
      },
      posts: {
        recentPosts: 'Recent Posts',
        noPosts: 'No posts found.',
        createFirst: 'Create First Post',
        status: {
          published: 'Published',
          draft: 'Draft',
          scheduled: 'Scheduled'
        },
        dates: {
          publishedOn: 'Published on: {date}',
          updatedOn: 'Updated on: {date}',
          scheduledFor: 'Scheduled for: {date}'
        },
        actions: {
          edit: 'Edit',
          duplicate: 'Duplicate',
          delete: 'Delete',
          view: 'View',
          confirmDelete: 'Are you sure you want to delete this post? This action cannot be undone.'
        }
      }
    },
    
    editor: {
      title: 'Post Editor',
      placeholders: {
        title: 'Post title',
        tags: 'Example: technology, tutorial, tips'
      },
      labels: {
        blog: 'Blog:',
        title: 'Title:',
        tags: 'Tags (comma separated):',
        template: 'Template:',
        schedule: 'Schedule publication',
        draft: 'Save as draft',
        metadata: 'Edit Metadata'
      },
      buttons: {
        saveDraft: 'Save Draft',
        publish: 'Publish',
        schedule: 'Schedule',
        saveTemplate: 'Save as Template',
        showMetadata: 'Edit Metadata',
        hideMetadata: 'Hide Metadata',
        exportWord: 'Export as Word',
        importFile: 'Import File'
      },
      templates: {
        select: 'Select template',
        none: 'None',
        templateName: 'Template name:'
      },
      metadata: {
        title: 'Metadata',
        description: 'Description (SEO):',
        descriptionPlaceholder: 'Brief description of the post for search engines',
        author: 'Author:',
        authorPlaceholder: 'Author name',
        keywords: 'Keywords (SEO):',
        keywordsPlaceholder: 'Keywords separated by commas'
      },
      saving: {
        saving: 'Saving...',
        saved: 'Saved successfully!',
        error: 'Error saving: {message}',
        autoSave: 'Auto-saved at {time}'
      },
      notifications: {
        draftSaved: 'Draft saved successfully!',
        published: 'Post published successfully!',
        scheduled: 'Post scheduled successfully!',
        error: 'An error occurred: {message}'
      }
    },
    
    templates: {
      title: 'Template Manager',
      createNew: 'Create New Template',
      exportAll: 'Export All',
      importTemplates: 'Import Templates',
      availableTemplates: 'Available Templates ({count})',
      noTemplates: 'No templates available.',
      createOrImport: 'Create a new template or import existing templates.',
      selectToEdit: 'Select a template to edit',
      orCreateNew: 'Or click "Create New Template" to start a new one.',
      templateName: 'Template Name:',
      templateDescription: 'Description (optional):',
      templateContent: 'Template Content:',
      actions: {
        save: 'Save Template',
        cancel: 'Cancel',
        use: 'Use',
        export: 'Export',
        delete: 'Delete',
        confirmDelete: 'Are you sure you want to delete this template? This action cannot be undone.'
      },
      tips: {
        title: 'Template Tips',
        items: [
          'Create templates for specific types of posts (reviews, tutorials, news, etc.)',
          'Include placeholders for content you regularly add',
          'Use consistent styles to maintain your blog\'s visual identity',
          'Export your favorite templates to share with other users'
        ]
      },
      importDialog: {
        importSuccess: 'Import completed! {count} templates imported.',
        importError: 'Error importing templates: {message}',
        replaceOrMerge: 'Import {count} templates. Do you want to replace all existing templates?',
        replaceConfirm: 'OK to replace or Cancel to merge with existing templates.',
        conflictDetected: '{count} templates have conflicting IDs.',
        conflictAction: 'Do you want to overwrite existing templates with the same ID?',
        conflictConfirm: 'OK to overwrite or Cancel to keep existing templates.'
      }
    },
    
    settings: {
      title: 'Settings',
      sections: {
        general: 'General Preferences',
        autoSave: 'Auto-Save',
        security: 'Security',
          appearance: 'Appearance',
          api: 'API Settings',
          dataManagement: 'Data Management',
          debug: 'Debugging'
        },
        fields: {
        defaultBlog: 'Default Blog:',
        defaultBlogDesc: 'Blog selected by default when creating a new post.',
        defaultTemplate: 'Default Template:',
        defaultTemplateDesc: 'Template loaded automatically when creating a new post.',
        publishStatus: 'Default Publish Status:',
        publishStatusDesc: 'Default status when saving posts.',
        autoSaveInterval: 'Auto-Save Interval (minutes):',
        autoSaveIntervalDesc: 'Time interval for auto-saving drafts.',
        autoBackup: 'Auto-Backup Drafts',
        autoBackupDesc: 'Creates local backup copies of your drafts.',
        confirmDelete: 'Confirm before deleting',
        confirmDeleteDesc: 'Asks for confirmation before deleting posts or templates.',
        theme: 'Theme:',
        themeLight: 'Light',
        themeDark: 'Dark',
        themeDesc: 'Choose between light or dark theme for the interface.',
        wideLayout: 'Enable wide content area',
        wideLayoutDesc: 'Expands content width for more editing space.',
        alignment: 'Content alignment:',
        alignLeft: 'Left',
        alignCenter: 'Center',
        alignRight: 'Right',
        alignmentDesc: 'Choose how the content area is aligned relative to the sidebar.',
        language: 'Language:',
        languageDesc: 'Application interface language.',
        customClientId: 'Use custom Client ID',
        customClientIdDesc: 'Enable this option to use a custom Google Client ID instead of the default one.',
        clientId: 'Google Client ID:',
        clientIdDesc: 'Enter the Client ID obtained from Google Cloud Console.',
        showDebugger: 'Show Debugger Window',
        showDebuggerDesc: 'Display authentication debugger overlay.'
        },
      buttons: {
        save: 'Save Settings',
        reset: 'Restore Default Settings',
        clearData: 'Clear All Local Data',
        logout: 'Logout'
      },
      confirmations: {
        saveSuccess: 'Settings saved successfully!',
        resetConfirm: 'Are you sure you want to restore default settings? This action cannot be undone.',
        clearDataConfirm: 'WARNING: This will delete all your local data, including templates and settings. This action cannot be undone. Do you want to continue?',
        apiChanged: 'API settings have been changed. The application needs to restart to apply the changes. Do you want to restart now?'
      },
      apiInfo: {
        title: 'About API Settings',
        steps: [
          'Create a project in Google Cloud Console',
          'Enable the Blogger API',
          'Create OAuth 2.0 credentials for Web application',
          'Add {origin} as authorized JavaScript origin',
          'Add {origin} as redirect URI'
        ],
        important: 'Important: Changes to this configuration will require you to log in again.'
      }
    },
    
    common: {
      loading: 'Loading...',
      error: 'Error: {message}',
      success: 'Success!',
      confirmDelete: 'Are you sure you want to delete this?',
      yes: 'Yes',
      no: 'No',
      ok: 'OK',
      cancel: 'Cancel',
      save: 'Save',
      delete: 'Delete',
      edit: 'Edit',
      create: 'Create',
      search: 'Search...',
      filter: 'Filter',
      noResults: 'No results found',
      learnMore: 'Learn more',
      selectOption: 'Select...',
      today: 'Today',
      yesterday: 'Yesterday',
      tomorrow: 'Tomorrow',
      timeFormat: 'h:mm A',
      dateFormat: 'MM/DD/YYYY'
    }
  };
  
  export default translations;