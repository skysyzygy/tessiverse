import { env } from '$env/dynamic/private'
import type { AppServer } from './apps.server';
import { PlanStepAppServer } from './apps/planStep/planStep.server';
import { TessituraAppServer } from './apps/tessitura/tessitura.server';

export const key_vault_url = env.AZURE_KEY_VAULT_URL || "";

type AppServerConstraint<T> = {
    [K in keyof T]: K extends infer S ? S extends string ? AppServer<S,any,any> : never : never
}

export class AppServers implements AppServerConstraint<AppServers> {
    [k: string]: AppServer<string,any,any>
    tessitura = new TessituraAppServer()
    planStep = new PlanStepAppServer()
} 

