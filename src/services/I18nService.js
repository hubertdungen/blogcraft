/**
 * Serviço de Internacionalização (i18n)
 * 
 * Gerencia traduções e localização para múltiplos idiomas.
 */

// Importar arquivos de tradução
import ptPT from '../locales/pt-PT';
import enUS from '../locales/en-US';

// Constantes para os códigos de idioma
export const LOCALES = {
  PT_PT: 'pt-PT',
  EN_US: 'en-US'
};

// Mapeamento de traduções
const translations = {
  [LOCALES.PT_PT]: ptPT,
  [LOCALES.EN_US]: enUS
};

// Idioma padrão
const DEFAULT_LOCALE = LOCALES.EN_US;

/**
 * Classe de serviço de internacionalização
 */
class I18nService {
  constructor() {
    // Obter o idioma salvo ou usar o padrão
    this.currentLocale = localStorage.getItem('blogcraft_locale') || DEFAULT_LOCALE;
    
    // Registrar listeners para eventos de mudança de idioma
    this.listeners = [];
  }
  
  /**
   * Obtém o idioma atual
   * @returns {string} Código do idioma atual
   */
  getLocale() {
    return this.currentLocale;
  }
  
  /**
   * Define o idioma atual
   * @param {string} locale - Código do idioma
   */
  setLocale(locale) {
    if (!translations[locale]) {
      console.warn(`Idioma não suportado: ${locale}. Usando o idioma padrão.`);
      locale = DEFAULT_LOCALE;
    }
    
    this.currentLocale = locale;
    localStorage.setItem('blogcraft_locale', locale);
    
    // Notificar listeners sobre a mudança de idioma
    this.notifyListeners();
  }
  
  /**
   * Adiciona um listener para mudanças de idioma
   * @param {Function} listener - Função a ser chamada quando o idioma mudar
   * @returns {Function} Função para remover o listener
   */
  addListener(listener) {
    this.listeners.push(listener);
    
    // Retornar função para remover o listener
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }
  
  /**
   * Notifica todos os listeners sobre uma mudança de idioma
   */
  notifyListeners() {
    this.listeners.forEach(listener => listener(this.currentLocale));
  }
  
  /**
   * Traduz uma chave para o idioma atual
   * @param {string} key - Chave de tradução
   * @param {Object} params - Parâmetros para interpolação
   * @returns {string} Texto traduzido
   */
  translate(key, params = {}) {
    const keys = key.split('.');
    let value = translations[this.currentLocale];
    
    // Navegar pela estrutura de objetos usando as chaves
    for (const k of keys) {
      if (!value || typeof value !== 'object') {
        // Fallback para o idioma padrão
        value = this._getFromDefaultLocale(key);
        break;
      }
      
      value = value[k];
    }
    
    // Se não encontrou a tradução, procurar no idioma padrão
    if (value === undefined || value === null) {
      value = this._getFromDefaultLocale(key);
    }
    
    // Se ainda não encontrou, retornar a chave
    if (value === undefined || value === null) {
      return key;
    }
    
    // Interpolar parâmetros na string
    if (typeof value === 'string') {
      return this._interpolate(value, params);
    }

    // Retornar arrays ou objetos como estão
    return value;
  }
  
  /**
   * Obtém uma tradução do idioma padrão
   * @param {string} key - Chave de tradução
   * @returns {string|null} Texto traduzido ou null se não encontrado
   * @private
   */
  _getFromDefaultLocale(key) {
    if (this.currentLocale === DEFAULT_LOCALE) {
      return null;
    }
    
    const keys = key.split('.');
    let value = translations[DEFAULT_LOCALE];
    
    for (const k of keys) {
      if (!value || typeof value !== 'object') {
        return null;
      }
      
      value = value[k];
    }
    
    return value;
  }
  
  /**
   * Interpola parâmetros em uma string de tradução
   * @param {string} text - Texto com placeholders
   * @param {Object} params - Parâmetros para interpolação
   * @returns {string} Texto com parâmetros interpolados
   * @private
   */
  _interpolate(text, params) {
    return text.replace(/\{(\w+)\}/g, (match, key) => {
      return params[key] !== undefined ? params[key] : match;
    });
  }
}

// Criar e exportar uma instância do serviço
const i18n = new I18nService();

// Função auxiliar para tradução
export const t = (key, params) => i18n.translate(key, params);

export default i18n;