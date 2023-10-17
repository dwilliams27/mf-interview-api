
export interface XPayment {
  Employee: XEmployee;
  Payor: XPayor;
  Payee: XPayee;
  Amount: string;
}

export interface XEmployee {
  DunkinId?: string;
  DunkinBranch?: string;
  FirstName?: string;
  LastName?: string;
  DOB?: string;
  PhoneNumber?: string;
}

export interface XPayor {
  DunkinId: string;
  ABARouting: string;
  AccountNumber: string;
  Name: string;
  DBA: string;
  EIN: string;
  Address: XAddress;
}

export interface XAddress {
  Line1: string;
  City: string;
  State: string;
  Zip: string;
}

export interface XPayee {
  PlaidId: string;
  LoanAccountNumber: string;
}
