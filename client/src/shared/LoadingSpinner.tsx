export const LoadingSpinner = () => {
  return (
    <div className="flex items-center justify-center min-h-[200px]">
      <div className="h-9 w-9 animate-spin rounded-full border-[3px] border-stone-200 border-t-amber-600" />
    </div>
  );
};
