// app.config.js

module.exports = {
    expo: {
      name: "Digital Pilot Logbook",
      slug: "digital-pilot-logbook",
      version: "1.0.0",
      orientation: "portrait",
      icon: "./assets/images/icon.png",
      scheme: "myapp",
      userInterfaceStyle: "automatic",
      splash: {
        image: "./assets/images/splash.png",
        resizeMode: "contain",
        backgroundColor: "#ffffff"
      },
      updates: {
        fallbackToCacheTimeout: 0
      },
      assetBundlePatterns: ["**/*"],
      ios: {
        supportsTablet: true,
        bundleIdentifier: "com.tcaa.pilotlogbook"
      },
      android: {
        adaptiveIcon: {
          foregroundImage: "./assets/images/adaptive-icon.png",
          backgroundColor: "#ffffff"
        },
        package: "com.tcaa.pilotlogbook"
      },
      web: {
        favicon: "./assets/images/favicon.png",
        bundler: "metro"
      },
      extra: {
        apiUrl: "http://192.168.43.217:3000/api" // 👈 your laptop IP
      }
    }
  }
  