import Part from './sequencer/playbacker/band/part/part.ts'

export type PartName = 'bass' | 'drum' | 'keys' | 'lead'

// export type DuplexMidiConfig = {
//     input: string
//     output: string
// }

export type OneIndexedMidiChannel = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14 | 15 | 16

export type SimplexMidiConfig = {
    output: string
    channel: OneIndexedMidiChannel
}

//#region Transporter Config
export enum TransporterType {
    Dom,
    // Midi,
}

export type DomTransporterConfig = {
    type: TransporterType.Dom
}

// export type MidiTransporterConfig = {
//     type: TransporterType.Midi
//     midi: DuplexMidiConfig
// }

export type TransporterConfig = DomTransporterConfig // | MidiTransporterConfig
//#endregion

//#region Controller Config
export enum ControllerType {
    Dom,
    // Midi,
}

export type DomControllerConfig = {
    type: ControllerType.Dom
}

// export type MidiControllerConfig = {
//     type: ControllerType.Midi
//     midi: DuplexMidiConfig
// }

export type ControllerConfig = DomControllerConfig // | MidiControllerConfig
//#endregion

//#region Synthesizer Config
export enum SynthesizerType {
    Dom,
    Midi,
}

export type DomSynthesizerConfig = {
    type: SynthesizerType.Dom
}

export type MidiSynthesizerConfig = {
    type: SynthesizerType.Midi
    midi: SimplexMidiConfig
}

export type SynthesizerConfig = DomSynthesizerConfig | MidiSynthesizerConfig
//#endregion

//#region Config
export type PartConfig = {
    controller: ControllerConfig
    synthesizer: SynthesizerConfig
}

export type PartsConfig = {
    [key in PartName]: PartConfig
}

export type Config = {
    transporter: TransporterConfig
    parts: PartsConfig
}
//#endregion

//#region Playback
export enum PlaybackState {
    Playing,
    Paused,
    Stopped,
}

export enum PlaybackAction {
    Play,
    Pause,
    Resume,
    Stop,
}
//#endregion

//#region Chart
export type Parts = {
    [key in PartName]: Part
}

export type Milliseconds = number
export type MillisecondsIntoSong = Milliseconds
export type PitchNumber = number

export enum EventType {
    Compute,
    NoteOn,
    NoteOff,
}

export type ComputeEvent = {
    time: MillisecondsIntoSong
    type: EventType.Compute
}

export type NoteOnEvent = {
    time: MillisecondsIntoSong
    type: EventType.NoteOn
    part: Part
    pitch: PitchNumber
    velocity: number
}

export type NoteOffEvent = {
    time: MillisecondsIntoSong
    type: EventType.NoteOff
    part: Part
    pitch: PitchNumber
}

export type Event = ComputeEvent | NoteOnEvent | NoteOffEvent

export type Chart = {
    title: string
    compose: (parts: Parts) => Generator<Event>
}
//#endregion