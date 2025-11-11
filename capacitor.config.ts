import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.mangareader.app',
  appName: 'مانجا ريدر',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  }
};

export default config;
