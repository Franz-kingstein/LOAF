const { withPlugins } = require('expo/config-plugins');
const { withBuildProperties } = require('expo-build-properties');

/**
 * Custom Expo config plugin to enforce AndroidX and exclude legacy support libraries
 * This resolves: "Duplicate class android.support.v4.* found in..."
 */
const withAndroidXConfig = (config) => {
  return withBuildProperties(config, {
    android: {
      compileSdkVersion: 36,
      targetSdkVersion: 36,
      minSdkVersion: 24,
      useAndroidX: true,
      enableJetifier: true,
      extraMavenRepos: [
        'https://maven.google.com',
        'https://repo.maven.apache.org/maven2'
      ],
      gradleProperties: {
        'android.useAndroidX': 'true',
        'android.enableJetifier': 'true',
        'android.disableResourceValidation': 'true',
      }
    }
  });
};

module.exports = withAndroidXConfig;
