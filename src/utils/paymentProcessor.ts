import { getEntities, getPayments, postEntities, postPayments } from "../services/method.service";
import { PROCESSING_STATUS, RATE_LIMIT_EXCEEDED_ERROR } from "../shared/constants";
import { Payment, PaymentMetadataMaps } from "../shared/models";
import { XEmployee, XPayment } from "../shared/xml-models";
import { generateUniquePayeeId, generateUniquePayorId, getUniquePaymentId } from "./id.generators";

// Assuming (source + destination + amount + description) is unique per payment
export async function getExistingPayments(maps: PaymentMetadataMaps, auth: string) {
  const paymentsResponse = await getPayments(auth);

  if(paymentsResponse.ok) {
    const payments: Payment[] = (await paymentsResponse.json()).data;

    for(const payment of payments) {
      let uid = '';
      
      uid = getUniquePaymentId(payment, maps);

      if(!(uid in maps.paymentIds)) {
        maps.paymentIds[uid] = payment.id;
      }
    }
  }
}

export async function handlePayments(payment: XPayment, maps: PaymentMetadataMaps, auth: string): Promise<PROCESSING_STATUS> {
  // If new payment
  if(!(getUniquePaymentId(payment, maps) in maps.entityIds)) {
    // Create new payment
    console.log('Creating new payment');
    const entityResponse = await postPayments(auth, {
      source: maps.accountIds[generateUniquePayorId(payment.Payor, maps)],
      destination: maps.accountIds[generateUniquePayeeId(payment.Payee, maps)],
      amount: payment.Amount,
      description: 'Loan Payment'
    });

    // If payment successfully created, add to map
    if(entityResponse.ok) {
      maps.entityIds[getUniquePaymentId(payment, maps)] = (await entityResponse.json()).id;
      console.log('Success!')
    } else if(entityResponse.status == 429) {
      console.log(RATE_LIMIT_EXCEEDED_ERROR);
      return PROCESSING_STATUS.RETRY;
    } else {
      const error = await entityResponse.json();
      console.log('Error creating payment');
      console.log(error);
      return PROCESSING_STATUS.UNRECOVERABLE;
    }
  }

  return PROCESSING_STATUS.OK;
}
