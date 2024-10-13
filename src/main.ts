// Adds styles to the page
import './style.css'

import getConfig from './get-config/get-config.ts'
import { makeSequencer } from './sequencer/sequencer.ts'

getConfig().then(config => makeSequencer(config))