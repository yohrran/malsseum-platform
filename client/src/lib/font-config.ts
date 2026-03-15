export type FontSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
export type LineHeight = 'compact' | 'normal' | 'relaxed';

export const FONT_SIZE_CLASS: Record<FontSize, string> = {
  xs: 'text-xs',
  sm: 'text-sm',
  md: 'text-base',
  lg: 'text-lg',
  xl: 'text-xl',
  '2xl': 'text-2xl',
};

export const LINE_HEIGHT_CLASS: Record<LineHeight, string> = {
  compact: 'leading-6',
  normal: 'leading-8',
  relaxed: 'leading-10',
};

export const FONT_SIZES: FontSize[] = ['xs', 'sm', 'md', 'lg', 'xl', '2xl'];
export const LINE_HEIGHTS: LineHeight[] = ['compact', 'normal', 'relaxed'];

export const FONT_SIZE_LABEL: Record<FontSize, string> = {
  xs: '아주 작게',
  sm: '작게',
  md: '보통',
  lg: '크게',
  xl: '아주 크게',
  '2xl': '최대',
};

export const LINE_HEIGHT_LABEL: Record<LineHeight, string> = {
  compact: '좁게',
  normal: '보통',
  relaxed: '넓게',
};

export const FONT_DISPLAY_SIZE_BIBLE = [10, 11, 13, 15, 17, 19] as const;
export const FONT_DISPLAY_SIZE_READING = [11, 12, 14, 16, 18, 20] as const;
