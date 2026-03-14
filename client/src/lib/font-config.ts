export type FontSize = 'sm' | 'md' | 'lg' | 'xl';

export const FONT_SIZE_CLASS: Record<FontSize, string> = {
  sm: 'text-sm leading-7',
  md: 'text-base leading-8',
  lg: 'text-lg leading-9',
  xl: 'text-xl leading-10',
};

export const FONT_SIZES: FontSize[] = ['sm', 'md', 'lg', 'xl'];

export const FONT_DISPLAY_SIZE_BIBLE = [11, 13, 15, 17] as const;
export const FONT_DISPLAY_SIZE_READING = [12, 14, 16, 18] as const;
