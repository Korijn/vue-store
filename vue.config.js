const nodeExternals = require('webpack-node-externals');

module.exports = {
  lintOnSave: false,
  configureWebpack: {
    output: {
      libraryExport: 'default',
    },
    externals: [nodeExternals()],
  },
  chainWebpack: (config) => {
    config.module
      .rule('vue')
      .use('vue-loader')
      .tap((options) => {
        // eslint-disable-next-line no-param-reassign
        options.isServerBuild = false;
        return options;
      });
  },
};
