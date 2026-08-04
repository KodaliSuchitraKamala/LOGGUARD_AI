import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, plugins } from 'chart.js';
ChartJS.register(ArcElement, Tooltip, Legend);

export default function LogLevelPie({ logs }) {
  const counts = {
    INFO: logs.filter(l => l.level?.toUpperCase() === 'INFO').length,
    WARN: logs.filter(l => l.level?.toUpperCase() === 'WARN').length,
    ERROR: logs.filter(l => l.level?.toUpperCase() === 'ERROR').length,
    CRITICAL: logs.filter(l => l.level?.toUpperCase() === 'CRITICAL').length,
  };

  const total = Object.values(counts).reduce((a,b) => a + b, 0);
  
  //   Empty State
  if(total === 0) {
    return (
        <div className='flex items-center justify-center h-64 text-gray-400'>
            <p className='mb-2'>No Log Data Found</p>
            <p className='text-sm'>Go To Dashboard and Upload a Log File First</p>
        </div>
    );
  }

  const data = {
    labels: Object.keys(counts),
    datasets: [{
        labels: 'Log Count',
        data: Object.values(counts),
        backgroundColor: ['#10B981', '#F59E0B', '#EF4444', '#F97316'],
        borderColor: '#1F2937',
        borderWidth: 2,
    }]
  };

  return <Pie data={data} options={{ responsive: true, plugins: { legend: { position: 'bottom', labels: { color: 'white' } } } }} />;
}