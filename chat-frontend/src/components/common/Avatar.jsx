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

  const getAvatarUrl = (url) => {
    if (!url) return 'https://via.placeholder.com/150';
    if (url.startsWith('http') || url.startsWith('data:')) return url;
    
    // Get base URL from API URL (remove /api)
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
    const baseUrl = apiUrl.replace(/\/api\/?$/, '');
    
    return `${baseUrl}${url.startsWith('/') ? '' : '/'}${url}`;
  };

  return (
    <div className={clsx('relative', sizes[size], className)}>
      <img
        src={getAvatarUrl(src)}
        alt={alt || 'Avatar'}
        className="w-full h-full rounded-full object-cover"
      />
      {online && (
        <span className="absolute bottom-0 right-0 block h-3 w-3 rounded-full bg-green-500 ring-2 ring-white" />
      )}
    </div>
  );
}
