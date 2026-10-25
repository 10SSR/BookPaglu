export function triggerHaptic(type: 'light' | 'medium' | 'heavy' | 'success' | 'selection' = 'light') {
  if (typeof window === 'undefined' || !navigator.vibrate) return;

  try {
    switch (type) {
      case 'light':
        navigator.vibrate(8);
        break;
      case 'medium':
        navigator.vibrate(18);
        break;
      case 'heavy':
        navigator.vibrate([25, 30, 25]);
        break;
      case 'selection':
        navigator.vibrate(10);
        break;
      case 'success':
        navigator.vibrate([15, 40, 20]);
        break;
    }
  } catch {
    // Ignore unsupported device errors
  }
}
