import React, { useState, useEffect } from 'react';
import Dashboard from '../pages/Dashboard';
import LoadingScreen from '../components/common/LoadingScreen';

const App: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);

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

        await new Promise(resolve => setTimeout(resolve, 1500));

        setIsLoading(false);
      } catch (error) {
        console.error('Error initializing app:', error);

        setIsLoading(false);
      }
    };

    initializeApp();
  }, []);

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <div className="App">
      <Dashboard />
    </div>
  );
};

export default App;