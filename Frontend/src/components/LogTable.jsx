import { getLogs } from '../services/api';

const [loading, setLoading] = useState(true);
const [error, setError] = useState(null);

useEffect(() => {
    getLogs({ level, search, page: 1 })
        .then(data => setLogs(data.logs || []))
        .catch(() => setError("Failed to load"))
        .finally(() => setLoading(false));
}, [level, search]);

if(loading) return <p>Loading...</p>
if(error) return <p className="text-red-500">{error}</p>