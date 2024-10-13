import { Parts, PartName } from '../../../../types.ts'

//#region Synthesizer
class Synthesizer {
    #name: PartName

    constructor(name: PartName) {
        this.#name = name
    }

    noteOn(pitch: number, time: number) {
        console.log('noteOn', this.#name, pitch, time)
    }

    noteOff(pitch: number, time: number) {
        console.log('noteOff', this.#name, pitch, time)
    }

    allNotesOff() {
        console.log('allNotesOff', this.#name)
    }
}
//#endregion

//#region makeParts
export default class Part {
    synthesizer: Synthesizer

    constructor(name: PartName) {
        this.synthesizer = new Synthesizer(name)
    }
}

export function makeParts(): Parts {
    return {
        bass: new Part('bass'),
        drum: new Part('drum'),
        keys: new Part('keys'),
        lead: new Part('lead'),
    }
}
//#endregion