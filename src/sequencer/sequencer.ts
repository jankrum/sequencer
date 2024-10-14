// Imports
import { Config } from '../types.ts'
import Transporter from './transporter.ts'
import Paginator from './paginator/paginator.ts'
import Playbacker from './playbacker/playbacker.ts'

function appendToBodyIfNotNull(div: HTMLDivElement | null): void {
    if (div) { document.body.append(div) }
}

export function makeSequencer(config: Config): void {
    // Create the transporter, paginator, and playbacker
    const transporter = new Transporter(config.transporter)
    const paginator = new Paginator()
    const playbacker = new Playbacker(config.parts)

    // Connect the transporter, paginator, and playbacker together
    transporter.connect(paginator, playbacker)
    paginator.connect(transporter, playbacker)
    playbacker.connect(transporter)

    // Make the sequencer div
    const transporterDiv = transporter.render()
    const playbackerDiv = playbacker.render()

    // Append the transporter and playbacker to the body if they exist
    appendToBodyIfNotNull(transporterDiv)
    appendToBodyIfNotNull(playbackerDiv)

    // Start everything
    paginator.start()
}