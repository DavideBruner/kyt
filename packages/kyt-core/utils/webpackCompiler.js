const webpack = require('webpack');
const logger = require('kyt-utils/logger');

module.exports = (webpackConfig, config, cb) => {
  let webpackCompiler;
  const type = webpackConfig.target === 'web' ? 'Client' : 'Server';

  // Compile the webpack config
  try {
    webpackCompiler = webpack(webpackConfig);
    if (config.debug) {
      logger.task(`${type} webpack configuration compiled`);
    }
  } catch (error) {
    logger.error(`${type} webpack config is invalid\n`, error);
    process.exit();
  }

  webpackCompiler.plugin('before-run', (comp, callback) => {
    // Temporarily set the build type in the process.
    // This is used by the babel-preset-kyt-core plugin.
    process.env.KYT_ENV_TYPE = type.toLowerCase();
    callback();
  });

  // Handle errors in webpack build
  webpackCompiler.plugin('done', stats => {
    if (stats.hasErrors()) {
      logger.error(`${type} build failed\n`, stats.toString());
      logger.info('See webpack error above');
    } else if (stats.hasWarnings()) {
      logger.warn(`${type} build warnings`, stats.toJson().warnings.join('\n'));
    } else if (config.debug) {
      logger.task(`${type} build successful`);
    }

    // Remove the build type that we set in the "before-run" hook.
    delete process.env.KYT_ENV_TYPE;

    // Call the callback on successful build
    if (cb) {
      cb(stats);
    }
  });

  // Return the compiler
  return webpackCompiler;
};
