type Props = {
  className?: string;
  style?: React.CSSProperties;
};

export const Skeleton = ({ className = '', style }: Props) => (
  <div
    className={`animate-pulse rounded-lg bg-stone-100 dark:bg-stone-700 ${className}`}
    style={style}
  />
);
