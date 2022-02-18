const nodeExternals = require('webpack-node-externals');

module.exports = {
  configureWebpack: (config) => {
    if (process.env.NODE_ENV === 'production') {
      // eslint-disable-next-line no-param-reassign
      config.output.libraryExport = 'default';
      // eslint-disable-next-line no-param-reassign
      config.externals = [nodeExternals()];
    }
  },
};
