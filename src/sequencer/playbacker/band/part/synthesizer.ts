import dm from '../../../../dm.ts'
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
function makeIntoDomSynthesizer(synthesizer: Synthesizer): void {
    const title = dm('h2', { class: 'component-title' }, 'Synthesizer') as HTMLHeadingElement
    const clearButton = dm('button', { style: { class: 'clear-button' } }, 'Clear') as HTMLButtonElement
    const messageRow = dm('div', { style: { class: 'message-row' } }) as HTMLDivElement
    const synthesizerRow = dm('div', { style: { class: 'synthesizer-row' } }, clearButton, messageRow) as HTMLDivElement
    const div = dm('div', { style: { class: 'synthesizer' } }, title, synthesizerRow) as HTMLDivElement

    synthesizer.noteOn = (pitch: number, time: number): void => {
        const message = dm('div', { class: 'note-on' }, `noteOn ${pitch} ${time}`) as HTMLDivElement

        messageRow.appendChild(message)
    }

    synthesizer.noteOff = (pitch: number, time: number): void => {
        const message = dm('div', { class: 'note-off' }, `noteOff ${pitch} ${time}`) as HTMLDivElement

        messageRow.appendChild(message)
    }

    synthesizer.allNotesOff = (): void => {
        const message = dm('div', { class: 'all-notes-off' }, 'allNotesOff') as HTMLDivElement

        messageRow.appendChild(message)
    }

    clearButton.addEventListener('click', () => {
        messageRow.innerHTML = ''
    })

    title.addEventListener('click', () => {
        synthesizerRow.classList.toggle('hidden')
    })

    synthesizer.render = (): HTMLDivElement => div
}
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
    constructor(_name: PartName, config: SynthesizerConfig) {
        switch (config.type) {
            case SynthesizerType.Log:
                makeIntoLogSynthesizer(this)
                break
            case SynthesizerType.Dom:
                makeIntoDomSynthesizer(this)
                break
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