import getConfig from './get-config/get-config.ts'
import { makeSequencer } from './sequencer/sequencer.ts'
import './style.css' // Adds styles to the page

// Get the config and make the sequencer
const config = await getConfig()
makeSequencer(config)