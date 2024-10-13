import Part from './sequencer/playbacker/band/part/part.ts'

export type PartName = 'bass' | 'drum' | 'keys' | 'lead'

//#region Config
export type DuplexMidiConfig = {
    input: string,
    output: string,
}

export type SimplexMidiConfig = {
    output: string,
    channel: number,
}

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

export const enum SynthesizerType {
    Dom,
    Midi,
    // Tone,
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

export type SynthesizerConfig = DomSynthesizerConfig | MidiSynthesizerConfig // | ToneSynthesizerConfig

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

export type PartConfig = {
    controller: ControllerConfig,
    synthesizer: SynthesizerConfig,
}

export type PartsConfig = {
    [key in PartName]: PartConfig
}

export type Config = {
    parts: PartsConfig,
    transporter: TransporterConfig,
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

export type Chart = {
    title: string,
    compose: (parts: Parts) => BufferEvent[]
}
//#endregion