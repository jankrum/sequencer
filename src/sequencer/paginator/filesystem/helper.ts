import {
    BufferEvent,
    PitchNumber,
    Milliseconds,
    BufferFinishEvent,
    BufferEventType,
    BufferNoteOnEvent,
    BufferNoteOffEvent,
    BufferComputeEvent,
} from '../../../types.ts'
import Part from '../../playbacker/band/part/part.ts'

export function insertEventsIntoBufferSorted(buffer: BufferEvent[], ...events: BufferEvent[]): BufferEvent[] {
    return [...buffer, ...events].sort((a, b) => a.time - b.time)
}

export type PitchLetters = 'C' | 'D' | 'E' | 'F' | 'G' | 'A' | 'B'
export const pitchLetterPattern = /[CDEFGAB]/
export type Accidental = '' | '♮' | 'b' | 'bb' | '#' | '##'
export const accidentalPattern = /♮|b{1,2}|#{1,2}/
export type Octave = -2 | -1 | 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8
export const octavePattern = /-?[0-8]/
export type PitchClass = `${PitchLetters}${Accidental}`
export const pitchClassPattern = /[CDEFGAB](♮|b{1,2}|#{1,2})?/
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

export type SwingAmount = number
export type Beats = number
export type BeatsIntoSong = Beats

type PipeState = {
    millisecondsPerBeat: Milliseconds
    swingAmount: SwingAmount
    swingDivision: Beats  // How many beats the swing is applied to, 2 will mean one beat is stretched and the next is compressed, 1 will mean the downbeat is stretched and the upbeat is compressed
    position: BeatsIntoSong
    bufferEvents: BufferEvent[]
}

export type PipeOperation = (state: PipeState) => PipeState

export function pipe(...operations: any): BufferEvent[] {
    const initialState: PipeState = {
        millisecondsPerBeat: convertBpmToMpb(120),
        swingAmount: 0,
        swingDivision: 1,
        position: -Infinity,
        bufferEvents: []
    }

    return operations.reduce((state: PipeState, operation: PipeOperation) => operation(state), initialState).bufferEvents
}

export function setTempo(bpm: number): PipeOperation {
    return (initialState) => Object.assign({}, initialState, { millisecondsPerBeat: convertBpmToMpb(bpm) })
}

export function setSwing(swingAmount: SwingAmount, swingDivision: Beats): PipeOperation {
    return (initialState) => Object.assign({}, initialState, { swingAmount, swingDivision })
}

export function computeBeatTiming(position: BeatsIntoSong, millisecondsPerBeat: Milliseconds, swingAmount: SwingAmount, swingDivision: Beats): Milliseconds {
    if (position === -Infinity || position === Infinity) {
        return position
    }

    const positionWithinDivision = position % swingDivision
    const positionOfDivision = swingDivision * Math.floor(position / swingDivision)
    const isFirstPart = positionWithinDivision < (swingDivision / 2)
    const swungPositionWithinDivision = isFirstPart ? (swingAmount + 1) * positionWithinDivision : (1 - swingAmount) * positionWithinDivision + (swingAmount * swingDivision)
    const swungPosition = positionOfDivision + swungPositionWithinDivision
    return swungPosition * millisecondsPerBeat
}

function tastefullyShortenDuration(duration: Beats): Beats {
    return Math.max(duration - 0.1, duration * 0.9)
}

export function play(part: Part, pitch: number | SpecificPitch | (() => number), startPosition: BeatsIntoSong, duration: Beats, velocity: number): PipeOperation {
    if (typeof pitch === 'function') {
        return (initialState) => {
            const { millisecondsPerBeat, swingAmount, swingDivision } = initialState

            const noteOnTime = computeBeatTiming(startPosition, millisecondsPerBeat, swingAmount, swingDivision)

            const callback = (buffer: BufferEvent[]) => {
                const pitchValue = pitch()
                const noteOnEvent: BufferNoteOnEvent = {
                    time: noteOnTime,
                    type: BufferEventType.NoteOn,
                    part,
                    pitch: pitchValue,
                    velocity,
                }

                const noteOffEvent: BufferNoteOffEvent = {
                    time: computeBeatTiming(startPosition + tastefullyShortenDuration(duration), millisecondsPerBeat, swingAmount, swingDivision),
                    type: BufferEventType.NoteOff,
                    part,
                    pitch: pitchValue,
                }

                buffer.unshift(noteOnEvent, noteOffEvent)
            }

            const computeEvent: BufferComputeEvent = {
                time: noteOnTime - 100,
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
            const { millisecondsPerBeat, swingAmount, swingDivision } = initialState

            const noteOnEvent: BufferNoteOnEvent = {
                time: computeBeatTiming(startPosition, millisecondsPerBeat, swingAmount, swingDivision),
                type: BufferEventType.NoteOn,
                part,
                pitch: midiPitch,
                velocity,
            }

            const noteOffEvent: BufferNoteOffEvent = {
                time: computeBeatTiming(startPosition + tastefullyShortenDuration(duration), millisecondsPerBeat, swingAmount, swingDivision),
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
        const { position, millisecondsPerBeat, bufferEvents, swingAmount, swingDivision } = initialState

        const finishEvents = parts.map((part): BufferFinishEvent => ({
            time: computeBeatTiming(position, millisecondsPerBeat, swingAmount, swingDivision),
            type: BufferEventType.Finish,
            part,
        }))

        return Object.assign({}, initialState, { bufferEvents: [...bufferEvents, ...finishEvents] })
    }
}