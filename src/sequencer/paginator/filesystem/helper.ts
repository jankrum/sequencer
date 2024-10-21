import { PitchNumber, BufferFinishEvent, BufferEventType, BufferEvent, BufferNoteOnEvent, BufferNoteOffEvent, BufferComputeEvent, } from '../../../types.ts'
import Part from '../../playbacker/band/part/part.ts'

export function insertEventsIntoBufferSorted(buffer: BufferEvent[], ...events: BufferEvent[]): BufferEvent[] {
    return [...buffer, ...events].sort((a, b) => a.time - b.time)
}

export type Beats = number
export type BeatsIntoSong = Beats

export type PitchLetters = 'C' | 'D' | 'E' | 'F' | 'G' | 'A' | 'B'
const pitchLetterPattern = /[CDEFGAB]/
export type Accidental = '' | '♮' | 'b' | 'bb' | '#' | '##'
const accidentalPattern = /♮|b{1,2}|#{1,2}/
export type Octave = -2 | -1 | 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8
const octavePattern = /-?[0-8]/
export type PitchClass = `${PitchLetters}${Accidental}`
const pitchClassPattern = /[CDEFGAB](♮|b{1,2}|#{1,2})?/
export type SpecificPitch = `${PitchClass}${Octave}`

export function convertSpecificPitchToMidiNumber(specificPitch: SpecificPitch): PitchNumber {
    const pitchClass = specificPitch.match(pitchClassPattern)?.[0]

    if (pitchClass === undefined) {
        throw new Error(`Invalid pitch class: ${specificPitch}`)
    }

    const pitchLetter = pitchClass.match(pitchLetterPattern)?.[0]

    if (pitchLetter === undefined) {
        throw new Error(`Invalid pitch letter: ${pitchClass}`)
    }

    const pitchLetterOffset = {
        'C': 0,
        'D': 2,
        'E': 4,
        'F': 5,
        'G': 7,
        'A': 9,
        'B': 11,
    }[pitchLetter]

    if (pitchLetterOffset === undefined) {
        throw new Error(`Invalid pitch letter: ${pitchClass}`)
    }

    const accidental = pitchClass.match(accidentalPattern)?.[0] || '♮'

    const accidentalOffset = {
        '♮': 0,
        'b': -1,
        'bb': -2,
        '#': 1,
        '##': 2,
    }[accidental]

    if (accidentalOffset === undefined) {
        throw new Error(`Invalid accidental: ${pitchClass}`)
    }

    const octave = Number(specificPitch.match(octavePattern)?.[0])

    if (isNaN(octave)) {
        throw new Error(`Invalid octave: ${pitchClass}`)
    }

    const octaveOffset = (octave + 1) * 12

    const midiNumber = pitchLetterOffset + accidentalOffset + octaveOffset

    if (midiNumber < 0 || midiNumber > 127) {
        throw new Error(`Out of MIDI range: ${pitchClass}`)
    }

    return midiNumber
}

export function convertBpmToMpb(bpm: number): number {
    return 60000 / bpm
}

// export function sitOut(...parts: Part[]): BufferFinishEvent[] {
//     return parts.map((part): BufferFinishEvent => ({
//         time: -Infinity,
//         type: BufferEventType.Finish,
//         part,
//     }))
// }

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

function tastefullyShortenDuration(duration: Beats): Beats {
    return Math.max(duration - 0.1, duration * 0.9)
}

export function play(part: Part, pitch: number | SpecificPitch | (() => number), startPosition: BeatsIntoSong, duration: Beats, velocity: number): PipeOperation {
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
                    time: (startPosition + tastefullyShortenDuration(duration)) * millisecondsPerBeat,
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
                bufferEvents: insertEventsIntoBufferSorted(initialState.bufferEvents, computeEvent)
            })
        }
    } else {
        const midiPitch = typeof pitch === 'number' ? pitch : convertSpecificPitchToMidiNumber(pitch)

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
                time: (startPosition + tastefullyShortenDuration(duration)) * millisecondsPerBeat,
                type: BufferEventType.NoteOff,
                part,
                pitch: midiPitch,
            }

            return Object.assign({}, initialState, {
                position: startPosition + duration,
                bufferEvents: insertEventsIntoBufferSorted(initialState.bufferEvents, noteOnEvent, noteOffEvent)
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