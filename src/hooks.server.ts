import { error, type Handle, redirect } from '@sveltejs/kit';
import * as errors from "$lib/errors"

export type ClientPrincipal = {
    identityProvider: string,
    userId: string,
    userDetails: string,
    userRoles: string[]
} 

export const handle: Handle = async ({ event, resolve }) => {

    const header = Buffer.from(
        event.request.headers.get('x-ms-client-principal') || 
        event.cookies.get("StaticWebAppsAuthCookie") || 
        "", 'base64');
    
    let user = JSON.parse(header.toString('ascii') || "{}") as ClientPrincipal
    
    event.locals.user = user
    
    if (! ("authenticated" in event.locals.user.userRoles)) {
        if (!event.request.url.match(/\/login$/)) {
            redirect(302, "/login")
        } else {
            error(401, errors.AUTH)
        }
    }
	const response = await resolve(event);
	return response;
};