import { Router } from 'express';
import dbService from '../services/db.service';
import { AUTH_HEADER_ERROR, MISSING_UUID } from '../shared/constants';
import { getPayments } from '../services/method.service';

const paymentsRouter = Router();
paymentsRouter.get('/', async (req, res) => {
  if(!req.headers.authorization) return res.status(401).send(AUTH_HEADER_ERROR);
  if(!req.query.fileUuid) return res.status(400).send(MISSING_UUID);

  const paymentsResponse = await getPayments(req.headers.authorization);
  if(!paymentsResponse.ok) return res.status(paymentsResponse.status).send(await paymentsResponse.json());

  const payments = await paymentsResponse.json();
  // Filter out payments that don't match fileUuid
  const filteredPayments = payments.data.filter((payment: any) => payment.metadata && payment.metadata.file_uuid == req.query.fileUuid);

  return res.send(filteredPayments);
});

export default paymentsRouter;
