import clsx from 'clsx';

export default function Avatar({
  src,
  alt,
  size = 'md',
  online = false,
  className = '',
}) {
  const sizes = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16',
  };

  return (
    <div className={clsx('relative', sizes[size], className)}>
      <img
        src={src || 'https://via.placeholder.com/150'}
        alt={alt || 'Avatar'}
        className="w-full h-full rounded-full object-cover"
      />
      {online && (
        <span className="absolute bottom-0 right-0 block h-3 w-3 rounded-full bg-green-500 ring-2 ring-white" />
      )}
    </div>
  );
}
