import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.chinpoem.app',
  appName: '唐诗译境',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  }
};

export default config; 