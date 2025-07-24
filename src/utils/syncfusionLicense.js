import { registerLicense } from '@syncfusion/ej2-base';

/**
 * Register Syncfusion license key from environment variables
 * This should be called once at the application startup
 */
export const registerSyncfusionLicense = () => {
  if (process.env.REACT_APP_SYNCFUSION_LICENSE_KEY) {
    registerLicense(process.env.REACT_APP_SYNCFUSION_LICENSE_KEY);
    console.log('Syncfusion license registered successfully');
  } else {
    console.warn('Syncfusion license key not found in environment variables');
  }
};
