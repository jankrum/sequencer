import Controller from './controller.ts'
import Synthesizer from './synthesizer.ts'

import dm from '../../../../dm.ts'
import { PartConfig, PartName, Parts, PartsConfig } from '../../../../types.ts'

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
        const controllerDiv = this.controller.render()
        const synthesizerDiv = this.synthesizer.render()

        if (!controllerDiv && !synthesizerDiv) {
            return null
        }

        const heading = dm('h2', {}, this.#name.toUpperCase()) as HTMLHeadingElement
        const div = dm('div', { class: 'part' }, heading, controllerDiv, synthesizerDiv) as HTMLDivElement

        heading.addEventListener('click', () => {
            console.log('click')

            console.log(controllerDiv)

            if (controllerDiv) {
                controllerDiv.classList.toggle('hidden')
            }

            if (synthesizerDiv) {
                synthesizerDiv.classList.toggle('hidden')
            }
        })

        return div
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