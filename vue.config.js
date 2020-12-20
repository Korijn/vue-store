const nodeExternals = require('webpack-node-externals');

module.exports = {
  lintOnSave: false,
  configureWebpack: {
    output: {
      libraryExport: 'default',
    },
    externals: [nodeExternals()],
  },
};
