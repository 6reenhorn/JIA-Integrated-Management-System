import React from 'react';
import DashboardCard from '../../layout/LayoutCard';

const Support: React.FC = () => (
  <DashboardCard title="Support">
    <div className="space-y-4">
      <p className="text-gray-600">
        For technical support, bug reports, or feature requests, please contact the development team.
      </p>
      
      <div>
        <h4 className="text-sm font-medium text-gray-500 mb-2">Development Team Contacts:</h4>
        <ul className="text-sm text-gray-600 space-y-2">
          <li>
            <strong>John Cyril G. Espina</strong> (Project Manager)
            <br />
            <span className="text-blue-600">johncyril.espina@1.ustp.edu.ph</span>
          </li>
          <li>
            <strong>Glenn Mark R. Anino</strong> (Lead QA)
            <br />
            <span className="text-blue-600">glennmark.anino@1.ustp.edu.ph</span>
          </li>
          <li>
            <strong>Sophia Marie M. Flores</strong> (Lead UI/UX)
            <br />
            <span className="text-blue-600">sophiamarie.flores@1.ustp.edu.ph</span>
          </li>
        </ul>
      </div>
      
      <div>
        <h4 className="text-sm font-medium text-gray-500 mb-2">Project Advisor:</h4>
        <p className="text-sm text-gray-600">
          <strong>Prof. Marylene S. Eder</strong>
          <br />
          Department of Computer Science
        </p>
      </div>
      
      <div>
        <h4 className="text-sm font-medium text-gray-500 mb-2">Client:</h4>
        <p className="text-sm text-gray-600">
          <strong>Ms. Jennie Estoque</strong>
          <br />
          JIA Business Center
        </p>
      </div>
    </div>
  </DashboardCard>
);

export default Support;