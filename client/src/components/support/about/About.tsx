import React, { useEffect, useRef } from 'react';
import MainAbout from './MainAbout';
import VersionInfo from './VersionInfo';
import Support from './Support';
import LicenseAndCredits from './LicenseAndCredits';

interface AboutProps {
  activeSection?: string;
  onSectionChange?: (section: string) => void;
}

const About: React.FC<AboutProps> = ({ activeSection, onSectionChange }) => {
  const isScrollingProgrammatically = useRef(false);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastSectionRef = useRef<string>('');

  // Scroll to section when activeSection changes
  useEffect(() => {
    if (activeSection && activeSection !== 'main') {
      // Map section names to full IDs
      const sectionIdMap: Record<string, string> = {
        'main': 'about-main',
        'version': 'about-version',
        'support': 'about-support',
        'licenses': 'about-license'
      };

      const targetId = sectionIdMap[activeSection] || activeSection;

      // Use requestAnimationFrame to ensure DOM is ready
      requestAnimationFrame(() => {
        setTimeout(() => {
          const element = document.getElementById(targetId);
          
          if (element) {
            // Find the scrollable container (main element)
            const mainContainer = document.querySelector('main.overflow-y-auto');
            
            if (mainContainer) {
              isScrollingProgrammatically.current = true;
              
              // Get the element's position relative to the container
              const containerRect = mainContainer.getBoundingClientRect();
              const elementRect = element.getBoundingClientRect();
              
              // Calculate the scroll position
              const scrollTop = mainContainer.scrollTop;
              const offset = 100; // Increased offset for better positioning
              
              // Calculate target scroll position
              const targetScroll = scrollTop + (elementRect.top - containerRect.top) - offset;
              
              // Scroll the container
              mainContainer.scrollTo({
                top: targetScroll,
                behavior: 'smooth'
              });

              // Reset flag after scroll animation completes
              setTimeout(() => {
                isScrollingProgrammatically.current = false;
              }, 1000);
            }
          }
        }, 100);
      });
    } else if (activeSection === 'main') {
      const mainContainer = document.querySelector('main.overflow-y-auto');
      if (mainContainer) {
        isScrollingProgrammatically.current = true;
        mainContainer.scrollTo({
          top: 0,
          behavior: 'smooth'
        });
        setTimeout(() => {
          isScrollingProgrammatically.current = false;
        }, 1000);
      }
    }
  }, [activeSection]);

  // Scroll spy - detect which section is currently visible
  useEffect(() => {
    const mainContainer = document.querySelector('main.overflow-y-auto');
    if (!mainContainer || !onSectionChange) return;

    const handleScroll = () => {
      // Don't update active section during programmatic scrolling
      if (isScrollingProgrammatically.current) return;

      // Debounce the scroll event
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }

      scrollTimeoutRef.current = setTimeout(() => {
        const sections = [
          { id: 'about-main', name: 'main' },
          { id: 'about-version', name: 'version' },
          { id: 'about-support', name: 'support' },
          { id: 'about-license', name: 'licenses' }
        ];

        const containerRect = mainContainer.getBoundingClientRect();
        const viewportMiddle = containerRect.top + (containerRect.height / 3); // Top third of viewport

        let currentSection = 'main';

        // Find which section is most visible
        for (const section of sections) {
          const element = document.getElementById(section.id);
          if (element) {
            const rect = element.getBoundingClientRect();
            
            // Check if the section's top is above the middle of viewport
            // and the section's bottom is below the top of viewport
            if (rect.top <= viewportMiddle && rect.bottom >= containerRect.top) {
              currentSection = section.name;
            }
          }
        }

        // Only update if the section has changed
        if (currentSection !== lastSectionRef.current) {
          lastSectionRef.current = currentSection;
          onSectionChange(currentSection);
        }
      }, 100); // Debounce delay
    };

    mainContainer.addEventListener('scroll', handleScroll, { passive: true });
    
    // Initial check
    setTimeout(handleScroll, 200);

    return () => {
      mainContainer.removeEventListener('scroll', handleScroll);
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, [onSectionChange]);

  return (
    <div className="min-h-screen">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-[#02367B] to-[#034694] py-12 px-6 rounded-2xl text-white">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-2xl md:text-3xl font-bold mb-3">JIA Integrated Management System</h1>
          <p className="text-sm text-gray-200">
            Learn more about JIA Integrated Management System - our journey, features, and team.
          </p>
        </div>
      </div>

      {/* Content Sections */}
      <div className="max-w-6xl mx-auto px-6 py-12 space-y-16">
        <MainAbout />
        <VersionInfo />
        <Support />
        <LicenseAndCredits />
      </div>
    </div>
  );
};

export default About