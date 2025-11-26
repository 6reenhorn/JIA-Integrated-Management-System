import React from 'react';
import LoadingIcon from '../../assets/JIA_CheckIn.ico';

interface LoadingScreenProps {
  percentage: number;
}

const LoadingScreen: React.FC<LoadingScreenProps> = ({ percentage }) => {
  return (
    <div className="fixed inset-0 bg-gradient-to-br from-[#02367B] to-[#1C4A9E] flex items-center justify-center z-[9999]">
      <div className="flex flex-col items-center gap-6">
        {/* Icon with pulse animation */}
        <div className="relative">
          <img 
            src={LoadingIcon} 
            alt="JIA Logo" 
          />
        </div>

        {/* Loading text */}
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-2">
            JIA Management System
          </h2>
          <div className="flex items-center gap-2 justify-center">
            <span className="text-white/80 text-sm">Loading</span>
            <span className="text-white/80 text-sm font-semibold">{percentage}%</span>
          </div>
        </div>

        {/* Progress bar */}
        <div className="w-70 h-1 bg-white/20 rounded-full overflow-hidden">
          <div 
            className="h-full bg-white rounded-b-sm transition-all duration-200 ease-in-out"
            style={{ width: percentage + '%' }}
          />
        </div>
      </div>
    </div>
  );
};

export default LoadingScreen;
