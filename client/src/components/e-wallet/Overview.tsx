
interface StatCardProps {
  title: string;
  amount: string;
  subtitle: string;
  bgColor?: string;
  textColor?: string;
  subtitleColor?: string;
}

interface SummaryCardProps {
  title: string;
  data: Array<{ label: string; value: string }>;
}

interface RecordCardProps {
  title: string;
  count: string;
}

const Overview = () => {
  const StatCard = ({ title, amount, subtitle, bgColor = 'bg-white', textColor = 'text-blue-600', subtitleColor = 'text-gray-500' }: StatCardProps) => (
    <div className={`${bgColor} rounded-lg p-6 border border-gray-300`}>
      <h3 className="text-gray-500 font-medium mb-2">{title}</h3>
      <div className={`text-3xl font-bold ${textColor} mb-1`}>
        {amount}
      </div>
      <div className={`text-sm ${subtitleColor}`}>
        {subtitle}
      </div>
    </div>
  );

  const SummaryCard = ({ title, data }: SummaryCardProps) => (
    <div className="bg-white rounded-lg p-6 border border-gray-300">
      <h3 className="text-gray-500 font-medium mb-4">{title}</h3>
      <div className="space-y-3">
        {data.map((item, index) => (
          <div key={index} className="flex justify-between items-center">
            <span className="text-gray-500 text-sm">{item.label}</span>
            <span className={`font-medium ${item.value.startsWith('-') ? 'text-red-500' : 'text-gray-900'}`}>
              {item.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );

  const RecordCard = ({ title, count }: RecordCardProps) => (
    <div className="bg-white rounded-lg p-6 border border-gray-300 text-center">
      <h3 className="text-gray-500 font-medium mb-2">{title}</h3>
      <div className="text-4xl font-bold text-gray-900">
        {count}
      </div>
    </div>
  );

  const gcashData = [
    { label: 'Total Cash-In', value: '₱7,500.00' },
    { label: 'Total Cash-Out', value: '-₱500.00' },
    { label: 'Service Charge', value: '₱10.00' },
    { label: 'Net Amount', value: '₱7,010.00' }
  ];

  const paymayaData = [
    { label: 'Total Cash-In', value: '₱7,500.00' },
    { label: 'Total Cash-Out', value: '-₱500.00' },
    { label: 'Service Charge', value: '₱10.00' },
    { label: 'Net Amount', value: '₱7,010.00' }
  ];

  const juanpayData = [
    { label: 'Total Beginning', value: '₱15,500.00' },
    { label: 'Total Ending', value: '-₱8,400.00' },
    { label: 'Service Charge', value: '₱10.00' },
    { label: 'Total Sales', value: '₱7,100.00' },
    { label: 'Average per Record', value: '₱2,366.67' }
  ];

  return (
    <div className="space-y-6">
      {/* Main Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Balance"
          amount="₱14,480.00"
          subtitle="Combined Funds"
          bgColor="bg-green-500"
          textColor="text-white"
          subtitleColor="text-green-100"
        />
        <StatCard
          title="GCash Net"
          amount="₱7,380.00"
          subtitle="After Charges"
          textColor="text-blue-600"
        />
        <StatCard
          title="JuanPay"
          amount="₱7,380.00"
          subtitle="Total Revenue"
          textColor="text-green-600"
        />
        <StatCard
          title="Today's Record"
          amount="0"
          subtitle="Active Today"
          textColor="text-red-500"
        />
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <SummaryCard title="GCash Summary" data={gcashData} />
        <SummaryCard title="PayMaya Summary" data={paymayaData} />
        <SummaryCard title="JuanPay Summary" data={juanpayData} />
      </div>

      {/* Records Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        <RecordCard title="Total Records" count="9" />
        <RecordCard title="GCash Records" count="3" />
        <RecordCard title="JuanPay Records" count="3" />
        <RecordCard title="PayMaya Records" count="3" />
      </div>
    </div>
  );
};

export default Overview;