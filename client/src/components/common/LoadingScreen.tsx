
import React from 'react';
import LoadingIcon from '../../assets/JIA_CheckIn.ico';

const LoadingScreen: React.FC = () => {
  return (
    <div className="fixed inset-0 bg-gradient-to-br from-[#02367B] to-[#1C4A9E] flex items-center justify-center z-[9999]">
      <div className="flex flex-col items-center gap-6">
        {/* Icon with pulse animation */}
        <div className="relative">
          <img 
            src={LoadingIcon} 
            alt="JIA Logo" 
//            className="w-32 h-32 animate-spin"
          />

        </div>

        {/* Loading text */}
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-2">
            JIA Management System
          </h2>
          <div className="flex items-center gap-2 justify-center">
            <span className="text-white/80 text-sm">Loading</span>
          </div>
        </div>

        {/* Progress bar */}
        <div className="w-64 h-1 bg-white/20 rounded-full overflow-hidden">
          <div className="h-full bg-white rounded-full animate-progress" />
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes progress {
          0% {
            width: 0%;
            margin-left: 0%;
          }
          50% {
            width: 50%;
            margin-left: 25%;
          }
          100% {
            width: 100%;
            margin-left: 0%;
          }
        }
        
        .animate-progress {
          animation: progress 2s ease-in-out infinite;
        }
      ` }} />
    </div>
  );
};

export default LoadingScreen;