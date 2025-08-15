const { styles } = require('@ckeditor/ckeditor5-dev-utils');

module.exports = function override(config) {
  config.module.rules.push({
    test: /ckeditor5-[^/\\]+[\\/]+theme[\\/].+\.css$/,
    use: [
      { loader: 'style-loader', options: { injectType: 'singletonStyleTag' } },
      { loader: 'css-loader', options: { importLoaders: 1 } },
      {
        loader: 'postcss-loader',
        options: styles.getPostCssConfig({
          themeImporter: {
            themePath: require.resolve('@ckeditor/ckeditor5-theme-lark')
          },
          minify: true
        })
      }
    ]
  });

  return config;
};
