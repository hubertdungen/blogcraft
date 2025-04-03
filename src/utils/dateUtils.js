/**
 * Utilitários para manipulação de datas
 */

/**
 * Formata uma data para exibição
 * @param {string|Date} date - Data para formatar
 * @param {string} locale - Localidade para formatação (pt-BR, en-US, etc)
 * @param {Object} options - Opções adicionais de formatação
 * @returns {string} Data formatada
 */
export const formatDate = (date, locale = 'pt-BR', options = {}) => {
    if (!date) return '';
    
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    
    const defaultOptions = {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      ...options
    };
    
    return dateObj.toLocaleDateString(locale, defaultOptions);
  };
  
  /**
   * Formata uma data mostrando apenas a data (sem hora)
   * @param {string|Date} date - Data para formatar
   * @param {string} locale - Localidade para formatação (pt-BR, en-US, etc)
   * @returns {string} Data formatada
   */
  export const formatDateOnly = (date, locale = 'pt-BR') => {
    return formatDate(date, locale, {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: undefined,
      minute: undefined
    });
  };
  
  /**
   * Formata uma data mostrando apenas a hora (sem data)
   * @param {string|Date} date - Data para formatar
   * @param {string} locale - Localidade para formatação (pt-BR, en-US, etc)
   * @returns {string} Hora formatada
   */
  export const formatTimeOnly = (date, locale = 'pt-BR') => {
    if (!date) return '';
    
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    
    return dateObj.toLocaleTimeString(locale, {
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
  
  /**
   * Verifica se uma data está no passado
   * @param {string|Date} date - Data para verificar
   * @returns {boolean} True se a data estiver no passado
   */
  export const isPastDate = (date) => {
    if (!date) return false;
    
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    const now = new Date();
    
    return dateObj < now;
  };
  
  /**
   * Formata um intervalo de tempo relativo (ex: "há 5 minutos", "em 3 dias")
   * @param {string|Date} date - Data para formatar
   * @param {string} locale - Localidade para formatação (pt-BR, en-US, etc)
   * @returns {string} Tempo relativo formatado
   */
  export const formatRelativeTime = (date, locale = 'pt-BR') => {
    if (!date) return '';
    
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    const now = new Date();
    const diffMs = dateObj - now;
    const diffSec = Math.round(diffMs / 1000);
    const diffMin = Math.round(diffSec / 60);
    const diffHour = Math.round(diffMin / 60);
    const diffDay = Math.round(diffHour / 24);
    
    // Textos para cada localidade
    const texts = {
      'pt-BR': {
        now: 'agora',
        past: {
          seconds: (n) => `há ${n} segundo${n !== 1 ? 's' : ''}`,
          minutes: (n) => `há ${n} minuto${n !== 1 ? 's' : ''}`,
          hours: (n) => `há ${n} hora${n !== 1 ? 's' : ''}`,
          days: (n) => `há ${n} dia${n !== 1 ? 's' : ''}`
        },
        future: {
          seconds: (n) => `em ${n} segundo${n !== 1 ? 's' : ''}`,
          minutes: (n) => `em ${n} minuto${n !== 1 ? 's' : ''}`,
          hours: (n) => `em ${n} hora${n !== 1 ? 's' : ''}`,
          days: (n) => `em ${n} dia${n !== 1 ? 's' : ''}`
        }
      },
      'en-US': {
        now: 'now',
        past: {
          seconds: (n) => `${n} second${n !== 1 ? 's' : ''} ago`,
          minutes: (n) => `${n} minute${n !== 1 ? 's' : ''} ago`,
          hours: (n) => `${n} hour${n !== 1 ? 's' : ''} ago`,
          days: (n) => `${n} day${n !== 1 ? 's' : ''} ago`
        },
        future: {
          seconds: (n) => `in ${n} second${n !== 1 ? 's' : ''}`,
          minutes: (n) => `in ${n} minute${n !== 1 ? 's' : ''}`,
          hours: (n) => `in ${n} hour${n !== 1 ? 's' : ''}`,
          days: (n) => `in ${n} day${n !== 1 ? 's' : ''}`
        }
      }
    };
    
    // Usar localidade padrão se a solicitada não estiver disponível
    const t = texts[locale] || texts['en-US'];
    
    // Formatação baseada na diferença de tempo
    if (Math.abs(diffSec) < 60) {
      if (Math.abs(diffSec) < 10) return t.now;
      return diffSec >= 0 ? t.future.seconds(diffSec) : t.past.seconds(Math.abs(diffSec));
    } else if (Math.abs(diffMin) < 60) {
      return diffMin >= 0 ? t.future.minutes(diffMin) : t.past.minutes(Math.abs(diffMin));
    } else if (Math.abs(diffHour) < 24) {
      return diffHour >= 0 ? t.future.hours(diffHour) : t.past.hours(Math.abs(diffHour));
    } else {
      return diffDay >= 0 ? t.future.days(diffDay) : t.past.days(Math.abs(diffDay));
    }
  };
  
  /**
   * Adiciona dias a uma data
   * @param {string|Date} date - Data base
   * @param {number} days - Número de dias a adicionar
   * @returns {Date} Nova data
   */
  export const addDays = (date, days) => {
    const dateObj = typeof date === 'string' ? new Date(date) : new Date(date);
    dateObj.setDate(dateObj.getDate() + days);
    return dateObj;
  };
  
  /**
   * Obtém o primeiro dia do mês
   * @param {string|Date} date - Data de referência
   * @returns {Date} Primeiro dia do mês
   */
  export const getFirstDayOfMonth = (date) => {
    const dateObj = typeof date === 'string' ? new Date(date) : new Date(date);
    return new Date(dateObj.getFullYear(), dateObj.getMonth(), 1);
  };
  
  /**
   * Obtém o último dia do mês
   * @param {string|Date} date - Data de referência
   * @returns {Date} Último dia do mês
   */
  export const getLastDayOfMonth = (date) => {
    const dateObj = typeof date === 'string' ? new Date(date) : new Date(date);
    return new Date(dateObj.getFullYear(), dateObj.getMonth() + 1, 0);
  };