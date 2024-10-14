// Imports
import { Config } from '../types.ts'
import Transporter from './transporter/transporter.ts'
import Paginator from './paginator/paginator.ts'
import Playbacker from './playbacker/playbacker.ts'
import dm from '../dm.ts'

//#region makeSequencer
export function makeSequencer(config: Config): HTMLDivElement | null {
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
    const div = (transporterDiv || playbackerDiv) ? dm('div', {}, transporterDiv, playbackerDiv) as HTMLDivElement : null

    // Start everything
    paginator.start()

    // Return the sequencer div
    return div
}
//#endregion