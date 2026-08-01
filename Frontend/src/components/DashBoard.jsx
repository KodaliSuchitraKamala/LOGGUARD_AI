    import FileUpload from '../components/FileUpload';
    import { useState } from 'react';

    function Dashboard() {
      const [logs, setLogs] = useState([]);
      return <FileUpload onLogsLoaded={setLogs} />
    }