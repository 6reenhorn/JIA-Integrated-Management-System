import React from "react";
import { Search } from "lucide-react";

interface EmployeeSearchBarProps {
    searchTerm: string;
    setSearchTerm: (term: string) => void;
}

const EmployeeSearchBar: React.FC<EmployeeSearchBarProps> = ({ searchTerm, setSearchTerm }) => (
    <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        <input
            type="text"
            placeholder="Search Staff Member"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-90"
        />
    </div>
);

export default EmployeeSearchBar;