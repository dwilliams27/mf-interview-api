import { METHOD_API_URL } from "../shared/constants";
import { MethodAccountsPayload, MethodEntitiesPayload, MethodGetPaymentsResponse, MethodPaymentsPayload } from "../shared/models";

const sharedHeaders = (authHeader: string) => ({
  authorization: authHeader,
  "Content-Type": "application/json"
});

export function postEntities(authHeader: string, payload: MethodEntitiesPayload) {
  return fetch(METHOD_API_URL + '/entities', {
    headers: sharedHeaders(authHeader),
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export function getEntities(authHeader: string) {
  return fetch(METHOD_API_URL + '/entities', {
    headers: sharedHeaders(authHeader),
    method: "GET"
  });
}

export function getMerchant(authHeader: string, merchantId: string) {
  return fetch(METHOD_API_URL + '/merchants?provider_id.plaid=' + merchantId, {
    headers: sharedHeaders(authHeader),
    method: "GET"
  });
}

export function postAccounts(authHeader: string, payload: MethodAccountsPayload) {
  return fetch(METHOD_API_URL + '/accounts', {
    headers: sharedHeaders(authHeader),
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export function getAccounts(authHeader: string) {
  return fetch(METHOD_API_URL + '/accounts', {
    headers: sharedHeaders(authHeader),
    method: "GET"
  });
}

export function getPayments(authHeader: string) {
  return fetch(METHOD_API_URL + '/payments', {
    headers: sharedHeaders(authHeader),
    method: "GET"
  });
}

export function postPayments(authHeader: string, payload: MethodPaymentsPayload) {
  return fetch(METHOD_API_URL + '/payments', {
    headers: sharedHeaders(authHeader),
    method: "POST",
    body: JSON.stringify(payload)
  });
}
