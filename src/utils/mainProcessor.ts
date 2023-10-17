import { PROCESSING_STATUS } from "../shared/constants";
import { PaymentMetadataMaps } from "../shared/models";
import { XPayment } from "../shared/xml-models";
import { getExistingAccounts, handleAccounts } from "./accountProcessor";
import { getExistingEntities, handleEntities } from "./entityProcessor";
import { generateUniqueFailedPaymentId } from "./id.generators";
import { getExistingPayments, handlePayments } from "./paymentProcessor";

let backoffTime = 1000;

export async function processPayments(payments: XPayment[], fileUuid: string, auth: string) {
  console.log('Processing payments');

  const maps: PaymentMetadataMaps = {
    entityIds: {},
    accountIds: {},
    paymentIds: {},
    merchantIds: {}
  };

  const failedPayments = new Set<string>();

  // Populate maps with existing objects
  await getExistingEntities(maps, auth);
  console.log('Existing entities retrieved');
  await getExistingAccounts(maps, auth);
  console.log('Existing accounts retrieved');
  await getExistingPayments(maps, auth);
  console.log('Existing payments retrieved');

  // Process payments
  for(const payment of payments) {
    // If any processing step results in a retry or failure, move on to next payment
    if(!(await processStep(payment, payments, failedPayments, maps, auth, fileUuid, handleEntities))) continue;
    if(!(await processStep(payment, payments, failedPayments, maps, auth, fileUuid, handleAccounts))) continue;
    if(!(await processStep(payment, payments, failedPayments, maps, auth, fileUuid, handlePayments))) continue;
  }

  console.log('Payments processed');
  console.log('Failed payments:');
  console.log(failedPayments);
}

async function processStep(
  payment: XPayment,
  payments: XPayment[],
  failedPayments: Set<string>,
  maps: PaymentMetadataMaps, 
  auth: string, 
  uuid: string,
  handleFunc: (payment: XPayment, maps: PaymentMetadataMaps, auth: string, uuid: string) => {}
) {
  const paymentsStatus = await handleFunc(payment, maps, auth, uuid);
  // Got rate limited, reprocess
  if(paymentsStatus == PROCESSING_STATUS.RETRY) {
    payments.push(payment);
    await backoff();
    return false;
  } else if(paymentsStatus == PROCESSING_STATUS.UNRECOVERABLE) {
    failedPayments.add(generateUniqueFailedPaymentId(payment));
    return false;
  }
  return true;
}

// Crude exponential backoff
async function backoff() {
  await new Promise(resolve => {
    setTimeout(resolve, backoffTime);
  });
  backoffTime *= 2;
}


