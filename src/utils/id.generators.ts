import { Individual, Payment, PaymentMetadataMaps } from "../shared/models"
import { XEmployee, XPayee, XPayment, XPayor } from "../shared/xml-models"

export function generateUniquePayeeId(payee: XPayee, maps: PaymentMetadataMaps) {
  return (payee.LoanAccountNumber.slice(-4) + maps.merchantIds[payee.PlaidId])
}

export function generateUniquePayorId(payor: XPayor, maps: PaymentMetadataMaps) {
  return (payor.AccountNumber + payor.ABARouting)
}

export function getUniqueIndividualId(individual: Individual | XEmployee) {
  if('first_name' in individual) {
    individual = individual as Individual;
    return (individual.first_name ?? 'NONE') + (individual.last_name ?? 'NONE') + (individual.dob ?? 'NONE');
  } else {
    individual = individual as XEmployee;
    return (individual.FirstName ?? 'NONE') + (individual.LastName ?? 'NONE') + (formatDOB(individual.DOB) ?? 'NONE');
  }
}

// Could make pmt desc include date for better uniqueness
export function getUniquePaymentId(payment: Payment | XPayment, maps: PaymentMetadataMaps) {
  if('Employee' in payment) {
    payment = payment as XPayment;
    return (maps.accountIds[generateUniquePayorId(payment.Payor, maps)] + maps.accountIds[generateUniquePayeeId(payment.Payee, maps)] + payment.Amount + ('Loan Payment'));
  } else {
    payment = payment as Payment;
    return (payment.source + payment.destination + payment.amount + payment.description);
  }
}

// MM-DD-YYYY -> YYYY-MM-DD
export function formatDOB(dob: string | undefined) {
  if(!dob) return '';

  const split = dob.split('-');
  if(split.length != 3) return dob;

  return `${split[2]}-${split[0]}-${split[1]}`;
}
