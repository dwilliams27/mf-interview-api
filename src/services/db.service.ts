import pgPromise from "pg-promise";
import { randomUUID } from "crypto";

const INSERT_PMT_FILE = 'INSERT INTO pmt_files (file_uuid, file_name, file_status, failed_payments) VALUES ($1, $2, $3, $4)';
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

    await this.connection!.query(INSERT_PMT_FILE, [fileUuid, fileName, 'In progress', 0]);

    return fileUuid;
  }

  async getPaymentFiles() {
    if(!this.connection) {
      await this.initializeConnection();
    }

    const files = await this.connection!.query(GET_PMT_FILES);
    
    return files;
  }

  async updatePaymentFileState(fileUuid: string, failedPayments: number, status: string) {
    if(!this.connection) {
      await this.initializeConnection();
    }

    const res = await this.connection!.query('UPDATE pmt_files SET file_status = $1, failed_payments = $2 WHERE file_uuid = $3', [status, failedPayments, fileUuid]);
    console.log(res)
  }
}

const dbService = new DbService();

export default dbService;
