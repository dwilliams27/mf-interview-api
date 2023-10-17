import { Router } from 'express';
import { postEntities } from '../services/method.service';
import { Owner } from '../shared/models';
import dbService from '../services/db.service';
import { AUTH_HEADER_ERROR } from '../shared/constants';

const entitiesRouter = Router();
dbService.getPaymentFiles();

entitiesRouter.post('/', (req, res) => {
  // Request validation
  if(!req.headers.authorization) return res.status(401).send(AUTH_HEADER_ERROR);
  if(!req.body) return res.status(400).send('Bad request');
  if(!req.body.individual && !req.body.corporation) return res.status(400).send('Must supply individual or corporation');

  if(req.body.individual) {
    req.body.individual.phone = '+15121231111';
  } else {
    if(!req.body.corporation.owners) return res.status(400).send('Must supply owners');
    if(!req.body.address) return res.status(400).send('Must supply corporate address');

    req.body.corporation.owners = req.body.corporation.owners.map((owner: Owner) => ({ ...owner, phoneNumber: '+15121231111' }));
  }
  
  // Send request
  postEntities(req.headers.authorization, req.body).then((response) => {
    if(response.ok) {
      return res.sendStatus(200);
    } else {
      return res.status(400).send('Bad request');
    }
  });
});

export default entitiesRouter;
