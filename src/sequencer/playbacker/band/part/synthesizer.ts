import dm from '../../../../dm.ts'
import { SynthesizerConfig, PartName, SynthesizerType, MidiSynthesizerConfig } from '../../../../types.ts'
import midiAccess from '../../../../midi-access.ts'

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
    const clearButton = dm('button', {}, 'Clear') as HTMLButtonElement
    const messageRow = dm('div', { class: 'message-row' }) as HTMLDivElement
    const synthesizerRow = dm('div', { class: 'synthesizer-row' }, clearButton, messageRow) as HTMLDivElement
    const div = dm('div', { class: 'synthesizer' }, title, synthesizerRow) as HTMLDivElement

    function addMessage(message: string, className: string): void {
        const div = dm('div', { class: className }, message) as HTMLDivElement
        messageRow.appendChild(div)
        messageRow.scrollTop = messageRow.scrollHeight
    }

    synthesizer.noteOn = (pitch: number, time: number, addToCurrentlyPlaying: boolean = true): void => {
        if (addToCurrentlyPlaying) {
            synthesizer.currentlyPlayingPitches.push(pitch)
        }

        addMessage(`noteOn ${pitch} ${time.toFixed(0)}`, 'note-on')
    }

    synthesizer.noteOff = (pitch: number, time: number, removeFromCurrentlyPlaying: boolean = true): void => {
        addMessage(`noteOff ${pitch} ${time.toFixed(0)}`, 'note-off')

        if (removeFromCurrentlyPlaying) {
            synthesizer.currentlyPlayingPitches = synthesizer.currentlyPlayingPitches.filter(currentPitch => currentPitch !== pitch)
        }
    }

    synthesizer.allNotesOff = (): void => {
        addMessage('allNotesOff', 'all-notes-off')

        synthesizer.currentlyPlayingPitches = []
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
function makeIntoMidiSynthesizer(synthesizer: Synthesizer, config: MidiSynthesizerConfig): void {
    if (!midiAccess) {
        throw new Error('No MIDI access')
    }

    const output = midiAccess.outputs.values().find(output => output.name === config.midi.output)

    if (!output) {
        throw new Error(`No MIDI output named ${config.midi.output}`)
    }

    const zeroIndexedChannel = config.midi.channel - 1

    synthesizer.noteOn = (pitch: number, time: number, addToCurrentlyPlaying: boolean = true): void => {
        if (addToCurrentlyPlaying) {
            synthesizer.currentlyPlayingPitches.push(pitch)
        }

        output.send([0x90 + zeroIndexedChannel, pitch, 0x7f], time)
    }

    synthesizer.noteOff = (pitch: number, time: number, removeFromCurrentlyPlaying: boolean = true): void => {
        output.send([0x80 + zeroIndexedChannel, pitch, 0x00], time)

        if (removeFromCurrentlyPlaying) {
            synthesizer.currentlyPlayingPitches = synthesizer.currentlyPlayingPitches.filter(currentPitch => currentPitch !== pitch)
        }
    }

    synthesizer.allNotesOff = (): void => {
        output.send([0xb0 + zeroIndexedChannel, 0x7b, 0x00])

        synthesizer.currentlyPlayingPitches = []
    }
}
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
    currentlyPlayingPitches: number[] = []

    constructor(_name: PartName, config: SynthesizerConfig) {
        switch (config.type) {
            case SynthesizerType.Log:
                makeIntoLogSynthesizer(this)
                break
            case SynthesizerType.Dom:
                makeIntoDomSynthesizer(this)
                break
            case SynthesizerType.Midi:
                makeIntoMidiSynthesizer(this, config as MidiSynthesizerConfig)
                break
            // case SynthesizerType.Tone:
            //     makeIntoToneSynthesizer(this)
            //     break
            // default:
            //     throw new Error(`Invalid synthesizer type: ${config.type}`)
        }
    }

    noteOn(_pitch: number, _time: number, _addToCurrentlyPlaying: boolean = true): void { }

    noteOff(_pitch: number, _time: number, _removeFromCurrentlyPlaying: boolean = true): void { }

    allNotesOff(): void { }

    pause(): void {
        const now = window.performance.now()
        for (const pitch of this.currentlyPlayingPitches) {
            this.noteOff(pitch, now, false)
        }
    }

    resume(): void {
        const now = window.performance.now()
        for (const pitch of this.currentlyPlayingPitches) {
            this.noteOn(pitch, now, false)
        }
    }

    render(): HTMLDivElement | null { return null }
}
//#endregion