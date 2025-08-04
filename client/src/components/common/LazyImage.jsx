import React, { useState } from 'react';

const LazyImage = ({
  src,
  alt,
  className = '',
  placeholderClassName = 'bg-gray-200 animate-pulse',
  ...rest
}) => {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);

  return (
    <div className="relative" style={{ minHeight: 40, minWidth: 40 }}>
      {!loaded && !error ? (
        <div
          className={`w-full h-full rounded ${placeholderClassName}`}
          style={{ minHeight: 40, minWidth: 40 }}
        />
      ) : error ? (
        <div
          className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-400 text-xs rounded border border-dashed border-gray-300"
          style={{ minHeight: 40, minWidth: 40 }}
        >
          Image not found
        </div>
      ) : (
        <img
          src={src}
          alt={alt}
          loading="lazy"
          className={`${className} object-cover rounded transition-opacity duration-300`}
          onLoad={() => setLoaded(true)}
          onError={() => setError(true)}
          {...rest}
        />
      )}
    </div>
  );
};

export default LazyImage;
