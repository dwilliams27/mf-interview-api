import pgPromise from "pg-promise";
import { randomUUID } from "crypto";

const INSERT_PMT_FILE = 'INSERT INTO pmt_files (file_uuid, file_name, file_status) VALUES ($1, $2, $3)';
const GET_PMT_FILES = 'SELECT * FROM pmt_files';

class DbService {
  db: pgPromise.IDatabase<{}, any>;
  connection: pgPromise.IConnected<{}, any> | null = null;

  constructor() {
    console.log('Initializing DB service...');
    const pgp = pgPromise();
    const params = {
      host: 'localhost',
      port: 5432,
      database: 'method_db',
      user: 'admin',
      password: 'root',
      allowExitOnIdle: true
    };
    
    this.db = pgp(params);
  }

  async initializeConnection() {
    this.connection = await this.db.connect();
  }

  async addPaymentFile(fileName: string) {
    if(!this.connection) {
      await this.initializeConnection();
    }

    const fileUuid = randomUUID();

    await this.connection!.query(INSERT_PMT_FILE, [fileUuid, fileName, 'processing']);

    return fileUuid;
  }

  async getPaymentFiles() {
    if(!this.connection) {
      await this.initializeConnection();
    }

    const files = await this.connection!.query(GET_PMT_FILES);

    console.log(files);
    
    return files;
  }
}

const dbService = new DbService();

export default dbService;
