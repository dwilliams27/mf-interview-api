import { Router } from 'express';
import { postAccounts } from '../services/method.service';
import { AUTH_HEADER_ERROR } from '../shared/constants';

const accountsRouter = Router();

// memoize?
accountsRouter.post('/', (req, res) => {
  // Request validation
  if(!req.headers.authorization) return res.status(401).send(AUTH_HEADER_ERROR);
  if(!req.body.holder_id) return res.status(400).send('Must supply holder_id');
  if(!req.body?.ach && !req.body.liability) return res.status(401).send('Must specify either ach or liability.');
  
  // Send request
  postAccounts(req.headers.authorization, req.body).then((response) => {
    if(response.ok) {
      return res.sendStatus(200);
    } else {
      return res.status(400).send('Bad request');
    }
  });
});

export default accountsRouter;
