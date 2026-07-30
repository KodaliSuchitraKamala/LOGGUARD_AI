import { getStats } from "../services/api";

const [stats, setStats] = useState({});

useEffect(() => {
    getStats().then(setStats).finally(() => setLoading(false));
}, []);