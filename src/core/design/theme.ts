export const theme = {
  colors: {
    primary: '#1B4F72', // Deep Trust Blue
    accent: '#FF6F3C', // Vibrant Saffron
    success: '#27AE60', // Fresh Green
    warning: '#F39C12', // Amber
    danger: '#E74C3C', // Red
    bgPrimary: '#F8F9FA', // Soft off-white
    bgSecondary: '#FFFFFF', // Pure white cards
    textPrimary: '#2C3E50', // Dark slate
    textSecondary: '#7F8C8D', // Medium gray
    border: '#EAECEE',
    gridLines: 'rgba(0, 0, 0, 0.05)',
  },
  typography: {
    // Note: To use these properly in RN, fonts must be loaded, e.g., via expo-font
    header: { fontFamily: 'System', fontWeight: 'bold' as const, fontSize: 24 },
    subheader: { fontFamily: 'System', fontWeight: '600' as const, fontSize: 18 },
    body: { fontFamily: 'System', fontSize: 14 },
    numbers: { fontFamily: 'System', fontWeight: '700' as const, fontSize: 32 }, // Should ideally map to JetBrains Mono
    amounts: { fontFamily: 'System', fontWeight: '600' as const, fontSize: 16 },
  },
  spacing: {
    xs: 4,
    s: 8,
    m: 16,
    l: 24,
    xl: 32,
    xxl: 48,
  },
  shadows: {
    card: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.05,
      shadowRadius: 12,
      elevation: 2,
    },
    float: {
      shadowColor: '#1B4F72',
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.2,
      shadowRadius: 16,
      elevation: 5,
    }
  },
  radius: {
    s: 8,
    m: 12,
    l: 16,
    round: 9999,
  }
};
