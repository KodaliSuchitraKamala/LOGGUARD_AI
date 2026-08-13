import { Low } from 'lowdb';
import { JSONFile } from 'lowdb/node';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const file = join(__dirname, 'db.json'); // Use 1 file instead of 3
const adapter = new JSONFile(file);
export const db = new Low(adapter);

export const initDB = async () => {
    await db.read();
    db.data ||= { users: [], logs: [], alerts: [] }; // THIS LINE FIXES [] ISSUE
    await db.write();
}