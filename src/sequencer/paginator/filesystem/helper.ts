import { BufferFinishEvent, BufferEventType, BufferEvent, BufferNoteOnEvent, BufferNoteOffEvent, } from '../../../types.ts'
import Part from '../../playbacker/band/part/part.ts'

function convertPitchNameToMidiNumber(pitch: string): number {
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

type PipeOperation = (state: PipeState) => void

export function pipe(...operations: any): BufferEvent[] {
    const state: PipeState = {
        millisecondsPerBeat: convertBpmToMpb(120),
        position: 0,
        bufferEvents: []
    }

    for (const operation of operations) {
        operation(state)
    }

    return state.bufferEvents
}

export function setTempo(bpm: number): PipeOperation {
    return ({ millisecondsPerBeat }) => {
        millisecondsPerBeat = convertBpmToMpb(bpm)
    }
}

export function play(part: Part, pitch: string, startPosition: number, duration: number, velocity: number): PipeOperation {
    return ({ millisecondsPerBeat, position, bufferEvents }) => {
        const midiPitch = convertPitchNameToMidiNumber(pitch)
        const startTime = position + startPosition
        const endTime = startTime + (duration * millisecondsPerBeat)

        const noteOnEvent = {
            time: startTime,
            type: BufferEventType.NoteOn,
            part,
            pitch: midiPitch,
            velocity,
        } as BufferNoteOnEvent

        const noteOffEvent = {
            time: endTime,
            type: BufferEventType.NoteOff,
            part,
            pitch: midiPitch,
        } as BufferNoteOffEvent

        bufferEvents.push(noteOnEvent, noteOffEvent)

        position = endTime
    }
}

export function finish(part: Part): PipeOperation {
    return ({ position, bufferEvents }) => {
        bufferEvents.push({
            time: position,
            type: BufferEventType.Finish,
            part,
        } as BufferFinishEvent)
    }
}