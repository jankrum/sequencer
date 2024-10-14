import './style.css'  // Adds styles to the page
import getConfig from './get-config/get-config.ts'
import { makeSequencer } from './sequencer/sequencer.ts'

// Get the config and make the sequencer
const config = await getConfig()
makeSequencer(config)