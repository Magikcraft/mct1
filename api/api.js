"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Communicate with Magikcraft API (GraphQL) via the endpoint app.
 */
var utils = require("utils");
var environment_1 = require("mct1/utils/environment");
var http = require("http");
var log_1 = require("mct1/log");
var log = log_1.Logger("" + [__dirname, __filename].join('/'));
function get(path, payload, callback) {
    if (!environment_1.ENDPOINT_URL)
        return;
    var url = environment_1.ENDPOINT_URL + "/scriptcraft/get";
    return http.request(// must return else lots errors
    {
        url: url,
        method: 'GET',
        params: {
            path: path,
            payload: JSON.stringify(payload),
        }
    }, function (_, responseJSON) {
        var response = JSON.parse(responseJSON);
        var res = (response && response.code === 200) ? responseJSON : undefined;
        var err = (!response || response.code !== 200) ? responseJSON : undefined;
        if (err)
            log(err);
        callback(err, res);
    });
}
exports.get = get;
function post(path, payload, callback) {
    if (!environment_1.ENDPOINT_URL)
        return;
    var url = environment_1.ENDPOINT_URL + "/scriptcraft/post";
    http.request(// must return else lots errors
    {
        url: url,
        method: 'POST',
        params: {
            path: path,
            payload: JSON.stringify(payload),
        }
    }, function (_, responseJSON) {
        var response = JSON.parse(responseJSON);
        var res = (response && response.code === 200) ? responseJSON : undefined;
        var err = (!response || response.code !== 200) ? responseJSON : undefined;
        if (err)
            log(err);
        callback(err, res);
    });
}
exports.post = post;
function logServerState() {
    var payload = {
        server: 'example.magikcraft.io',
        payload: JSON.stringify({
            players: utils.players().map(function (player) { return player.name; }),
        }),
    };
    post('/minecraft/server/state/log', payload, function (err, res) {
        if (err) {
            log('api.logServerState error', err);
        }
        else {
            log('api.logServerState success', res);
        }
    });
}
exports.logServerState = logServerState;
