import Controller from './controller.ts'
import Synthesizer from './synthesizer.ts'

import { Parts, PartName, PartConfig, PartsConfig } from '../../../../types.ts'
import dm from '../../../../dm.ts'

//#region makeParts
export default class Part {
    #name: PartName
    controller: Controller
    synthesizer: Synthesizer

    constructor(name: PartName, config: PartConfig) {
        this.#name = name
        this.controller = new Controller(name, config.controller)
        this.synthesizer = new Synthesizer(name, config.synthesizer)
    }

    render(): HTMLDivElement | null {
        const partTitle = dm('h2', {}, this.#name.toUpperCase()) as HTMLHeadingElement
        const controllerDiv = this.controller.render()
        const synthesizerDiv = this.synthesizer.render()

        return controllerDiv || synthesizerDiv ? dm('div', { class: 'part' }, partTitle, controllerDiv, synthesizerDiv) as HTMLDivElement : null
    }
}

export function makeParts(config: PartsConfig): Parts {
    return {
        bass: new Part('bass', config.bass),
        drum: new Part('drum', config.drum),
        keys: new Part('keys', config.keys),
        lead: new Part('lead', config.lead),
    }
}
//#endregion