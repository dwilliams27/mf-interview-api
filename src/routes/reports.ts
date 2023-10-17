import { Router } from 'express';
import dbService from '../services/db.service';
import { AUTH_HEADER_ERROR, MISSING_UUID } from '../shared/constants';

const reportsRouter = Router();
reportsRouter.get('/source', async (req, res) => {
  if(!req.headers.authorization) return res.status(401).send(AUTH_HEADER_ERROR);
  if(!req.query.fileUuid) return res.status(400).send(MISSING_UUID);

  const amounts = await dbService.getPaymentFileSourceAmt(req.query.fileUuid as string);

  return res.send(amounts);
});

reportsRouter.get('/branch', async (req, res) => {
  if(!req.headers.authorization) return res.status(401).send(AUTH_HEADER_ERROR);
  if(!req.query.fileUuid) return res.status(400).send(MISSING_UUID);

  const amounts = await dbService.getPaymentFileBranchAmt(req.query.fileUuid as string);

  return res.send(amounts);
});

export default reportsRouter;
