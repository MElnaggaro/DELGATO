module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      ['babel-preset-expo', { jsxImportSource: 'nativewind' }],
      'nativewind/babel',
    ],
    plugins: [
      [
        'module-resolver',
        {
          root: ['./'],
          alias: {
            '@/app': './app',
            '@/features': './src/features',
            '@/shared': './src/shared',
            '@/services': './src/services',
            '@/domain': './src/domain',
            '@/infrastructure': './src/infrastructure',
          },
        },
      ],
      'react-native-reanimated/plugin',
    ],
  };
};
