// Config plugin to remove legacy Android Support libs and force AndroidX
// Works in Expo managed workflow on EAS Build.
const { withProjectBuildGradle, withAppBuildGradle } = require('@expo/config-plugins');

function injectSubprojectsExclude(contents) {
  const snippet = `
// Injected by resolve-androidx-conflict plugin
subprojects {
  configurations.all {
    exclude group: 'com.android.support', module: 'support-compat'
    exclude group: 'com.android.support', module: 'support-v4'
    exclude group: 'com.android.support', module: 'support-core-utils'
    exclude group: 'com.android.support', module: 'support-core-ui'
  }
}
`;
  if (!contents.includes('resolve-androidx-conflict')) {
    return contents + '\n' + snippet;
  }
  return contents;
}

function injectAppGradleFixes(contents) {
  const fixes = `
// Injected by resolve-androidx-conflict plugin
configurations.all {
  exclude group: 'com.android.support', module: 'support-compat'
  exclude group: 'com.android.support', module: 'support-v4'
  exclude group: 'com.android.support', module: 'support-core-utils'
  exclude group: 'com.android.support', module: 'support-core-ui'
}

dependencies {
  // Ensure AndroidX core is used and de-duped across the graph
  implementation('androidx.core:core:1.15.0') { force = true }
}
`;
  if (!contents.includes('resolve-androidx-conflict')) {
    return contents + '\n' + fixes;
  }
  return contents;
}

module.exports = function withResolveAndroidXConflict(config) {
  config = withProjectBuildGradle(config, (cfg) => {
    if (cfg.modResults.language === 'groovy') {
      cfg.modResults.contents = injectSubprojectsExclude(cfg.modResults.contents);
    }
    return cfg;
  });

  config = withAppBuildGradle(config, (cfg) => {
    if (cfg.modResults.language === 'groovy') {
      cfg.modResults.contents = injectAppGradleFixes(cfg.modResults.contents);
    }
    return cfg;
  });

  return config;
};
