export interface MethodEntitiesPayload {
  type: "individual" | "llc",
  individual?: Individual;
  corporation?: Corporation;
  address?: Address;
}

export interface MethodGetEntitiesResponse {
  data: Entity[];
}

export interface Entity {
  id: string;
  type: "individual" | "llc";
  individual?: Individual;
  corporation?: Corporation;
  receive_only?: boolean;
  address?: Address;
  capabilities?: string[];
  available_capabilities?: string[];
  pending_capabilities?: string[];
  error?: string;
  status: "active" | "inactive";
  metadata?: any;
  created_at: string;
  updated_at: string;
}

export interface MethodAccountsPayload {
  holder_id: string;
  ach?: Ach;
  liability?: Liability;
}

export interface MethodPaymentsPayload {
  amount: number;
  source: string;
  destination: string;
  description: string;
  metadata?: { [key: string]: string };
}

export interface MethodGetPaymentsResponse {
  data: Payment[];
}

export interface Payment {
  id: string;
  reversal_id: string;
  source_trace_id: string;
  destination_trace_id: string;
  source: string;
  destination: string;
  amount: number;
  description: string;
  status: string;
  error: string;
  metadata: any;
  estimated_completion_date: string;
  source_settlement_date: string;
  destination_settlement_date: string;
  fee: any;
  created_at: string;
  updated_at: string;
}

export interface Corporation {
  name: string;
  dba?: string;
  ein: string;
  owners: Owner[];
}

export interface Owner {
  first_name: string;
  last_name: string;
  phone: string;
  email: string;
  dob: string;
  address: Address;
}

export interface Address {
  line1: string;
  line2?: string;
  city: string;
  state: string;
  zip: string;
}

export interface Ach {
  routing: string;
  number: string;
  type: string;
}

export interface Liability {
  mch_id: string;
  number?: string;
  mask?: string;
}

export interface Individual {
  first_name: string;
  last_name: string;
  phone: string;
  email?: string;
  dob?: string;
}

export interface PaymentMetadataMaps {
  entityIds: { [key: string]: string };
  accountIds: { [key: string]: string };
  paymentIds: { [key: string]: string };
  merchantIds: { [key: string]: string };
  branchAmounts: { [key: string]: number };
  sourceAmounts: { [key: string]: number };
}

export interface Account {
  id: string;
  holder_id: string;
  type: string;
  ach?: Ach;
  liability?: Liability;
  clearing?: any;
  metadata?: any;
  status: string;
  capabilities: string[];
  error?: string;
  created_at: string;
  updated_at: string;
}
