/**
 * Communicate with Magikcraft API (GraphQL) via the endpoint app.
 */
import utils = require('utils')
import { ENDPOINT_URL } from '@magikcraft/mct1/utils/environment'
import * as http from 'http'
import { Logger } from '@magikcraft/mct1/log'
const log = Logger(__filename)

export function get(path, payload, callback: (err: any, res: any) => any) {
    if (!ENDPOINT_URL) return

    const url = `${ENDPOINT_URL}/scriptcraft/get`
    return http.request( // must return else lots errors
        {
            url,
            method: 'GET',
            params: {
                path,
                payload: JSON.stringify(payload),
            }
        },
        (_, responseJSON) => {
            const response = JSON.parse(responseJSON)
            const res = (response && response.code === 200) ? responseJSON : undefined
            const err = (!response || response.code !== 200) ? responseJSON : undefined
            if (err) log(err)
            callback(err, res)
        }
    )
}

export function post(path, payload, callback: (err: any, res: any) => any) {
    if (!ENDPOINT_URL) return

    const url = `${ENDPOINT_URL}/scriptcraft/post`
    http.request( // must return else lots errors
        {
            url,
            method: 'POST',
            params: {
                path,
                payload: JSON.stringify(payload),
            }
        },
        (_, responseJSON) => {
            const response = JSON.parse(responseJSON)
            const res = (response && response.code === 200) ? responseJSON : undefined
            const err = (!response || response.code !== 200) ? responseJSON : undefined
            if (err) log(err)
            callback(err, res)
        }
    )
}

export function logServerState() {

    const payload = {
        server: 'example.magikcraft.io',
        payload: JSON.stringify({
            players: utils.players().map(player => player.name),
        }),
    }

    post('/minecraft/server/state/log', payload, (err, res) => {
        if (err) {
            log('api.logServerState error', err)
        } else {
            log('api.logServerState success', res)
        }
    })
}

