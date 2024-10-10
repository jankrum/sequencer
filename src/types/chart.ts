export type ControllerModule = {
    value: number
}

export type Controller = {
    clear: () => void
    makeRangeControl: (prefix: string, min: number, max: number, suffix: string | null) => ControllerModule
    makeOptionControl: (prefix: string, options: string[], suffix: string | null) => ControllerModule
}

export const enum ScoreEventType {
    Tempo,
    Note,
}

export type ScoreTempoEvent = {
    position: number
    type: ScoreEventType.Tempo
    bpm: number
}

export type ScoreNoteEvent = {
    position: number
    type: ScoreEventType.Note
    pitch: number
    duration: number
}

export type ScoreEvent = ScoreTempoEvent | ScoreNoteEvent

export const enum BufferEventType {
    Tempo,
    NoteOn,
    NoteOff,
}

export type BufferTempoEvent = {
    position: number
    type: BufferEventType.Tempo
    bpm: number
}

export type BufferNoteOnEvent = {
    position: number
    type: BufferEventType.NoteOn
    pitch: number
}

export type BufferNoteOffEvent = {
    position: number
    type: BufferEventType.NoteOff
    pitch: number
}

export type BufferEvent = BufferTempoEvent | BufferNoteOnEvent | BufferNoteOffEvent

export type ScriptFunction = (controller: Controller, score: ScoreEvent[]) => BufferEvent[]

export type Part = {
    script: ScriptFunction
    score: ScoreEvent[]
}

type Chart = {
    title: string
    parts: {
        [part: string]: Part
    }
}

export default Chart