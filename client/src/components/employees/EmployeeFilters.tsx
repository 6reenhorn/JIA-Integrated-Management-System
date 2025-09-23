import { Plus } from 'lucide-react';

const EmployeeFilters = () => {
  return (
    <div className="flex justify-between items gap-3 my-5">
      <button className='flex items-center gap-2 bg-gray-100 border-2 border-[#E5E7EB] rounded-lg px-4 py-2 text-gray-600 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500'>
        All Roles 
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <polygon points="4,6 12,6 8,12" fill="currentColor" />
        </svg>
      </button>
      <button className='flex items-center gap-2 bg-gray-100 border-2 border-[#E5E7EB] rounded-lg px-4 py-2 text-gray-600 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500'>
        All Status
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <polygon points="4,6 12,6 8,12" fill="currentColor" />
        </svg>
      </button>
      <button className='flex items-center gap-2 bg-gray-100 border-2 border-[#E5E7EB] rounded-lg px-4 py-2 text-gray-600 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500'>
        <Plus className="w-4 h-4 mr-2" />
        Add Staff
      </button>
    </div>
  );
};

export default EmployeeFilters;