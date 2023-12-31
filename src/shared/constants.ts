export const METHOD_API_URL = 'https://dev.methodfi.com';
export const AUTH_HEADER_ERROR = 'Backend unable to generate authorization header. Did you specify METHOD_API_KEY in your .env?';
export const RATE_LIMIT_EXCEEDED_ERROR = 'Rate limit exceeded; backing off.';
export const MISSING_UUID = 'Missing fileUuid query param';
export const PAYMENT_DESCRIPTION = 'Loan pmt';

export const enum PROCESSING_STATUS {
  OK = 'OK',
  RETRY = 'RETRY',
  UNRECOVERABLE = 'UNRECOVERABLE'
}
