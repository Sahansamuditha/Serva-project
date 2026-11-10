import { useWindowDimensions, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

/**
 * Custom hook to dynamically detect device width, height,
 * safe areas, and calculate responsive sizing.
 */
export function useResponsive() {
  const { width, height, scale, fontScale } = useWindowDimensions();
  const insets = useSafeAreaInsets();

  const isSmallDevice = width < 375;
  const isNormalMobile = width >= 375 && width < 480;
  const isLargeMobile = width >= 480 && width < 768;
  const isTablet = width >= 768 && width < 1024;
  const isDesktop = width >= 1024;

  const isPortrait = height >= width;
  const isLandscape = width > height;

  // Responsive scale factor relative to 390px baseline
  const scaleFactor = Math.min(Math.max(width / 390, 0.85), 1.25);

  // Safe area bottom inset calculation
  const bottomInset = Math.max(insets.bottom, Platform.OS === 'web' ? 12 : 8);
  const tabHeight = 60 + bottomInset;

  return {
    width,
    height,
    scale,
    fontScale,
    insets,
    isSmallDevice,
    isNormalMobile,
    isLargeMobile,
    isTablet,
    isDesktop,
    isPortrait,
    isLandscape,
    scaleFactor,
    bottomInset,
    tabHeight,
    // Size scaler helper
    s: (size) => Math.round(size * scaleFactor)
  };
}

export default useResponsive;
