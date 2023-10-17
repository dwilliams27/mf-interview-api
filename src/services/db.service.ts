import pgPromise from "pg-promise";
import { randomUUID } from "crypto";

const INSERT_PMT_FILE = 'INSERT INTO pmt_files (file_uuid, file_name, file_status, failed_payments) VALUES ($1, $2, $3, $4)';
const GET_PMT_FILES = 'SELECT * FROM pmt_files';
const UPDATE_PMT_FILE = 'UPDATE pmt_files SET file_status = $1, failed_payments = $2 WHERE file_uuid = $3';
const INSERT_BRNCH_AMT = `INSERT INTO brnch_funds (file_uuid, src_brnch, amt) VALUES ($1, $2, $3)`;
const INSERT_SRC_AMT = `INSERT INTO src_funds (file_uuid, src_acct, amt) VALUES ($1, $2, $3)`;
const GET_BRNCH_AMTS = `SELECT * FROM brnch_funds WHERE file_uuid = $1`;
const GET_SRC_AMTS = `SELECT * FROM src_funds WHERE file_uuid = $1`;

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

    await this.connection!.query(UPDATE_PMT_FILE, [status, failedPayments, fileUuid]);
  }

  async addPaymentFileBranchAmt(fileUuid: string, branch: string, amount: number) {
    if(!this.connection) {
      await this.initializeConnection();
    }

    await this.connection!.query(INSERT_BRNCH_AMT, [fileUuid, branch, amount]);
  }

  async getPaymentFileBranchAmt(fileUuid: string) {
    if(!this.connection) {
      await this.initializeConnection();
    }

    const amounts = await this.connection!.query(GET_BRNCH_AMTS, [fileUuid]);
    
    return amounts;
  }

  async addPaymentFileSourceAmt(fileUuid: string, sourceAccount: string, amount: number) {
    if(!this.connection) {
      await this.initializeConnection();
    }

    await this.connection!.query(INSERT_SRC_AMT, [fileUuid, sourceAccount, amount]);
  }

  async getPaymentFileSourceAmt(fileUuid: string) {
    if(!this.connection) {
      await this.initializeConnection();
    }

    const amounts = await this.connection!.query(GET_SRC_AMTS, [fileUuid]);
    
    return amounts;
  }
}

const dbService = new DbService();

export default dbService;
