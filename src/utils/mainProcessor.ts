import { PaymentMetadataMaps } from "../shared/models";
import { XPayment } from "../shared/xml-models";
import { getExistingAccounts, handleAccounts } from "./accountProcessor";
import { getExistingEntities, handleEntities } from "./entityProcessor";
import { getExistingPayments, handlePayments } from "./paymentProcessor";

let backoffTime = 1000;

export async function processPayments(payments: XPayment[], fileUuid: string, auth: string) {
  console.log('Processing payments');
  console.log();

  const maps: PaymentMetadataMaps = {
    entityIds: {},
    accountIds: {},
    paymentIds: {},
    merchantIds: {}
  };

  // Populate maps with existing objects
  await getExistingEntities(maps, auth);
  await getExistingAccounts(maps, auth);
  await getExistingPayments(maps, auth);

  // Process payments
  for(const payment of payments) {
    const entitySuccess = await handleEntities(payment, maps, auth);
    // Got rate limited, reprocess
    if(!entitySuccess) {
      payments.push(payment);
      await backoff();
      continue;
    }
    
    const accountsSuccess = await handleAccounts(payment, maps, auth);
    // Got rate limited, reprocess
    if(!accountsSuccess) {
      payments.push(payment);
      await backoff();
      continue;
    }

    // const paymentsSuccess = await handlePayments(payment, maps, auth);
    // // Got rate limited, reprocess
    // if(!paymentsSuccess) {
    //   payments.push(payment);
    //   await backoff();
    //   continue;
    // }
  }

  console.log(maps);
}

// Crude exponential backoff
async function backoff() {
  await new Promise(resolve => {
    setTimeout(resolve, backoffTime);
  });
  backoffTime *= 2;
}
