import { isCapacitorAndroid } from './capacitorPlatform';

/**
 * Internet Identity WebView compatibility shim for Capacitor Android.
 * 
 * This module provides a workaround for Internet Identity authentication in Android WebView.
 * Since WebView blocks popup windows, we redirect the II login flow to an external browser
 * (Custom Tab) and handle the return via deep link.
 * 
 * Uses dynamic imports to avoid build-time dependency on Capacitor packages.
 */

let authResolve: ((value: boolean) => void) | null = null;
let authReject: ((reason?: any) => void) | null = null;

/**
 * Initialize the Internet Identity WebView shim.
 * Must be called early in the app lifecycle (before login attempts).
 */
export function initIIWebViewShim() {
  if (!isCapacitorAndroid()) {
    return;
  }

  try {
    // Dynamically access Capacitor App plugin if available
    const App = (window as any).Capacitor?.Plugins?.App;
    
    if (App && App.addListener) {
      // Listen for app URL open events (deep link returns from browser)
      App.addListener('appUrlOpen', (data: { url: string }) => {
        console.log('App URL opened:', data.url);
        
        // Check if this is a return from Internet Identity
        if (data.url.includes('auth-callback') || data.url.includes('identity')) {
          if (authResolve) {
            authResolve(true);
            authResolve = null;
            authReject = null;
          }
        }
      });
    }
  } catch (error) {
    console.warn('Failed to initialize II WebView shim:', error);
  }
}

/**
 * Open Internet Identity login in an external browser (Custom Tab).
 * Returns a promise that resolves when the user returns to the app.
 */
export async function openIILoginInBrowser(identityUrl: string): Promise<boolean> {
  if (!isCapacitorAndroid()) {
    throw new Error('This function should only be called on Capacitor Android');
  }

  return new Promise((resolve, reject) => {
    authResolve = resolve;
    authReject = reject;

    try {
      // Dynamically access Capacitor Browser plugin if available
      const Browser = (window as any).Capacitor?.Plugins?.Browser;
      
      if (Browser && Browser.open) {
        // Open Internet Identity in a Custom Tab
        Browser.open({
          url: identityUrl,
          presentationStyle: 'popover',
          toolbarColor: '#1e40af'
        }).catch((error: any) => {
          console.error('Failed to open browser:', error);
          reject(error);
        });
      } else {
        // Fallback: open in new window
        window.open(identityUrl, '_blank');
        // Resolve after a short delay assuming user will return
        setTimeout(() => resolve(true), 1000);
      }
    } catch (error) {
      console.error('Failed to open browser:', error);
      reject(error);
    }

    // Timeout after 5 minutes
    setTimeout(() => {
      if (authResolve) {
        authReject?.(new Error('Authentication timeout'));
        authResolve = null;
        authReject = null;
      }
    }, 300000);
  });
}

/**
 * Close the browser if it's still open
 */
export async function closeIIBrowser() {
  if (isCapacitorAndroid()) {
    try {
      const Browser = (window as any).Capacitor?.Plugins?.Browser;
      if (Browser && Browser.close) {
        await Browser.close();
      }
    } catch (error) {
      // Browser might already be closed
      console.log('Browser close error (may be already closed):', error);
    }
  }
}
