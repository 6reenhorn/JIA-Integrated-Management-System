import LayoutCard from "../../layout/LayoutCard";

const AttendanceStats = () => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <LayoutCard>
                <div>
                    Employee Stats
                </div>
            </LayoutCard>
            <LayoutCard>
                <div>
                    Attendance Stats
                </div>
            </LayoutCard>
            <LayoutCard>
                <div>
                    Leave Stats
                </div>
            </LayoutCard>
        </div>
    );
}

export default AttendanceStats;