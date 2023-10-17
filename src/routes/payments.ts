import { Router } from 'express';
import { postPayments } from '../services/method.service';
import { AUTH_HEADER_ERROR } from '../shared/constants';

const paymentsRouter = Router();

// memoize?
paymentsRouter.post('/', (req, res) => {
  // Request validation
  if(!req.headers.authorization) return res.status(401).send(AUTH_HEADER_ERROR);
  if(!req.body.amount || !req.body.source || !req.body.destination || !req.body.description) return res.status(400).send('Must supply account, source, destination, and description');
  
  // Send request
  postPayments(req.headers.authorization, req.body).then((response) => {
    if(response.ok) {
      return res.sendStatus(200);
    } else {
      return res.status(400).send('Bad request');
    }
  });
});

export default paymentsRouter;