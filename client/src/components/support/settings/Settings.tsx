import React, { useState, useEffect, useRef } from 'react';
import DashboardCard from '../../layout/LayoutCard';
import DateFormatSettings from './DateFormatSettings';
import SidebarSettings from './SidebarSettings';

interface SettingsProps {
  activeSection?: string;
  onSectionChange?: (section: string) => void;
}

const Settings: React.FC<SettingsProps> = ({ activeSection, onSectionChange }) => {
  const [sidebarExpanded, setSidebarExpanded] = useState(() => {
    const saved = localStorage.getItem('sidebarDefaultExpanded');
    return saved === 'true';
  });

  const isScrollingProgrammatically = useRef(false);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastSectionRef = useRef<string>('');

  useEffect(() => {
    localStorage.setItem('sidebarDefaultExpanded', sidebarExpanded.toString());
  }, [sidebarExpanded]);

  // Scroll to section when activeSection changes
  useEffect(() => {
    if (activeSection && activeSection !== 'appearance') {
      const sectionIdMap: Record<string, string> = {
        'appearance': 'settings-appearance',
        'account&system': 'settings-account-system'
      };

      const targetId = sectionIdMap[activeSection] || activeSection;

      requestAnimationFrame(() => {
        setTimeout(() => {
          const element = document.getElementById(targetId);

          if (element) {
            const mainContainer = document.querySelector('main.overflow-y-auto');

            if (mainContainer) {
              isScrollingProgrammatically.current = true;

              const containerRect = mainContainer.getBoundingClientRect();
              const elementRect = element.getBoundingClientRect();

              const scrollTop = mainContainer.scrollTop;
              const offset = 100;

              const targetScroll = scrollTop + (elementRect.top - containerRect.top) - offset;

              mainContainer.scrollTo({
                top: targetScroll,
                behavior: 'smooth'
              });

              setTimeout(() => {
                isScrollingProgrammatically.current = false;
              }, 1000);
            }
          }
        }, 100);
      });
    } else if (activeSection === 'appearance') {
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
      if (isScrollingProgrammatically.current) return;

      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }

      scrollTimeoutRef.current = setTimeout(() => {
        const sections = [
          { id: 'settings-appearance', name: 'appearance' },
          { id: 'settings-account-system', name: 'account&system' }
        ];

        const containerRect = mainContainer.getBoundingClientRect();
        const viewportMiddle = containerRect.top + (containerRect.height / 3);

        let currentSection = 'appearance';

        for (const section of sections) {
          const element = document.getElementById(section.id);
          if (element) {
            const rect = element.getBoundingClientRect();

            if (rect.top <= viewportMiddle && rect.bottom >= containerRect.top) {
              currentSection = section.name;
            }
          }
        }

        if (currentSection !== lastSectionRef.current) {
          lastSectionRef.current = currentSection;
          onSectionChange(currentSection);
        }
      }, 100);
    };

    mainContainer.addEventListener('scroll', handleScroll, { passive: true });

    setTimeout(handleScroll, 200);

    return () => {
      mainContainer.removeEventListener('scroll', handleScroll);
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, [onSectionChange]);

  return (
    <div className="space-y-6">
      {/* Appearance Settings */}
      <section id="settings-appearance" className="scroll-mt-20">
        <h2 className="text-xl font-semibold text-gray-900">Appearance</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <DateFormatSettings />
          <SidebarSettings
            sidebarExpanded={sidebarExpanded}
            onToggle={setSidebarExpanded}
          />
        </div>
      </section>

      {/* Account & System */}
      <section id="settings-account-system" className="scroll-mt-20">
        <h2 className="text-xl font-semibold text-gray-900">Account & System</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <DashboardCard title="Account Settings">
            <p className="text-gray-600 text-sm">Manage your account information and security</p>
            <button className="mt-4 px-4 py-2 bg-gray-100 border-2 border-gray-300 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium cursor-not-allowed">
              Coming Soon
            </button>
          </DashboardCard>

          <DashboardCard title="Notifications">
            <p className="text-gray-600 text-sm">Configure notification preferences</p>
            <button className="mt-4 px-4 py-2 bg-gray-100 border-2 border-gray-300 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium cursor-not-allowed">
              Coming Soon
            </button>
          </DashboardCard>

          <DashboardCard title="Theme">
            <p className="text-gray-600 text-sm">Customize the appearance and theme</p>
            <button className="mt-4 px-4 py-2 bg-gray-100 border-2 border-gray-300 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium cursor-not-allowed">
              Coming Soon
            </button>
          </DashboardCard>

          <DashboardCard title="Privacy & Security">
            <p className="text-gray-600 text-sm">Control your privacy settings and data</p>
            <button className="mt-4 px-4 py-2 bg-gray-100 border-2 border-gray-300 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium cursor-not-allowed">
              Coming Soon
            </button>
          </DashboardCard>

          <DashboardCard title="Language & Region">
            <p className="text-gray-600 text-sm">Set your language and regional preferences</p>
            <button className="mt-4 px-4 py-2 bg-gray-100 border-2 border-gray-300 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium cursor-not-allowed">
              Coming Soon
            </button>
          </DashboardCard>

          <DashboardCard title="Data Management">
            <p className="text-gray-600 text-sm">Manage your data, backups, and exports</p>
            <button className="mt-4 px-4 py-2 bg-gray-100 border-2 border-gray-300 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium cursor-not-allowed">
              Coming Soon
            </button>
          </DashboardCard>
        </div>
      </section>
    </div>
  );
};

export default Settings;