import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

export default function ErrorTrendChart({ data }) {
  const chartData = {
    labels: data.map(d => d.date),
    datasets: [{
      label: 'Errors per Day',
      data: data.map(d => d.errors),
      borderColor: 'rgb(239, 68, 68)',
      backgroundColor: 'rgba(239, 68, 68, 0.5)',
    }]
  };
  return <Line data={chartData} />;
}