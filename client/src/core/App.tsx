import React, { useState, useEffect } from 'react';
import Dashboard from '../pages/Dashboard';
import { Route, Routes } from 'react-router-dom';
import LoadingScreen from '../components/common/LoadingScreen';
import NetworkStatus from '../components/common/NetworkStatus';

const App: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [loadingPercentage, setLoadingPercentage] = useState(0);

  useEffect(() => {
    const initializeApp = async () => {
      try {
        await new Promise(resolve => {
          if (document.readyState === 'complete') {
            resolve(true);
          } else {
            window.addEventListener('load', () => resolve(true));
          }
        });

        let progress = 0;
        const interval = setInterval(() => {
          progress += 6;
          if (progress > 100) progress = 100;
          setLoadingPercentage(progress);
        }, 75);

        await new Promise(resolve => setTimeout(resolve, 1500));

        clearInterval(interval);
        setLoadingPercentage(100);

        setIsLoading(false);
      } catch (error) {
        console.error('Error initializing app:', error);
        setIsLoading(false);
      }
    };

    initializeApp();
  }, []);

  if (isLoading) {
    return <LoadingScreen percentage={loadingPercentage} />;
  }

  return (
    <div className="App">
      <NetworkStatus />
      <Routes>
        <Route path="/*" element={<Dashboard />} />
      </Routes>
    </div>
  );
};

export default App;
