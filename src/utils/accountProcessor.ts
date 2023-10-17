import { getAccounts, getMerchant, postAccounts } from "../services/method.service";
import { PROCESSING_STATUS, RATE_LIMIT_EXCEEDED_ERROR } from "../shared/constants";
import { Account, PaymentMetadataMaps } from "../shared/models";
import { XPayment } from "../shared/xml-models";
import { generateUniquePayeeId, generateUniquePayorId, getUniqueIndividualId } from "./id.generators";

// Assuming (number + routing) is unique identifier for ach account
// Assuming (number + mch_id) is unique identifier for liability account
export async function getExistingAccounts(maps: PaymentMetadataMaps, auth: string) {
  const accountResponse = await getAccounts(auth);

  if(accountResponse.ok) {
    const accounts: Account[] = (await accountResponse.json()).data;

    for(const account of accounts) {
      let uid = '';
      if(account.ach) {
        uid = account.ach.number + account.ach.routing;
      } else {
        uid = (account.liability?.mask ?? 'NONE') + (account.liability?.mch_id ?? 'NONE');
      }

      if(!(uid in maps.accountIds)) {
        maps.accountIds[uid] = account.id;
      }
    }
  }
}

export async function handleAccounts(payment: XPayment, maps: PaymentMetadataMaps, auth: string): Promise<PROCESSING_STATUS> {
  // Check for merchant id, retrive if not in cache
  if(!(payment.Payee.PlaidId in maps.merchantIds)) {
    const merchantResponse = await getMerchant(auth, payment.Payee.PlaidId);
    if(!merchantResponse.ok) {
      console.log('Issue finding merchant');
      if(merchantResponse.status == 429) {
        console.log(RATE_LIMIT_EXCEEDED_ERROR);
        return PROCESSING_STATUS.RETRY;
      }
      return PROCESSING_STATUS.UNRECOVERABLE;
    }

    const merchantBody = await merchantResponse.json();
    if(!merchantBody.data || merchantBody.data.length == 0) {
      console.log('No merchant found. Ignoring record');
      return PROCESSING_STATUS.UNRECOVERABLE;
    }
    maps.merchantIds[payment.Payee.PlaidId] = merchantBody.data[0].mch_id;
  }

  // If new Payee account
  if(!(generateUniquePayeeId(payment.Payee, maps) in maps.accountIds)) {
    console.log('Creating new payee account');
    // Create new account
    console.log(maps.merchantIds[payment.Payee.PlaidId])
    const accountResponse = await postAccounts(auth, {
      holder_id: maps.entityIds[getUniqueIndividualId(payment.Employee)],
      liability: {
        mch_id: maps.merchantIds[payment.Payee.PlaidId],
        number: payment.Payee.LoanAccountNumber,
      }
    });

    // If account successfully created, add to cache
    if(accountResponse.ok) {
      maps.accountIds[generateUniquePayeeId(payment.Payee, maps)] = (await accountResponse.json()).id;
      console.log('Success!')
    } else if(accountResponse.status == 429) {
      console.log(RATE_LIMIT_EXCEEDED_ERROR);
      return PROCESSING_STATUS.RETRY;
    } else {
      const error = await accountResponse.json()
      console.log('Error creating individual account');
      console.log(error);
      return PROCESSING_STATUS.UNRECOVERABLE;
    }
  }

  // If new corp id
  if(!(generateUniquePayorId(payment.Payor, maps) in maps.accountIds)) {
    // Create new account
    console.log('Creating new corporate account');
    const accountResponse = await postAccounts(auth, {
      holder_id: maps.entityIds[payment.Payor.EIN],
      ach: {
        routing: payment.Payor.ABARouting,
        number: payment.Payor.AccountNumber,
        // Assume checking for now
        type: 'checking'
      }
    });

    // If account successfully created, add to cache
    if(accountResponse.ok) {
      maps.accountIds[generateUniquePayorId(payment.Payor, maps)] = (await accountResponse.json()).id;
      console.log('Success!')
    } else if(accountResponse.status == 429) {
      console.log(RATE_LIMIT_EXCEEDED_ERROR);
      return PROCESSING_STATUS.RETRY;
    } else {
      console.log('Error creating corporate account');
      return PROCESSING_STATUS.UNRECOVERABLE;
    }
  }

  return PROCESSING_STATUS.OK;
}
