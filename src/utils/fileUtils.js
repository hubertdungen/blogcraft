/**
 * Utilitários para manipulação de arquivos
 */

/**
 * Extrai nome e extensão de um arquivo
 * @param {string} filename - Nome do arquivo
 * @returns {Object} Objeto contendo nome e extensão
 */
export const parseFileName = (filename) => {
    if (!filename) return { name: '', extension: '' };
    
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
    if (!filename || !supportedExtensions || !supportedExtensions.length) {
      return false;
    }
    
    const { extension } = parseFileName(filename);
    
    return supportedExtensions.includes(extension);
  };
  
  /**
   * Obtém o tipo MIME com base na extensão do arquivo
   * @param {string} filename - Nome do arquivo
   * @returns {string} Tipo MIME do arquivo
   */
  export const getMimeType = (filename) => {
    const { extension } = parseFileName(filename);
    
    const mimeTypes = {
      'txt': 'text/plain',
      'html': 'text/html',
      'htm': 'text/html',
      'css': 'text/css',
      'csv': 'text/csv',
      'js': 'application/javascript',
      'json': 'application/json',
      'jpg': 'image/jpeg',
      'jpeg': 'image/jpeg',
      'png': 'image/png',
      'gif': 'image/gif',
      'svg': 'image/svg+xml',
      'webp': 'image/webp',
      'pdf': 'application/pdf',
      'doc': 'application/msword',
      'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'xls': 'application/vnd.ms-excel',
      'xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'ppt': 'application/vnd.ms-powerpoint',
      'pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'zip': 'application/zip',
      'rar': 'application/x-rar-compressed',
      'mp3': 'audio/mpeg',
      'mp4': 'video/mp4',
      'wav': 'audio/wav',
      'xml': 'application/xml',
      'rtf': 'application/rtf'
    };
    
    return mimeTypes[extension] || 'application/octet-stream';
  };
  
  /**
   * Formata o tamanho do arquivo para exibição
   * @param {number} bytes - Tamanho do arquivo em bytes
   * @param {number} decimals - Número de casas decimais
   * @param {string} locale - Localidade para formatação (pt-BR, en-US, etc)
   * @returns {string} Tamanho formatado (ex: "1.5 MB")
   */
  export const formatFileSize = (bytes, decimals = 2, locale = 'pt-BR') => {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = {
      'pt-BR': ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'],
      'en-US': ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']
    };
    
    const sizeLabels = sizes[locale] || sizes['en-US'];
    
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizeLabels[i];
  };
  
  /**
   * Converte um Blob ou File para uma URL de dados (base64)
   * @param {Blob|File} file - Arquivo para converter
   * @returns {Promise<string>} URL de dados
   */
  export const fileToDataURL = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
      
      reader.readAsDataURL(file);
    });
  };
  
  /**
   * Converte um Blob ou File para texto
   * @param {Blob|File} file - Arquivo para converter
   * @returns {Promise<string>} Conteúdo do arquivo como texto
   */
  export const fileToText = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
      
      reader.readAsText(file);
    });
  };
  
  /**
   * Faz o download de um arquivo
   * @param {Blob|string} content - Conteúdo do arquivo (Blob ou string)
   * @param {string} filename - Nome do arquivo
   * @param {string} mimeType - Tipo MIME (opcional, detectado automaticamente se não fornecido)
   */
  export const downloadFile = (content, filename, mimeType) => {
    // Determinar o MIME Type
    const detectedMimeType = mimeType || getMimeType(filename);
    
    // Criar um Blob se o conteúdo for uma string
    const blob = typeof content === 'string'
      ? new Blob([content], { type: detectedMimeType })
      : content;
    
    // Criar URL para o Blob
    const url = URL.createObjectURL(blob);
    
    // Criar elemento de link
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    
    // Adicionar ao documento, clicar e remover
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Limpar a URL do objeto
    setTimeout(() => URL.revokeObjectURL(url), 100);
  };