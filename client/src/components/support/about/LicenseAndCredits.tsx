import React from 'react';
import DashboardCard from '../../layout/LayoutCard';

const LicenseAndCredits: React.FC = () => (
  <DashboardCard title="License & Credits">
    <div className="space-y-4">
      <div>
        <h4 className="text-sm font-medium text-gray-500 mb-2">Software License</h4>
        <p className="text-sm text-gray-600">
          JIMS is developed as part of CS317 - Software Engineering course requirements 
          at the Department of Computer Science. All rights reserved.
        </p>
      </div>
      
      <div>
        <h4 className="text-sm font-medium text-gray-500 mb-2">Development Team Credits</h4>
        <ul className="text-sm text-gray-600 list-disc list-inside space-y-1">
          <li>Glenn Mark R. Anino - Full-Stack Developer / Lead QA</li>
          <li>Den Jester B. Antonio - Full-Stack Developer / QA</li>
          <li>John Jaybird L. Casia - UI/UX Designer / QA</li>
          <li>John Cyril G. Espina - Project Manager / Lead Full-Stack Developer</li>
          <li>Sophia Marie M. Flores - Front-End Developer / Lead UI/UX Designer</li>
          <li>Julien A. Marabe - UI/UX Designer / QA</li>
        </ul>
      </div>
      
      <div>
        <h4 className="text-sm font-medium text-gray-500 mb-2">Third-Party Acknowledgments</h4>
        <ul className="text-sm text-gray-600 list-disc list-inside space-y-1">
          <li>React.js - User interface library</li>
          <li>TypeScript - Programming language</li>
          <li>Tailwind CSS - Styling framework</li>
          <li>Other development tools and libraries</li>
        </ul>
      </div>
      
      <div className="pt-2 border-t border-gray-200">
        <p className="text-xs text-gray-500">
          © 2025 JIA Integrated Management System (JIMS). CS317 Software Engineering Project.
        </p>
      </div>
    </div>
  </DashboardCard>
);

export default LicenseAndCredits;