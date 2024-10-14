import { SynthesizerConfig, PartName, SynthesizerType } from '../../../../types.ts'

//#region LogSynthesizer
function makeIntoLogSynthesizer(synthesizer: Synthesizer): void {
    synthesizer.noteOn = (pitch: number, time: number): void => {
        console.log('noteOn', pitch, time)
    }

    synthesizer.noteOff = (pitch: number, time: number): void => {
        console.log('noteOff', pitch, time)
    }

    synthesizer.allNotesOff = (): void => {
        console.log('allNotesOff')
    }
}
//#endregion

//#region DomSynthesizer
// function makeIntoDomSynthesizer(synthesizer: Synthesizer): void {
//     synthesizer.noteOn = (pitch: number, time: number): void => { }

//     synthesizer.noteOff = (pitch: number, time: number): void => { }

//     synthesizer.allNotesOff = (): void => { }
// }
//#endregion

//#region MidiSynthesizer
// function makeIntoMidiSynthesizer(synthesizer: Synthesizer): void {
//     synthesizer.noteOn = (pitch: number, time: number): void => { }

//     synthesizer.noteOff = (pitch: number, time: number): void => { }

//     synthesizer.allNotesOff = (): void => { }
// }
//#endregion

//#region ToneSynthesizer
// function makeIntoToneSynthesizer(synthesizer: Synthesizer): void {
//     synthesizer.noteOn = (pitch: number, time: number): void => { }

//     synthesizer.noteOff = (pitch: number, time: number): void => { }

//     synthesizer.allNotesOff = (): void => { }
// }
//#endregion

//#region Synthesizer
export default class Synthesizer {
    constructor(name: PartName, config: SynthesizerConfig) {
        switch (config.type) {
            case SynthesizerType.Log:
                makeIntoLogSynthesizer(this)
                break
            // case SynthesizerType.Dom:
            //     makeIntoDomSynthesizer(this)
            //     break
            // case SynthesizerType.Midi:
            //     makeIntoMidiSynthesizer(this)
            //     break
            // case SynthesizerType.Tone:
            //     makeIntoToneSynthesizer(this)
            //     break
            default:
                throw new Error(`Invalid synthesizer type: ${config.type}`)
        }
    }

    noteOn(_pitch: number, _time: number): void { }

    noteOff(_pitch: number, _time: number): void { }

    allNotesOff(): void { }

    render(): HTMLDivElement | null { return null }
}
//#endregion