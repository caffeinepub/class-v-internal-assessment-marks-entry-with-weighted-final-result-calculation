import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.odisha.classv.assessment',
  appName: 'Class V Assessment',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
    // Allow navigation to Internet Identity domains
    allowNavigation: [
      'https://identity.ic0.app',
      'https://identity.internetcomputer.org',
      '*.ic0.app',
      '*.icp0.io'
    ]
  },
  android: {
    allowMixedContent: false,
    captureInput: true,
    webContentsDebuggingEnabled: true
  }
};

export default config;
