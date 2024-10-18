import Part from './sequencer/playbacker/band/part/part.ts'

export type PartName = 'bass' | 'drum' | 'keys' | 'lead'

export type DuplexMidiConfig = {
    input: string,
    output: string,
}

export type OneIndexedMidiChannel = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14 | 15 | 16

export type SimplexMidiConfig = {
    output: string,
    channel: OneIndexedMidiChannel,
}

//#region Transporter Config
export enum TransporterType {
    Dom,
    Midi,
    // WebRTC,
}

export type DomTransporterConfig = {
    type: TransporterType.Dom,
}

export type MidiTransporterConfig = {
    type: TransporterType.Midi,
    midi: DuplexMidiConfig,
}

// export type WebrtcTransporterConfig = {
//     type: TransporterType.WebRTC,
//     room: string,
// }

export type TransporterConfig = DomTransporterConfig | MidiTransporterConfig // | WebrtcTransporterConfig
//#endregion

//#region Controller Config
export enum ControllerType {
    Dom,
    Midi,
    // WebRTC,
}

export type DomControllerConfig = {
    type: ControllerType.Dom,
}

export type MidiControllerConfig = {
    type: ControllerType.Midi,
    midi: DuplexMidiConfig,
}

// export type WebrtcControllerConfig = {
//     type: ControllerType.Webrtc,
//     room: string,
// }

export type ControllerConfig = DomControllerConfig | MidiControllerConfig // | WebrtcControllerConfig
//#endregion

//#region Synthesizer Config
export enum SynthesizerType {
    Log,
    Dom,
    Midi,
    // Tone,
}

export type LogSynthesizerConfig = {
    type: SynthesizerType.Log,
}

export type DomSynthesizerConfig = {
    type: SynthesizerType.Dom,
}

export type MidiSynthesizerConfig = {
    type: SynthesizerType.Midi,
    midi: SimplexMidiConfig,
}

// export const enum ToneSourceType {
//     Chiptune,
//     Sampler,
//     Synth,
// }

// export type ChiptuneToneSourceConfig = {
//     type: ToneSourceType.Chiptune,
// }

// export type SamplerToneSourceConfig = {
//     type: ToneSourceType.Sampler,
//     source: string,
// }

// export type SynthToneSourceConfig = {
//     type: ToneSourceType.Synth,
// }

// export type ToneSourceConfig = ChiptuneToneSourceConfig | SamplerToneSourceConfig | SynthToneSourceConfig

// export type ToneSynthesizerConfig = {
//     type: SynthesizerType.Tone,
//     source: ToneSourceConfig,
// }

export type SynthesizerConfig = LogSynthesizerConfig | DomSynthesizerConfig | MidiSynthesizerConfig // | ToneSynthesizerConfig
//#endregion

//#region Config
export type PartConfig = {
    controller: ControllerConfig,
    synthesizer: SynthesizerConfig,
}

export type PartsConfig = {
    [key in PartName]: PartConfig
}

export type Config = {
    transporter: TransporterConfig,
    parts: PartsConfig,
}
//#endregion

//#region Playback
export const enum PlaybackState {
    Playing,
    Paused,
    Stopped,
}

export const enum PlaybackAction {
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

export const enum BufferEventType {
    Finish,
    NoteOn,
    NoteOff,
    Compute,
}

export type MillisecondsIntoSong = number

export type BufferFinishEvent = {
    time: MillisecondsIntoSong
    type: BufferEventType.Finish
    part: Part
}

export type BufferNoteOnEvent = {
    time: MillisecondsIntoSong
    type: BufferEventType.NoteOn
    part: Part
    pitch: number
    velocity: number
}

export type BufferNoteOffEvent = {
    time: MillisecondsIntoSong
    type: BufferEventType.NoteOff
    part: Part
    pitch: number
}

export type BufferComputeEvent = {
    time: MillisecondsIntoSong
    type: BufferEventType.Compute
    callback: (buffer: BufferEvent[]) => void
}

export type BufferEvent = BufferFinishEvent | BufferNoteOnEvent | BufferNoteOffEvent | BufferComputeEvent

export type Chart = {
    title: string,
    compose: (parts: Parts) => BufferEvent[],
}
//#endregion