import type { RequestHandler, RouteParams } from './$types';
import { error } from '@sveltejs/kit';
import * as ERRORS from '$lib/errors'
import { tq } from '$lib/tq'
import { User } from '$lib/user'
import { Azure } from '$lib/azure';
import { TessituraApp } from '$lib/apps/tessitura/tessitura';
import { TessituraAppServer } from '$lib/apps/tessitura/tessitura.server';

export const GET: RequestHandler = ({params, request, locals}) => {
  return tq_verb("get", params, request, locals)
}

export const POST: RequestHandler = ({params, request, locals}) => {
  return tq_verb("post", params, request, locals)}

export const PUT: RequestHandler = ({params, request, locals}) => {
  return tq_verb("put", params, request, locals)}

async function tq_verb(verb: string, params: RouteParams, request: Request, locals: App.Locals): Promise<Response> {
  let azure = new Azure()
  let user = await azure.load({identity: locals.user.userDetails})
  let tessiApp = new TessituraAppServer(Object.assign(user.apps.tessitura,{valid: false}))

  return (request.body || new ReadableStream()).getReader().read()
  .then((body) =>
    tq(verb, params.object, params.variant, body.value?.toString(), tessiApp.auth))
  .then((result) => new Response(result))
  .catch((e) => error(500, {message: e.message}))
}