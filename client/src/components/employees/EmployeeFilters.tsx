import { Plus } from 'lucide-react';

interface EmployeeFiltersProps {
  onAddStaff: () => void;
}

const EmployeeFilters = ({ onAddStaff }: EmployeeFiltersProps) => {
  return (
    <div className="flex justify-between items gap-3 my-5">
      <button className='flex items-center gap-2 text-[14px] bg-[#02367B] border-2 border-[#E5E7EB] rounded-lg px-4 py-2 text-white  hover:bg-[#016CA5] focus:outline-none focus:ring-2 focus:ring-blue-500'>
        All Roles 
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <polygon points="4,6 12,6 8,12" fill="currentColor" />
        </svg>
      </button>
      <button className='flex items-center gap-2 text-[14px] bg-[#02367B] border-2 border-[#E5E7EB] rounded-lg px-4 py-2 text-white hover:bg-[#016CA5] focus:outline-none focus:ring-2 focus:ring-blue-500'>
        All Status
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <polygon points="4,6 12,6 8,12" fill="currentColor" />
        </svg>
      </button>
      <button 
        onClick={onAddStaff}
        className='flex items-center gap-2 text-[14px] bg-[#02367B] border-2 border-[#E5E7EB] rounded-lg px-4 py-2 text-white hover:bg-[#016CA5] focus:outline-none focus:ring-2 focus:ring-blue-500'
      >
        <Plus className="w-4 h-4 mr-2" />
        Add Staff
      </button>
    </div>
  );
};

export default EmployeeFilters;
