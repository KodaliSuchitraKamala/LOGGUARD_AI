import { Timestamp } from "mongodb";

export function parseLogFile(content) {
    const lines = content.split('\n').filter(line => line.trim()!== '');

    return lines.map(line => {
        // Example format: [2026-01-10 10:23:45] ERROR: Database connection failed
        const regex = /\[(.*?)\]\s*(INFO|WARNING|ERROR|CRITICAL):\s*(.*)/i;
        const match = line.match(regex);

        if(match) {
            return {
                id: Date.now() + Math.random(),
                timestamp: match[1],
                level: match[2].toUpperCase(),
                message: match[3],
                raw: line
            }
        }
        // Fallbacke for unformatted lines
        return {
            id: Date.now() + Math.random(),
            timestamp: new Date().toISOString(),
            level: 'INFO',
            message: line,
            raw: line
        }
    });
};

export function classifyAlert(log) {
    if (log.level === 'CRITICAL') return 'CRITICAL';
    if (log.level === 'ERROR') return 'ERROR';
    if (log.level === 'WARNING') return 'WARNING';
    return 'INFO';
}