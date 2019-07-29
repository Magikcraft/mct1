import { BossBar } from '@magikcraft/core'
import { Logger } from '../log'

const log = Logger(__filename)

log('Removing all Boss Bars')
BossBar.removeAll()
