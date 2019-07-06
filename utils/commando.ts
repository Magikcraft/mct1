const File = java.io.File
const serverDir = new File('.').getAbsolutePath()
export default require(`/${serverDir}/scriptcraft/plugins/commando/commando`)
    .commando
