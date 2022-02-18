const nodeExternals = require('webpack-node-externals');

module.exports = {
  configureWebpack: config => {
    if (process.env.NODE_ENV === 'production') {
      config.output.libraryExport = 'default';
      config.externals = [nodeExternals()];
    }
  }
};
