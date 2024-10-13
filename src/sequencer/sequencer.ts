// Imports
import { Config } from '../types.ts'
import Transporter from './transporter/transporter.ts'
import Paginator from './paginator/paginator.ts'
import Playbacker from './playbacker/playbacker.ts'


//#region makeSequencer
export function makeSequencer(config: Config): void {
    const transporter = new Transporter(config.transporter)
    const paginator = new Paginator()
    const playbacker = new Playbacker(config.parts)

    transporter.connect(paginator, playbacker)
    paginator.connect(transporter, playbacker)
    playbacker.connect(transporter)

    paginator.start()
}
//#endregion