import { BufferEvent, PitchNumber, Milliseconds, } from '../../../types.ts'

// The most primitive helper function
export function insertEventsIntoBufferSorted(buffer: BufferEvent[], ...events: BufferEvent[]): BufferEvent[] {
    return [...buffer, ...events].sort((a, b) => a.time - b.time)
}

// The generally first helper functionality
export type Bpm = number

export function convertBpmToMpb(bpm: Bpm): Milliseconds {
    return 60000 / bpm
}

// Helper functionality for timing, which is more primitive than pitch
export type Beats = number
export type BeatsIntoSong = number

export function tastefullyShortenDuration(duration: Beats): Beats {
    return Math.max(duration - 0.1, duration * 0.9)
}

// Helper functionality for pitch, which is less primitive than timing
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

// Dynamics
export const enum Dynamics {
    pp = 21,    // Pianissimo
    p = 41,     // Piano
    mp = 61,    // Mezzo-Piano
    mf = 81,    // Mezzo-Forte
    f = 101,    // Forte
    ff = 121,    // Fortissimo
    fff = 127,   // Fortississimo
}

// The amount of time to compute ahead of when it is used
export const computeScheduleAheadTime: Milliseconds = 100

// The duration of a trigger signal
export const triggerLength: Milliseconds = 5


// Computes the timing of a beat
export type SwingAmount = number

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