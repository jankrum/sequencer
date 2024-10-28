import { Event, Milliseconds, PitchNumber } from '../../../types.ts'

//#region SORTING
// The most useful helper functionality, useful whenever there are multiple parts
export function* sortGenerators(...generators: Generator<Event>[]): Generator<Event> {
    const currentValues = generators.map(generator => ({ generator, result: generator.next() })).filter(({ result }) => !result.done).map(({ generator, result }) => ({ generator, value: result.value }))

    // Sort initial values by time
    currentValues.sort((a, b) => a.value.time - b.value.time)

    // Continue yielding the next earliest time value until all generators are exhausted
    while (currentValues.length > 0) {
        // Extract the item with the earliest time
        const earliest = currentValues.shift()

        if (earliest === undefined) {
            return
        }

        yield earliest.value

        // Get the next value from the generator that provided the earliest value
        const { value, done } = earliest.generator.next()
        if (!done) {
            // Insert the new value back into currentValues in sorted order by time
            const index = currentValues.findIndex(item => item.value.time > value.time)
            if (index === -1) {
                currentValues.push({ generator: earliest.generator, value })
            } else {
                currentValues.splice(index, 0, { generator: earliest.generator, value })
            }
        }
    }
}

// // This is a bad way to sort generators because it yields all values upfront instead of as-needed
// export function* stupidSortGenerators(...generators: Generator<Event>[]): Generator<Event> {
//     // Collect all values from each generator into a single array
//     const events = generators.flatMap(gen => [...gen])

//     // Sort the combined array by the time property
//     const sortedEvents = events.toSorted((a, b) => a.time - b.time)

//     // Yield each sorted event
//     yield* sortedEvents
// }

//#endregion

//#region TIMING
// Helper functionality for timing, which is more primitive than pitch
export type Bpm = number

export function convertBpmToMpb(bpm: Bpm): Milliseconds {
    return 60000 / bpm
}

// How much of the second half of the swing division will be a part of the first half
// 0 means no swing, 0.5 means 1-2- becomes 1--2, 1 means 1-2- becomes 1----, -0.5 means 1-2- becomes 12--
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

// Helper functionality for timing, which is more primitive than pitch
export type Beats = number
export type BeatsIntoSong = number

export function tastefullyShortenDuration(duration: Beats): Beats {
    return Math.max(duration - 0.1, duration * 0.9)
}

//#endregion

//#region PITCH
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
//#endregion

//#region CONSTANTS
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
//#endregion