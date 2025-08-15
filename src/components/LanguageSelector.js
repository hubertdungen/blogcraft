import React, { useState, useEffect } from 'react';
import i18n, { LOCALES } from '../services/I18nService';
import { t } from '../services/I18nService';

/**
 * Componente para seleção de idioma
 * 
 * Permite ao utilizador alterar o idioma da aplicação
 */
function LanguageSelector() {
  const [currentLocale, setCurrentLocale] = useState(i18n.getLocale());
  
  // Atualizar estado quando o idioma mudar
  useEffect(() => {
    const removeListener = i18n.addListener((locale) => {
      setCurrentLocale(locale);
    });
    
    // Limpar listener quando o componente for desmontado
    return () => removeListener();
  }, []);
  
  // Lidar com a mudança de idioma
  const handleLanguageChange = (e) => {
    const newLocale = e.target.value;
    i18n.setLocale(newLocale);
  };
  
  return (
    <div className="language-selector">
      <select
        value={currentLocale}
        onChange={handleLanguageChange}
        aria-label={t('settings.fields.language')}
      >
        <option value={LOCALES.EN_US} aria-label="English">🇺🇸</option>
        <option value={LOCALES.PT_PT} aria-label="Português">🇵🇹</option>
      </select>
    </div>
  );
}

export default LanguageSelector;