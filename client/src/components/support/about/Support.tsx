import React from 'react';

const Support: React.FC = () => (
  <section id="about-support" className="scroll-mt-20">
    <h2 className="text-3xl font-bold text-gray-900 mb-6 pb-3 border-b-2 border-[#02367B]">
      Support
    </h2>
    
    <div className="space-y-6 text-gray-700">
      <p className="text-lg leading-relaxed">
        For technical support, bug reports, or feature requests, please contact the development team.
      </p>
      
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Development Team Contacts</h3>
        <div className="space-y-4">
          <div>
            <p className="font-semibold text-gray-900">John Cyril G. Espina</p>
            <p className="text-sm text-gray-600">Project Manager</p>
            <a href="mailto:johncyril.espina@1.ustp.edu.ph" className="text-[#02367B] hover:underline">
              johncyril.espina@1.ustp.edu.ph
            </a>
          </div>
          <div>
            <p className="font-semibold text-gray-900">Glenn Mark R. Anino</p>
            <p className="text-sm text-gray-600">Lead QA</p>
            <a href="mailto:glennmark.anino@1.ustp.edu.ph" className="text-[#02367B] hover:underline">
              glennmark.anino@1.ustp.edu.ph
            </a>
          </div>
          <div>
            <p className="font-semibold text-gray-900">Sophia Marie M. Flores</p>
            <p className="text-sm text-gray-600">Lead UI/UX</p>
            <a href="mailto:sophiamarie.flores@1.ustp.edu.ph" className="text-[#02367B] hover:underline">
              sophiamarie.flores@1.ustp.edu.ph
            </a>
          </div>
        </div>
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">Project Advisor</h3>
        <p className="font-semibold text-gray-900">Prof. Marylene S. Eder</p>
        <p className="text-gray-600">Department of Computer Science</p>
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">Client</h3>
        <p className="font-semibold text-gray-900">Ms. Jennie Estoque</p>
        <p className="text-gray-600">JIA Business Center</p>
      </div>
    </div>
  </section>
);

export default Support;