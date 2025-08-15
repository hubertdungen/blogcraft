import ClassicEditorBase from '@ckeditor/ckeditor5-build-classic';
import Alignment from '@ckeditor/ckeditor5-alignment/src/alignment';
import ImageResize from '@ckeditor/ckeditor5-image/src/imageresize';
import Plugin from '@ckeditor/ckeditor5-core/src/plugin';

class ImageCompress extends Plugin {
  init() {
    const { editor } = this;
    editor.plugins.get('FileRepository').createUploadAdapter = loader => new CompressAdapter(loader);
  }
}

class CompressAdapter {
  constructor(loader) {
    this.loader = loader;
  }

  async upload() {
    const file = await this.loader.file;
    const data = await compressImage(file);
    return { default: data };
  }

  abort() {}
}

function compressImage(file, quality = 0.7) {
  return new Promise(resolve => {
    const reader = new FileReader();
    reader.onload = evt => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);
        const dataUrl = canvas.toDataURL('image/jpeg', quality);
        resolve(dataUrl);
      };
      img.src = evt.target.result;
    };
    reader.readAsDataURL(file);
  });
}

export default class Editor extends ClassicEditorBase {}

Editor.builtinPlugins = [
  ...ClassicEditorBase.builtinPlugins,
  Alignment,
  ImageResize,
  ImageCompress
];
