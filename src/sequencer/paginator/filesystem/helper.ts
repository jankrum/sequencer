import { BufferFinishEvent, BufferEventType, BufferEvent, BufferNoteOnEvent, BufferNoteOffEvent, } from '../../../types.ts'
import Part from '../../playbacker/band/part/part.ts'

export function convertPitchNameToMidiNumber(pitch: string): number {
    const pitchName = pitch[0].toUpperCase()
    const octave = parseInt(pitch[1])

    if (isNaN(octave)) {
        throw new Error(`Invalid pitch: ${pitch}`)
    }

    const pitchOffset = {
        C: 0,
        D: 2,
        E: 4,
        F: 5,
        G: 7,
        A: 9,
        B: 11,
    }[pitchName]

    if (pitchOffset === undefined) {
        throw new Error(`Invalid pitch name: ${pitchName}`)
    }

    return 12 * octave + pitchOffset
}

export function convertBpmToMpb(bpm: number): number {
    return 60000 / bpm
}

export function sitOut(...parts: Part[]): BufferFinishEvent[] {
    return parts.map((part): BufferFinishEvent => ({
        time: -Infinity,
        type: BufferEventType.Finish,
        part,
    }))
}

type PipeState = {
    millisecondsPerBeat: number
    position: number
    bufferEvents: BufferEvent[]
}

type PipeOperation = (state: PipeState) => PipeState

export function pipe(...operations: any): BufferEvent[] {
    const initialState: PipeState = {
        millisecondsPerBeat: convertBpmToMpb(120),
        position: 0,
        bufferEvents: []
    }

    return operations.reduce((state: PipeState, operation: PipeOperation) => operation(state), initialState).bufferEvents
}

export function setTempo(bpm: number): PipeOperation {
    return (initialState) => Object.assign({}, initialState, { millisecondsPerBeat: convertBpmToMpb(bpm) })
}

export function play(part: Part, pitch: string, startPosition: number, duration: number, velocity: number): PipeOperation {
    const midiPitch = convertPitchNameToMidiNumber(pitch)

    return (initialState) => {
        const { millisecondsPerBeat, position } = initialState

        const noteOnEvent = {
            time: startPosition * millisecondsPerBeat,
            type: BufferEventType.NoteOn,
            part,
            pitch: midiPitch,
            velocity,
        } as BufferNoteOnEvent

        const noteOffEvent = {
            time: (startPosition + duration) * millisecondsPerBeat,
            type: BufferEventType.NoteOff,
            part,
            pitch: midiPitch,
        } as BufferNoteOffEvent

        return Object.assign({}, initialState, {
            position: position + duration,
            bufferEvents: [
                ...initialState.bufferEvents,
                noteOnEvent,
                noteOffEvent,
            ]
        })
    }
}

export function finish(part: Part): PipeOperation {
    return (initialState) => {
        const { position, millisecondsPerBeat, bufferEvents } = initialState

        const finishEvent = {
            time: (position * millisecondsPerBeat),
            type: BufferEventType.Finish,
            part,
        }

        return Object.assign({}, initialState, { bufferEvents: [...bufferEvents, finishEvent] })
    }
}