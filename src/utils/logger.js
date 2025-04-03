/**
 * Logger utilitário para facilitar depuração
 * 
 * Permite habilitar/desabilitar logs por tipo e
 * adiciona contexto aos logs para melhor identificação.
 */

// Definir níveis de log
const LOG_LEVELS = {
    DEBUG: 'debug',
    INFO: 'info',
    WARN: 'warn',
    ERROR: 'error'
  };
  
  // Configuração de quais logs estão habilitados
  const enabledLogs = {
    [LOG_LEVELS.DEBUG]: true, // Desative em produção!
    [LOG_LEVELS.INFO]: true,
    [LOG_LEVELS.WARN]: true,
    [LOG_LEVELS.ERROR]: true
  };
  
  // Cores para os diferentes níveis de log
  const logColors = {
    [LOG_LEVELS.DEBUG]: '#7986cb', // Azul claro
    [LOG_LEVELS.INFO]: '#4caf50',  // Verde
    [LOG_LEVELS.WARN]: '#ff9800',  // Laranja
    [LOG_LEVELS.ERROR]: '#f44336'  // Vermelho
  };
  
  /**
   * Cria uma instância de logger
   * @param {string} context - Contexto/módulo do logger
   * @returns {Object} - Métodos de log
   */
  function createLogger(context) {
    /**
     * Função genérica para log
     * @param {string} level - Nível do log
     * @param {string} message - Mensagem a ser logada
     * @param {any} data - Dados adicionais
     */
    const log = (level, message, data) => {
      if (!enabledLogs[level]) return;
      
      const timestamp = new Date().toISOString().split('T')[1].split('.')[0];
      const prefix = `[${timestamp}][${context}]`;
      
      // Estilizar no console
      const style = `color: ${logColors[level]}; font-weight: bold;`;
      
      switch (level) {
        case LOG_LEVELS.DEBUG:
          console.debug(`%c${prefix} ${message}`, style, data);
          break;
        case LOG_LEVELS.INFO:
          console.info(`%c${prefix} ${message}`, style, data);
          break;
        case LOG_LEVELS.WARN:
          console.warn(`%c${prefix} ${message}`, style, data);
          break;
        case LOG_LEVELS.ERROR:
          console.error(`%c${prefix} ${message}`, style, data);
          break;
        default:
          console.log(`%c${prefix} ${message}`, style, data);
      }
    };
    
    return {
      debug: (message, data) => log(LOG_LEVELS.DEBUG, message, data),
      info: (message, data) => log(LOG_LEVELS.INFO, message, data),
      warn: (message, data) => log(LOG_LEVELS.WARN, message, data),
      error: (message, data) => log(LOG_LEVELS.ERROR, message, data)
    };
  }
  
  /**
   * Ativa ou desativa todos os logs
   * @param {boolean} enabled - Se os logs devem estar habilitados
   */
  function setLoggingEnabled(enabled) {
    Object.keys(enabledLogs).forEach(level => {
      enabledLogs[level] = enabled;
    });
  }
  
  /**
   * Ativa ou desativa logs de um nível específico
   * @param {string} level - Nível do log (debug, info, warn, error)
   * @param {boolean} enabled - Se o nível deve estar habilitado
   */
  function setLevelEnabled(level, enabled) {
    if (enabledLogs.hasOwnProperty(level)) {
      enabledLogs[level] = enabled;
    }
  }
  
  // Exportar funções e constantes
  export { 
    createLogger, 
    LOG_LEVELS,
    setLoggingEnabled,
    setLevelEnabled
  };