import { spawnSync } from 'child_process'
import { tq_login } from './config';

export async function tq(verb: string, object: string, variant?: string, query?: any, login?: string): Promise<any> {
    let flag = "";
    if (variant != null) {
        flag = "--"+variant;
    }
    console.log(`running tq (${verb} ${object} ${variant} ${JSON.stringify(query)} ${login})`)
    var tq = spawnSync('$lib/bin/tq', ["-c", "--no-highlight", verb, object, flag], 
    {
        encoding: 'utf8', 
        input: JSON.stringify(query),
        env: {"TQ_LOGIN": login || tq_login},
        timeout: 30000
    });

    if (tq.status != 0) {
        console.log(`error in tq (error: ${tq.error}, status: ${tq.status}, output: ${tq.stdout}, error: ${tq.stderr})`)
        throw(tq.stderr)
    } else {
        return JSON.parse(tq.stdout)
    }

};