const File = java.io.File
const serverDir = new File('.').getAbsolutePath()
// Absolute relative path is ghetto tight-coupling
exports = {
    commando: require(`/${serverDir}/scriptcraft/plugins/commando/commando`)
        .commando,
}
