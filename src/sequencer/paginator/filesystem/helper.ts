import { BufferFinishEvent, BufferEventType, BufferEvent, BufferNoteOnEvent, BufferNoteOffEvent, BufferComputeEvent, } from '../../../types.ts'
import Part from '../../playbacker/band/part/part.ts'

export function insertEventsIntoBufferSorted(buffer: BufferEvent[], ...events: BufferEvent[]): BufferEvent[] {
    return [...buffer, ...events].sort((a, b) => a.time - b.time)
}

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

export type PipeOperation = (state: PipeState) => PipeState

export function pipe(...operations: any): BufferEvent[] {
    const initialState: PipeState = {
        millisecondsPerBeat: convertBpmToMpb(120),
        position: -Infinity,
        bufferEvents: []
    }

    return operations.reduce((state: PipeState, operation: PipeOperation) => operation(state), initialState).bufferEvents
}

export function setTempo(bpm: number): PipeOperation {
    return (initialState) => Object.assign({}, initialState, { millisecondsPerBeat: convertBpmToMpb(bpm) })
}

export function play(part: Part, pitch: number | string | (() => number), startPosition: number, duration: number, velocity: number): PipeOperation {
    if (typeof pitch === 'function') {
        return (initialState) => {
            const { millisecondsPerBeat } = initialState

            const callback = (buffer: BufferEvent[]) => {
                const pitchValue = pitch()
                const noteOnEvent: BufferNoteOnEvent = {
                    time: startPosition * millisecondsPerBeat,
                    type: BufferEventType.NoteOn,
                    part,
                    pitch: pitchValue,
                    velocity,
                }

                const noteOffEvent: BufferNoteOffEvent = {
                    time: (startPosition + duration) * millisecondsPerBeat,
                    type: BufferEventType.NoteOff,
                    part,
                    pitch: pitchValue,
                }

                buffer.unshift(noteOnEvent, noteOffEvent)
            }

            const computeEvent: BufferComputeEvent = {
                time: startPosition * millisecondsPerBeat - 100,
                type: BufferEventType.Compute,
                callback,
            }

            return Object.assign({}, initialState, {
                position: startPosition + duration,
                bufferEvents: [
                    ...initialState.bufferEvents,
                    computeEvent,
                ]
            })
        }
    } else {
        const midiPitch = typeof pitch === 'number' ? pitch : convertPitchNameToMidiNumber(pitch)

        return (initialState) => {
            const { millisecondsPerBeat } = initialState

            const noteOnEvent: BufferNoteOnEvent = {
                time: startPosition * millisecondsPerBeat,
                type: BufferEventType.NoteOn,
                part,
                pitch: midiPitch,
                velocity,
            }

            const noteOffEvent: BufferNoteOffEvent = {
                time: (startPosition + duration) * millisecondsPerBeat,
                type: BufferEventType.NoteOff,
                part,
                pitch: midiPitch,
            }

            return Object.assign({}, initialState, {
                position: startPosition + duration,
                bufferEvents: [
                    ...initialState.bufferEvents,
                    noteOnEvent,
                    noteOffEvent,
                ]
            })
        }
    }
}

export function finish(...parts: Part[]): PipeOperation {
    return (initialState) => {
        const { position, millisecondsPerBeat, bufferEvents } = initialState

        const finishEvents = parts.map((part): BufferFinishEvent => ({
            time: (position * millisecondsPerBeat),
            type: BufferEventType.Finish,
            part,
        }))

        return Object.assign({}, initialState, { bufferEvents: [...bufferEvents, ...finishEvents] })
    }
}