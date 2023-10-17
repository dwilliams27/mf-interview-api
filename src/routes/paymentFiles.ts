
import { Router } from 'express';
import dbService from '../services/db.service';
import { processPayments } from '../utils/mainProcessor';
import { AUTH_HEADER_ERROR } from '../shared/constants';

const paymentFilesRouter = Router();
paymentFilesRouter.post('/', async (req, res) => {
  if(!req.headers.authorization) return res.status(401).send(AUTH_HEADER_ERROR);
  if(!req.body || !req.body.fileName || !req.body.payments) return res.status(400).send('Missing fileName or payments in body');

  // Add new file to DB
  const uuid = await dbService.addPaymentFile(req.body.fileName);

  // Process payments
  processPayments(req.body.payments, uuid, req.headers.authorization);

  return res.send(200).send(uuid);
});

export default paymentFilesRouter;