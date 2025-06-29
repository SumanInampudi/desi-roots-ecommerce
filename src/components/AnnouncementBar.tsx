import React, { useState } from 'react';
import { X, Gift, Truck, Clock } from 'lucide-react';

const AnnouncementBar: React.FC = () => {
  const [isVisible, setIsVisible] = useState(true);

  const announcements = [
    {
      icon: <Gift className="w-4 h-4" />,
      text: "🎉 New Year Special: Get 20% OFF on orders above ₹1000! Use code: NEWYEAR2025",
      bgColor: "bg-gradient-to-r from-red-600 to-orange-600",
      textColor: "text-white"
    },
    {
      icon: <Truck className="w-4 h-4" />,
      text: "🚚 FREE Delivery on all orders above ₹500 - Limited time offer!",
      bgColor: "bg-gradient-to-r from-green-600 to-emerald-600",
      textColor: "text-white"
    },
    {
      icon: <Clock className="w-4 h-4" />,
      text: "⚡ Fresh Stock Alert: All spices ground fresh daily - Order now for maximum flavor!",
      bgColor: "bg-gradient-to-r from-amber-600 to-yellow-600",
      textColor: "text-white"
    }
  ];

  // You can change this index to show different announcements
  // Or implement a rotating system
  const currentAnnouncement = announcements[0];

  if (!isVisible) return null;

  return (
    <div className={`${currentAnnouncement.bgColor} ${currentAnnouncement.textColor} relative overflow-hidden`}>
      {/* Animated background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent transform -skew-x-12 animate-pulse"></div>
      </div>
      
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between py-3">
          <div className="flex-1 flex items-center justify-center space-x-3">
            <div className="flex-shrink-0 animate-bounce">
              {currentAnnouncement.icon}
            </div>
            <p className="text-sm md:text-base font-semibold text-center animate-pulse">
              {currentAnnouncement.text}
            </p>
          </div>
          
          <button
            onClick={() => setIsVisible(false)}
            className="flex-shrink-0 ml-4 p-1 rounded-full hover:bg-white/20 transition-colors duration-200 group"
            aria-label="Close announcement"
          >
            <X className="w-4 h-4 group-hover:scale-110 transition-transform duration-200" />
          </button>
        </div>
      </div>

      {/* Subtle shine effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent transform translate-x-[-100%] animate-[shine_3s_ease-in-out_infinite]"></div>
    </div>
  );
};

export default AnnouncementBar;