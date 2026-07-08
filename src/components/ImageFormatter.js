import React, { useState, useEffect } from 'react';
import { t } from '../services/I18nService';
import './ImageFormatter.css';

function ImageFormatter({ editor }) {
  const [selectedImage, setSelectedImage] = useState(null);

  useEffect(() => {
    if (!editor) return;
    const checkSelection = () => {
      const selection = editor.model.document.selection;
      const element = selection.getSelectedElement();
      if (element && (element.name === 'imageBlock' || element.name === 'imageInline')) {
        setSelectedImage(element);
      } else {
        setSelectedImage(null);
      }
    };

    editor.model.document.selection.on('change:range', checkSelection);
    return () => {
      editor.model.document.selection.off('change:range', checkSelection);
    };
  }, [editor]);

  if (!selectedImage) return null;

  const handleStyleChange = (type) => {
    editor.model.change(writer => {
      let currentStyle = selectedImage.getAttribute('style') || '';
      // Remove old object-fit and width
      currentStyle = currentStyle.replace(/object-fit:\s*[^;]+;?/g, '');
      currentStyle = currentStyle.replace(/width:\s*[^;]+;?/g, '');
      
      let newStyle = currentStyle.trim();
      
      if (type === 'fit') {
        newStyle += ' object-fit: contain; width: 100%;';
      } else if (type === 'stretch') {
        newStyle += ' object-fit: fill; width: 100%;';
      } else if (type === 'fill') {
        newStyle += ' object-fit: cover; width: 100%;';
      }

      if (newStyle.trim()) {
        writer.setAttribute('style', newStyle.trim(), selectedImage);
      } else {
        writer.removeAttribute('style', selectedImage);
      }
    });
  };

  return (
    <div className="image-formatter-panel">
      <h4>{t('editor.imageFormat.title', 'Image Properties')}</h4>
      <div className="formatter-buttons">
        <button onClick={() => handleStyleChange('standard')}>{t('editor.imageFormat.standard', 'Standard Size')}</button>
        <button onClick={() => handleStyleChange('fit')}>{t('editor.imageFormat.fit', 'Inside Fit (Contain)')}</button>
        <button onClick={() => handleStyleChange('fill')}>{t('editor.imageFormat.fill', 'Fill Area (Cover)')}</button>
        <button onClick={() => handleStyleChange('stretch')}>{t('editor.imageFormat.stretch', 'Stretch')}</button>
      </div>
    </div>
  );
}

export default ImageFormatter;
