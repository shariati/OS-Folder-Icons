import config from '../config';
import { DatabaseAdapter } from './types';
import { jsonAdapter } from './json-adapter';
import { firestoreAdapter } from './firestore-adapter';

const db: DatabaseAdapter = config.isLocal ? jsonAdapter : firestoreAdapter;

export const getDB = () => db.getDB();
export const saveDB = (data: any) => db.saveDB(data);

export default db;
