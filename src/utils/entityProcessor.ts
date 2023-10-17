import { getEntities, postEntities } from "../services/method.service";
import { PROCESSING_STATUS, RATE_LIMIT_EXCEEDED_ERROR } from "../shared/constants";
import { Entity, PaymentMetadataMaps } from "../shared/models";
import { XPayment } from "../shared/xml-models";
import { formatDOB, getUniqueIndividualId } from "./id.generators";

// Assuming (first_name + last_name + dob) is unique per individual
// Assuming EIN is unique for corporations
export async function getExistingEntities(maps: PaymentMetadataMaps, auth: string) {
  const entityResponse = await getEntities(auth);

  if(entityResponse.ok) {
    const entities: Entity[] = (await entityResponse.json()).data;

    for(const entity of entities) {
      let uid = '';
      if(entity.corporation) {
        uid = entity.corporation.ein;
      } else {
        uid = getUniqueIndividualId(entity.individual ?? {});
      }

      if(!(uid in maps.entityIds)) {
        maps.entityIds[uid] = entity.id;
      }
    }
  }
}

export async function handleEntities(payment: XPayment, maps: PaymentMetadataMaps, auth: string, uuid: string): Promise<PROCESSING_STATUS> {
  // If new Employee
  if(!(getUniqueIndividualId(payment.Employee) in maps.entityIds)) {
    // Create new entity
    console.log('Creating new individual entity');
    const entityResponse = await postEntities(auth, {
      type: "individual",
      individual: {
        first_name: payment.Employee?.FirstName ?? '',
        last_name: payment.Employee?.LastName ?? '',
        phone: '15121231111',
        dob: formatDOB(payment.Employee?.DOB)
      }
    });

    // If entity successfully created, add to map
    if(entityResponse.ok) {
      maps.entityIds[getUniqueIndividualId(payment.Employee)] = (await entityResponse.json()).data.id;
      console.log('Individual entity created')
    } else if(entityResponse.status == 429) {
      console.log(RATE_LIMIT_EXCEEDED_ERROR);
      return PROCESSING_STATUS.RETRY;
    } else {
      const error = await entityResponse.json();
      console.log('Error creating individual entity');
      return PROCESSING_STATUS.UNRECOVERABLE;
    }
  }

  // If new corp id
  if(!(payment.Payor.EIN in maps.entityIds)) {
    // Create new entity
    console.log('Corporate entity created');
    const entityResponse = await postEntities(auth, {
      type: "llc",
      corporation: {
        name: payment.Payor.Name,
        dba: payment.Payor.DBA,
        ein: payment.Payor.EIN,
        owners: []
      },
      // Address provided in sample file is wrong (zip not in provided state) so Method api always returns 400...
      // Hardcoding for now
      address: { 
        line1: payment.Payor.Address.Line1, 
        city: payment.Payor.Address.City, 
        state: 'IA',
        zip: '50002' 
      }
    });

    // If entity successfully created, add to map
    if(entityResponse.ok) {
      maps.entityIds[payment.Payor.EIN] = (await entityResponse.json()).data.id;
      console.log('Created corporate entity');
    } else if(entityResponse.status == 429) {
      console.log(RATE_LIMIT_EXCEEDED_ERROR);
      return PROCESSING_STATUS.RETRY;
    } else {
      const error = await entityResponse.json();
      console.log('Error creating corporate entity');
      return PROCESSING_STATUS.UNRECOVERABLE;
    }
  }

  return PROCESSING_STATUS.OK;
}
