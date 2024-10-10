export enum ScoreEventType {
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

export type ScriptFunction = (controller: Controller, score: ScoreEvent[]) => EventBufferEvent[]

export type ControllerModule = {
    value: number
}

export type Controller = {
    clear: () => void
    makeRangeControl: (prefix: string, min: number, max: number, suffix: string | null) => ControllerModule
    makeOptionControl: (prefix: string, options: string[], suffix: string | null) => ControllerModule
}

export enum EventBufferEventType {
    Tempo,
    NoteOn,
    NoteOff,
}

export type EventBufferTempoEvent = {
    position: number
    type: EventBufferEventType.Tempo
    bpm: number
}

export type EventBufferNoteOnEvent = {
    position: number
    type: EventBufferEventType.NoteOn
    pitch: number
}

export type EventBufferNoteOffEvent = {
    position: number
    type: EventBufferEventType.NoteOff
    pitch: number
}

export type EventBufferEvent = EventBufferTempoEvent | EventBufferNoteOnEvent | EventBufferNoteOffEvent

export type Chart = {
    title: string
    parts: {
        [part: string]: {
            script: (controller: Controller, score: ScoreEvent[]) => EventBufferEvent[]
            score: ScoreEvent[]
        }
    }
}