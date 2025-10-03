import LayoutCard from "../../layout/LayoutCard";

const AttendanceStats = () => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <LayoutCard title="Present">
                <div className="text-2xl font-bold text-gray-900">
                    5
                </div>
            </LayoutCard>
            <LayoutCard title="Absent">
                <div className="text-2xl font-bold text-gray-900">
                    4
                </div>
            </LayoutCard>
            <LayoutCard title="On Leave">
                <div className="text-2xl font-bold text-gray-900">
                    0
                </div>
            </LayoutCard>
        </div>
    );
}

export default AttendanceStats;