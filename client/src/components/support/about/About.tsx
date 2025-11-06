import React from 'react';
import DashboardCard from '../../layout/LayoutCard';
import VersionInfo from './VersionInfo';
import Support from './Support';
import LicenseAndCredits from './LicenseAndCredits';

interface AboutProps {
  activeSection?: string;
}

const About: React.FC<AboutProps> = ({ activeSection = 'main' }) => {
  // Determine which section to highlight
  const getSectionId = () => {
    switch (activeSection) {
      case 'version':
        return 'version-info-section';
      case 'support':
        return 'support-section';
      case 'licenses':
        return 'licenses-section';
      default:
        return 'about-main-section';
    }
  };

  const highlightedSection = getSectionId();

  // Highlight class to apply
  const getHighlightClass = (sectionId: string) => {
    return highlightedSection === sectionId
      ? 'ring-4 ring-[#02367B] ring-opacity-50'
      : '';
  };

  return (
    <div className="space-y-6">
      {/* Main About Section */}
      <div id="about-main-section">
        <DashboardCard 
          title="About JIMS"
          className={getHighlightClass('about-main-section')}
        >
          <p className="text-gray-600 mb-4">
            JIA Integrated Management System (JIMS) is a comprehensive software solution designed to 
            digitalize and streamline business operations for JIA Business Center.
          </p>
          <div className="mt-4 space-y-2">
            <div className="text-sm text-gray-500 font-medium">Application Info:</div>
            <ul className="text-sm text-gray-600 list-disc list-inside space-y-1">
              <li><strong>Version:</strong> 1.0.0</li>
              <li><strong>Release Date:</strong> December 2025</li>
              <li><strong>Support:</strong> Nobus Group</li>
              <li><strong>Documentation:</strong> Project Charter & Technical Specifications</li>
            </ul>
          </div>
          <div className="mt-6">
            <h4 className="text-sm font-medium text-gray-500 mb-2">Key Features:</h4>
            <ul className="text-sm text-gray-600 list-disc list-inside space-y-1">
              <li>Inventory Management</li>
              <li>Point-of-Sale (POS) System</li>
              <li>Employee Attendance Monitoring</li>
              <li>E-Wallet Transaction Tracking</li>
              <li>Business Reporting & Analytics</li>
            </ul>
          </div>
        </DashboardCard>
      </div>
      
      {/* Version Info and Support Sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div id="version-info-section">
          <VersionInfo isHighlighted={highlightedSection === 'version-info-section'} />
        </div>
        
        <div id="support-section">
          <Support isHighlighted={highlightedSection === 'support-section'} />
        </div>
      </div>
      
      {/* License and Credits Section */}
      <div id="licenses-section">
        <LicenseAndCredits isHighlighted={highlightedSection === 'licenses-section'} />
      </div>
    </div>
  );
};

export default About;