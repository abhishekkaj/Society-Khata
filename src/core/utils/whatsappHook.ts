import { Linking, Alert } from 'react-native';

export const shareWhatsAppReminder = async (
  rawPhone: string,
  memberName: string,
  amount: number,
  flatNumber: string
) => {
  // 1. Aggressive Number Sanitization
  // Strip all spaces, dashes, parentheses, and the + symbol
  let sanitizedNumber = rawPhone.replace(/[\s\-()+]/g, '');

  // If it's precisely a 10-digit Indian number, prepend 91
  if (sanitizedNumber.length === 10) {
    sanitizedNumber = `91${sanitizedNumber}`;
  } else if (sanitizedNumber.startsWith('0') && sanitizedNumber.length === 11) {
    // Handle cases where users prefix with 0
    sanitizedNumber = `91${sanitizedNumber.substring(1)}`;
  }

  // 2. Message Generation
  const message = `Namaskaram ${memberName} (Flat ${flatNumber}),
  
This is a gentle reminder regarding the pending society maintenance dues of ₹${amount.toLocaleString()}. 
Kindly clear the dues at your earliest convenience to help us maintain our community services uninterrupted.

Generated via Society Khata 📱 | Community Finance, Simplified.`;

  // Wrap payload in strict URI encoding
  const encodedMessage = encodeURIComponent(message);
  
  // 3. Universal Scheme Routing (Bypassing android `<queries>` block logic)
  const universalUrl = `https://wa.me/${sanitizedNumber}?text=${encodedMessage}`;

  // 4. Bulletproof Execution Sequence
  try {
    // Try opening the universal link (which falls back natively to browsers if the app is missing but works perfectly if app is installed)
    await Linking.openURL(universalUrl);
  } catch (error) {
    // Silently catch OS-level intent failures and alert the user cleanly
    console.error('WhatsApp routing intent failed', error);
    Alert.alert(
      'WhatsApp Error',
      'Could not open WhatsApp. Please ensure it is installed on your device or you have an active internet connection to fall back to the browser.'
    );
  }
};
