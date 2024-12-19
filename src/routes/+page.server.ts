import type { PageServerLoad, Actions } from './$types';
import * as server from '$lib/config.server'
import { Azure } from '$lib/azure';
import type { AppServer } from '$lib/apps.server';

let servers = new server.AppServers()

type AppPromises = {
    [K in keyof server.AppServers]: Promise<server.AppServers[K]["data"]>
}

function objectMap<I extends any,O extends any>(o: {[k: string]: I},f: (i: I) => O): {[k: string]: O} {
    return Object.fromEntries(Object.entries(o).map(([k,v]) => [k,f(v)]))
}

export const load: PageServerLoad = async ( { locals }) => {
    let backend = new Azure()
    let user = backend.load({identity: locals.user.userDetails})
    let appData = objectMap(servers, (server: AppServer<string,any,any>) => user.then((user) => server.load(user))) as AppPromises
    return {userData: user, appData: appData}
}

export const actions: Actions = 
    objectMap(servers, (server) => async ({request, locals}) => {
            let backend = new Azure()
            Promise.all([request.formData(), backend.load({identity: locals.user.userDetails})])
            .then(([data,user]) => server.save(user, data))
            .then((failure) => failure)
        } 
    )


