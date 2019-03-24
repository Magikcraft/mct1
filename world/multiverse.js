'use strict'
Object.defineProperty(exports, '__esModule', { value: true })
var log_1 = require('../log')
var fs = require('../utils/fs')
var log = log_1.Logger(__filename)
var Multiverse = function() {
    return __plugin.server.getPluginManager().getPlugin('Multiverse-Core')
}
var getWorldContainer = function() {
    return __plugin.server.getWorldContainer()
}
exports.cloneWorld = function(source, target) {
    return Multiverse().cloneWorld(source, target, 'normal')
}
exports.destroyWorld = function(name) {
    return new Promise(function(resolve) {
        log('Time I Am, Destroyer of Worlds')
        Multiverse()
            .getMVWorldManager()
            .deleteWorld(name, true, true)
        var worldFilePath = getWorldContainer() + ('/' + name)
        if (fs.exists(worldFilePath)) {
            log('Removing folder ' + worldFilePath + '...')
            fs.remove(worldFilePath)
        }
        resolve()
    })
}
