import Part from './sequencer/playbacker/band/part/part.ts'

export type PartName = 'bass' | 'drum' | 'keys' | 'lead'

export type DuplexMidiConfig = {
    input: string,
    output: string,
}

export type SimplexMidiConfig = {
    output: string,
    channel: number,
}

//#region Transporter Config
export const enum TransporterType {
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

// export type WebRTCTransporterConfig = {
//     type: TransporterType.WebRTC,
//     room: string,
// }

export type TransporterConfig = DomTransporterConfig | MidiTransporterConfig // | WebRTCTransporterConfig
//#endregion

//#region Controller Config
export const enum ControllerType {
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
//     type: ControllerType.WebRTC,
//     room: string,
// }

export type ControllerConfig = DomControllerConfig | MidiControllerConfig // | WebrtcControllerConfig
//#endregion

//#region Synthesizer Config
export const enum SynthesizerType {
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
    Tempo,
    Finish,
    NoteOn,
    NoteOff,
}

export type BufferTempoEvent = {
    position: number
    type: BufferEventType.Tempo
    bpm: number
}

export type BufferFinishEvent = {
    position: number
    part: Part
    type: BufferEventType.Finish
}

export type BufferNoteOnEvent = {
    position: number
    part: Part
    type: BufferEventType.NoteOn
    pitch: number

}

export type BufferNoteOffEvent = {
    position: number
    part: Part
    type: BufferEventType.NoteOff
    pitch: number
}

export type BufferEvent = BufferTempoEvent | BufferFinishEvent | BufferNoteOnEvent | BufferNoteOffEvent

export type ComposeFunction = (parts: Parts) => BufferEvent[]

export type Chart = {
    title: string,
    compose: ComposeFunction,
}
//#endregion