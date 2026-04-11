const SkeletonLoader = ({ rows = 5, cols = 5 }) => {
  return (
    <div className="animate-pulse">
      <div className="h-10 bg-dark-100 rounded-lg mb-4" />
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex gap-4 mb-3">
          {Array.from({ length: cols }).map((_, j) => (
            <div key={j} className="h-8 bg-dark-100 rounded flex-1" />
          ))}
        </div>
      ))}
    </div>
  );
};

export default SkeletonLoader;
