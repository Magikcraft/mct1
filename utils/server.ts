export const executeCommand = command =>
    __plugin.server.dispatchCommand(__plugin.server.consoleSender, command)

export const getPlugin = pluginName =>
    __plugin.server.getPluginManager().getPlugin(pluginName)

export const getWorldDir = () => __plugin.server.getWorldContainer()
