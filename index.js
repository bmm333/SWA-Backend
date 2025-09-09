require('@babel/register')({
  presets: [['@babel/preset-env', { targets: { node: 'current' } }]],
  plugins: [
    ['@babel/plugin-proposal-decorators', { legacy: true }],
    ['@babel/plugin-proposal-class-properties', { loose: true }],
    ['@babel/plugin-transform-private-methods', { loose: true }],
    ['@babel/plugin-proposal-private-property-in-object', { loose: true }],
    ['@babel/plugin-transform-runtime', { regenerator: true }]
  ],
  extensions: ['.js', '.jsx', '.ts', '.tsx'],
});

require('reflect-metadata');

process.on('SIGTERM', () => {
  console.log('SIGTERM received in index.js, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received in index.js, shutting down gracefully');
  process.exit(0);
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

try {
  require('./src/main');
  console.log('Application bootstrap started successfully');
} catch (error) {
  console.error('Failed to start application:', error);
  process.exit(1);
}