const { withBuildProperties, withGradleProperties } = require('expo-build-properties');

/**
 * Custom Expo config plugin to enforce AndroidX and exclude legacy support libraries
 * This resolves: "Duplicate class android.support.v4.* found in..."
 */
const withAndroidXConfig = (config) => {
  // Step 1: Force gradle.properties settings
  config = withGradleProperties(config, (props) => {
    props.android = {
      ...props.android,
      'android.useAndroidX': 'true',
      'android.enableJetifier': 'true',
    };
    return props;
  });

  // Step 2: Add build.gradle exclusions and forced dependencies
  config = withBuildProperties(config, (props) => {
    props.android = {
      ...props.android,
      compileSdkVersion: 36,
      targetSdkVersion: 36,
      minSdkVersion: 24,
      // Force exclusion of support-compat across all dependencies
      extraMavenRepos: ['https://maven.google.com', 'https://repo.maven.apache.org/maven2'],
    };
    return props;
  });

  // Step 3: Inject custom Gradle configuration via app/build.gradle modifications
  const { withAppBuildGradle } = require('expo-build-properties');
  config = withAppBuildGradle(config, async (props) => {
    if (props.modResults.language === 'groovy') {
      const buildGradle = props.modResults.contents;
      
      // Inject dependency exclusion rules in the dependencies block
      const exclusionRule = `
dependencies {
    configurations.all {
        resolutionStrategy.force 'androidx.core:core:1.15.0'
        exclude group: 'com.android.support', module: 'support-compat'
        exclude group: 'com.android.support', module: 'support-core-utils'
        exclude group: 'com.android.support', module: 'support-core-ui'
    }
`;
      
      if (!buildGradle.includes('resolutionStrategy.force')) {
        props.modResults.contents = buildGradle.replace(
          'dependencies {',
          exclusionRule
        );
      }
    }
    return props;
  });

  return config;
};

module.exports = withAndroidXConfig;
