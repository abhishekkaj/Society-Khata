import { Linking, Platform } from 'react-native';

const VIRAL_HOOK = '\n\n---\n*Generated via Society Khata📱*\nFree zero-latency society management.\nDownload: bit.ly/society-khata';

export const shareWhatsAppReminder = async (phone: string, memberName: string, amount: number, flat: string) => {
  // Format the text using WhatsApp specific formatting (* for bold)
  const message = `Hello *${memberName}* (Flat ${flat}),\n\nThis is a gentle reminder that your society maintenance of *₹${amount}* is currently pending.\nWe request you to kindly clear the dues at your earliest convenience.` + VIRAL_HOOK;

  // Clean phone number
  const cleanPhone = phone.replace(/[^0-9]/g, '');
  
  let url = `whatsapp://send?text=${encodeURIComponent(message)}&phone=${cleanPhone}`;
  
  try {
    const supported = await Linking.canOpenURL(url);
    if (supported) {
      return Linking.openURL(url);
    } else {
      // Fallback if WhatsApp is not installed
      if (Platform.OS === 'web') {
        window.open(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`, '_blank');
      } else {
        console.warn('WhatsApp is not installed on the device');
      }
    }
  } catch (err) {
    console.error('Error opening WhatsApp', err);
  }
};
