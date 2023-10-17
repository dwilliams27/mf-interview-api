import { getPayments, postPayments } from "../services/method.service";
import { PAYMENT_DESCRIPTION, PROCESSING_STATUS, RATE_LIMIT_EXCEEDED_ERROR } from "../shared/constants";
import { Payment, PaymentMetadataMaps } from "../shared/models";
import { XPayment } from "../shared/xml-models";
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

export async function handlePayments(payment: XPayment, maps: PaymentMetadataMaps, auth: string, fileUuid: string): Promise<PROCESSING_STATUS> {
  // If new payment
  if(!(getUniquePaymentId(payment, maps) in maps.paymentIds)) {
    // Create new payment
    console.log('Creating new payment');
    const paymentResponse = await postPayments(auth, {
      source: maps.accountIds[generateUniquePayorId(payment.Payor, maps)],
      destination: maps.accountIds[generateUniquePayeeId(payment.Payee, maps)],
      amount: Math.floor(parseFloat(payment.Amount.substring(1)) * 100),
      description: PAYMENT_DESCRIPTION,
      metadata: {
        file_uuid: fileUuid
      }
    });

    // If payment successfully created, add to map
    if(paymentResponse.ok) {
      maps.paymentIds[getUniquePaymentId(payment, maps)] = (await paymentResponse.json()).data.id;
      console.log('Payment successfully created')
    } else if(paymentResponse.status == 429) {
      console.log(RATE_LIMIT_EXCEEDED_ERROR);
      return PROCESSING_STATUS.RETRY;
    } else {
      const error = await paymentResponse.json();
      console.log('Error creating payment');
      console.log(error);
      return PROCESSING_STATUS.UNRECOVERABLE;
    }
  }

  // Add source and branch reporting metadata
  if(!(generateUniquePayorId(payment.Payor, maps) in maps.sourceAmounts)) {
    maps.sourceAmounts[generateUniquePayorId(payment.Payor, maps)] = 0;
  }
  maps.sourceAmounts[generateUniquePayorId(payment.Payor, maps)] += parseFloat(payment.Amount.substring(1));

  if(payment.Employee.DunkinBranch) {
    if(!(payment.Employee.DunkinBranch in maps.branchAmounts)) {
      maps.branchAmounts[payment.Employee.DunkinBranch] = 0;
    }
    maps.branchAmounts[payment.Employee.DunkinBranch] += parseFloat(payment.Amount.substring(1));
  }

  return PROCESSING_STATUS.OK;
}
