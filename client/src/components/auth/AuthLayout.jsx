import React, { useEffect, useRef, useState } from 'react';

const SLIDESHOW_INTERVAL = 5000;

function AuthLayout({ title, children, images = [] }) {
  // Slideshow state for desktop
  const [slideIndex, setSlideIndex] = useState(0);
  const timeoutRef = useRef(null);

  useEffect(() => {
    if (images.length > 1) {
      timeoutRef.current = setTimeout(() => {
        setSlideIndex((prev) => (prev + 1) % images.length);
      }, SLIDESHOW_INTERVAL);
      return () => timeoutRef.current && clearTimeout(timeoutRef.current);
    }
  }, [slideIndex, images.length]);

  return (
    <div className="min-h-screen flex flex-col md:flex-row" style={{ background: '#FFE3BB' }}>
      {/* Desktop: 50% Gallery/Slideshow Section */}
      <div className="hidden md:block w-1/2 h-screen relative overflow-hidden">
        {/* Slideshow Images as Backgrounds with Fade Transition */}
        {images.map((img, idx) => (
          <div
            key={img}
            className={`absolute inset-0 w-full h-full transition-opacity duration-1000 ${idx === slideIndex ? 'opacity-100 z-0' : 'opacity-0 z-0'}`}
            style={{
              backgroundImage: `url(${img})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat',
              filter: 'brightness(0.96)',
            }}
          />
        ))}
        {/* Logo and Version Overlay */}
        <div className="absolute top-10 left-10 z-20 flex flex-col items-start">
          <img src="/images/logo2.png" alt="RentOwl Logo" className="h-16 w-16 object-contain drop-shadow-lg" />
          <span
            className="text-xs font-semibold tracking-wide mt-2 px-2 py-1 rounded-full shadow"
            style={{
              background: '#03A6A1',
              color: '#fff',
              textShadow: '0 1px 4px rgba(0,0,0,0.18)',
              border: '1px solid #fff',
            }}
          >
            RentOwl v1.0.0
          </span>
        </div>
        {/* Watermark Overlay with Semi-Transparent Box */}
        <div className="absolute bottom-6 right-8 z-20 select-none pointer-events-none">
          <span
            className="text-3xl font-bold tracking-widest px-4 py-2 rounded-lg"
            style={{
              background: 'rgba(255,255,255,0.75)',
              color: '#23272F',
              letterSpacing: 2,
              boxShadow: '0 2px 8px rgba(0,0,0,0.10)',
            }}
          >
            RentOwl
          </span>
        </div>
      </div>
      {/* Mobile: Logo and Gallery Section */}
      <div
        className="md:hidden w-full flex flex-col items-center justify-center p-10 border-b border-gray-200"
        style={{
          background: 'linear-gradient(135deg, #03A6A1 0%, #FFA673 100%)',
        }}
      >
        <div className="mb-4 flex flex-col items-center justify-center">
          <img src="/images/logo2.png" alt="RentOwl Logo" className="h-16 w-16 object-contain" />
          <span className="text-xs text-gray-100 font-semibold tracking-wide mt-1">RentOwl v1.0.0</span>
        </div>
        <div className="w-full max-w-xs aspect-[16/9] rounded-lg overflow-hidden shadow-lg flex items-center justify-center bg-white/20">
          {images.length > 0 ? (
            <img 
              src={images[0]} 
              alt="Gallery" 
              className="w-full h-full object-cover shadow-md" 
            />
          ) : (
            <div className="text-gray-200 text-center w-full">Gallery Images Here</div>
          )}
        </div>
      </div>
      {/* Form Section */}
      <div className="md:w-1/2 w-full flex flex-col justify-center items-center p-6 md:p-12 bg-white/90">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-6 text-center">{title}</h2>
        <div className="w-full max-w-md">{children}</div>
      </div>
    </div>
  );
}

export default AuthLayout;
