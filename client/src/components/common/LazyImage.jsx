import React, { useState } from 'react';

const LazyImage = ({
  src,
  alt,
  className = '',
  placeholderClassName = 'bg-gray-200 animate-pulse',
  ...rest
}) => {
  const [loaded, setLoaded] = useState(false);

  return (
    <div className="relative" style={{ minHeight: 40, minWidth: 40 }}>
      {!loaded ? (
        <div
          className={`w-full h-full rounded ${placeholderClassName}`}
          style={{ minHeight: 40, minWidth: 40 }}
        />
      ) : (
        <img
          src={src}
          alt={alt}
          loading="lazy"
          className={`${className} object-cover rounded transition-opacity duration-300`}
          onLoad={() => setLoaded(true)}
          {...rest}
        />
      )}
    </div>
  );
};

export default LazyImage;
