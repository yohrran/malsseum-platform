export const LoadingSpinner = () => {
  return (
    <div className="flex items-center justify-center min-h-[200px]">
      <div className="h-9 w-9 animate-spin rounded-full border-[3px] border-slate-200 border-t-indigo-600" />
    </div>
  );
};
