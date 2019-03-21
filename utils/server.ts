export const executeCommand = command =>
    __plugin.server.dispatchCommand(__plugin.server.consoleSender, command)
