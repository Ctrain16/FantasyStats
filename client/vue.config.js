module.exports = {
  devServer: {
    proxy: {
      '^/api': {
        target: 'http://localhost:3001',
        changeOrigin: true
      }
    }
  },
  chainWebpack: config => {
    config.plugin('html').tap(args => {
      args[0].title = 'CMT Stats';
      return args;
    });
  }
};
