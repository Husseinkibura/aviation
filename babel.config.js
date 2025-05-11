// babel.config.js
module.exports = function(api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      'react-native-reanimated/plugin', // Keep only this plugin
    ],
  };
};


// // babel.config.js

// module.exports = function(api) {
//     api.cache(true);
//     return {
//       presets: ['babel-preset-expo'],
//       plugins: [
//         'expo-router/babel',
//         'react-native-reanimated/plugin',
//       ],
//     };
//   };