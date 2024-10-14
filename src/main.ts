// Imports
import './style.css'  // Adds styles to the page
import getConfig from './get-config/get-config.ts'
import { makeSequencer } from './sequencer/sequencer.ts'

// Get the config and make the sequencer, then append it to the body if we have something to append
// Top-level await is not supported in all browsers, so we have to do this using .then
getConfig().then(config => ((element) => element ? document.body.append(element) : null)(makeSequencer(config)))