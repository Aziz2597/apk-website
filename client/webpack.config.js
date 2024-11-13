// webpack.config.js

const path = require('path');

module.exports = {
  // Your existing webpack configuration

  resolve: {
    fallback: {
      crypto: require.resolve('crypto-browserify'),
    },
  },
};
