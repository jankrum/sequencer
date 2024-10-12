// export type ControllerModule = {
//     value: number
// }

// export type Controller = {
//     clear: () => void
//     makeRangeControl: (prefix: string, min: number, max: number, suffix: string | null) => ControllerModule
//     makeOptionControl: (prefix: string, options: string[], suffix: string | null) => ControllerModule
// }

export type PartName = 'bass' | 'drum' | 'chord' | 'lead'

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
    part: any
    type: BufferEventType.Finish
}

export type BufferNoteOnEvent = {
    position: number
    part: any
    type: BufferEventType.NoteOn
    pitch: number

}

export type BufferNoteOffEvent = {
    position: number
    part: any
    type: BufferEventType.NoteOff
    pitch: number
}

export type BufferEvent = BufferTempoEvent | BufferFinishEvent | BufferNoteOnEvent | BufferNoteOffEvent

type Chart = {
    title: string,
    compose: (bass: any, drum: any, chord: any, lead: any) => BufferEvent[]
}

export default Chart