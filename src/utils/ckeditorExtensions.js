/**
 * Runtime extensions for the prebuilt CKEditor 5 classic build.
 *
 * The classic build does not ship an upload adapter nor image resize
 * support. These lightweight plugins close both gaps so that:
 * - users can insert images from disk (embedded as base64 data URLs);
 * - width/height attributes on images survive editing (needed so the
 *   AI assistant – and imported content – can size images).
 */

/**
 * Upload adapter that inlines picked files as base64 data URLs.
 * Blogger accepts data URLs in post HTML, and this keeps BlogCraft
 * free of any server-side upload dependency.
 */
class Base64UploadAdapter {
  constructor(loader) {
    this.loader = loader;
    this.reader = null;
  }

  upload() {
    return this.loader.file.then(file => new Promise((resolve, reject) => {
      const reader = new FileReader();
      this.reader = reader;

      reader.onload = () => resolve({ default: reader.result });
      reader.onerror = error => reject(error);
      reader.onabort = () => reject(new Error('Upload aborted'));

      reader.readAsDataURL(file);
    }));
  }

  abort() {
    if (this.reader) {
      this.reader.abort();
    }
  }
}

export function Base64UploadAdapterPlugin(editor) {
  editor.plugins.get('FileRepository').createUploadAdapter = loader => new Base64UploadAdapter(loader);
}

const SIZE_ATTRIBUTES = ['width', 'height'];
const IMAGE_MODELS = ['imageBlock', 'imageInline'];

/**
 * Preserves width/height attributes on <img> elements. Without this the
 * classic build's schema silently strips them on load/paste, which would
 * undo any image resizing done by the AI assistant.
 */
export function ImageSizeAttributesPlugin(editor) {
  // Function plugins are constructed before the built-in features run
  // their init(), i.e. before `imageBlock`/`imageInline` exist in the
  // schema. Defer the setup until right before the first data load.
  editor.data.on('init', () => setupImageSizeAttributes(editor), { priority: 'high' });
}

function setupImageSizeAttributes(editor) {
  const schema = editor.model.schema;

  for (const model of IMAGE_MODELS) {
    if (schema.isRegistered(model)) {
      schema.extend(model, { allowAttributes: SIZE_ATTRIBUTES });
    }
  }

  editor.conversion.for('upcast').add(dispatcher => {
    const copySizeAttributes = (data, conversionApi, viewImage) => {
      if (!data.modelRange || !viewImage) return;

      const modelImage = data.modelRange.start.nodeAfter || data.modelRange.start.parent;
      if (!modelImage || !IMAGE_MODELS.includes(modelImage.name)) return;

      for (const attribute of SIZE_ATTRIBUTES) {
        const value = viewImage.getAttribute(attribute);
        if (value && conversionApi.schema.checkAttribute(modelImage, attribute)) {
          conversionApi.writer.setAttribute(attribute, value, modelImage);
        }
      }
    };

    // Inline images: <img> converts directly to imageInline.
    dispatcher.on('element:img', (evt, data, conversionApi) => {
      copySizeAttributes(data, conversionApi, data.viewItem);
    }, { priority: 'low' });

    // Block images: <figure class="image"><img ...></figure> converts to
    // imageBlock on the figure event; the img child carries the size.
    dispatcher.on('element:figure', (evt, data, conversionApi) => {
      copySizeAttributes(data, conversionApi, findViewImage(data.viewItem));
    }, { priority: 'low' });
  });

  editor.conversion.for('downcast').add(dispatcher => {
    for (const attribute of SIZE_ATTRIBUTES) {
      for (const model of IMAGE_MODELS) {
        dispatcher.on(`attribute:${attribute}:${model}`, (evt, data, conversionApi) => {
          if (!conversionApi.consumable.consume(data.item, evt.name)) return;

          const viewElement = conversionApi.mapper.toViewElement(data.item);
          if (!viewElement) return;

          // For block images the mapped view element is the <figure>; the
          // attribute belongs on the <img> inside it.
          const viewImage = viewElement.is('element', 'img')
            ? viewElement
            : findViewImage(viewElement);
          if (!viewImage) return;

          if (data.attributeNewValue !== null && data.attributeNewValue !== undefined) {
            conversionApi.writer.setAttribute(attribute, data.attributeNewValue, viewImage);
          } else {
            conversionApi.writer.removeAttribute(attribute, viewImage);
          }
        });
      }
    }
  });
}

function findViewImage(viewElement) {
  for (const child of viewElement.getChildren()) {
    if (child.is && child.is('element', 'img')) {
      return child;
    }
    if (child.is && child.is('element')) {
      const nested = findViewImage(child);
      if (nested) return nested;
    }
  }
  return null;
}

/**
 * Toolbar limited to features that actually exist in the classic build.
 * (The previous configuration listed plugins that are not bundled, which
 * produced console warnings and buttons that never appeared.)
 */
export const EDITOR_TOOLBAR = [
  'heading',
  '|',
  'bold', 'italic',
  '|',
  'link', 'bulletedList', 'numberedList',
  '|',
  'outdent', 'indent',
  '|',
  'imageUpload', 'blockQuote', 'insertTable', 'mediaEmbed',
  '|',
  'undo', 'redo'
];

export const EDITOR_IMAGE_CONFIG = {
  toolbar: [
    'imageStyle:alignLeft',
    'imageStyle:alignCenter',
    'imageStyle:alignRight',
    'imageStyle:side',
    '|',
    'toggleImageCaption',
    'imageTextAlternative'
  ]
};

export const EDITOR_TABLE_CONFIG = {
  contentToolbar: ['tableColumn', 'tableRow', 'mergeTableCells']
};
