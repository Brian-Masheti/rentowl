import React, { useEffect, useState } from 'react';

const slides = [
  {
    title: 'Landlord: Full Control',
    text: 'View all properties, assign caretakers, access financial reports, and monitor occupancy—all in one dashboard.',
    color: '#03A6A1',
  },
  {
    title: 'Caretaker: Streamlined Maintenance',
    text: 'Report, assign, and resolve maintenance tasks. Communicate with tenants and track service history easily.',
    color: '#FFA673',
  },
  {
    title: 'Tenant: Hassle-Free Living',
    text: 'Pay rent online, submit maintenance requests, and access your lease and payment history anytime.',
    color: '#03A6A1',
  },
  {
    title: 'Automated Notifications',
    text: 'Get real-time reminders for rent, maintenance, and important announcements. Never miss a thing.',
    color: '#FFA673',
  },
  {
    title: 'Secure Document Storage',
    text: 'Upload and access legal agreements, utility bills, and emergency contacts securely in the cloud.',
    color: '#03A6A1',
  },
  {
    title: 'Smart Payment Processing',
    text: 'Multiple payment methods, instant receipts, and full/partial payment options for tenants.',
    color: '#FFA673',
  },
];

const SLIDE_INTERVAL = 4000;

const Slideshow: React.FC = () => {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIndex((prev) => (prev + 1) % slides.length);
    }, SLIDE_INTERVAL);
    return () => clearTimeout(timer);
  }, [index]);

  return (
    <div className="relative w-full h-40 flex items-center justify-center overflow-hidden rounded-xl shadow-lg bg-white/80 animate-fade-in">
      {slides.map((slide, i) => (
        <div
          key={slide.title}
          className={`absolute inset-0 flex flex-col items-center justify-center transition-opacity duration-700 ${i === index ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}
          style={{ color: slide.color }}
        >
          <h3 className="text-2xl font-bold mb-2 text-center drop-shadow" style={{ color: slide.color }}>{slide.title}</h3>
          <p className="text-base text-gray-700 text-center max-w-xl px-4" style={{ color: '#23272F' }}>{slide.text}</p>
        </div>
      ))}
      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-2">
        {slides.map((_, i) => (
          <span
            key={i}
            className={`w-3 h-3 rounded-full border-2 ${i === index ? 'bg-[#03A6A1] border-[#03A6A1]' : 'bg-[#FFE3BB] border-[#FFA673]'} transition-all`}
          />
        ))}
      </div>
    </div>
  );
};

export default Slideshow;
