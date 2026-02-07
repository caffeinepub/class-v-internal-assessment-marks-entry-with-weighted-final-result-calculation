/**
 * Utility to detect if the app is running in a Capacitor native context
 * Uses dynamic imports to avoid build-time dependency on Capacitor packages
 */
export function isCapacitorNative(): boolean {
  try {
    // Check if Capacitor is available in the global scope
    return typeof (window as any).Capacitor !== 'undefined' && 
           (window as any).Capacitor.isNativePlatform?.() === true;
  } catch {
    return false;
  }
}

/**
 * Utility to detect if the app is running on Android
 */
export function isAndroid(): boolean {
  try {
    if (typeof (window as any).Capacitor !== 'undefined') {
      return (window as any).Capacitor.getPlatform?.() === 'android';
    }
    // Fallback to user agent detection
    return /android/i.test(navigator.userAgent);
  } catch {
    return false;
  }
}

/**
 * Utility to detect if the app is running in an Android WebView via Capacitor
 */
export function isCapacitorAndroid(): boolean {
  return isCapacitorNative() && isAndroid();
}
