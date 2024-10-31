// https://musescore.com/user/34876540/scores/8425946

import { Chart, Event, EventType, Milliseconds, PitchNumber } from '../../../../types.ts'
import Part from '../../../playbacker/band/part/part.ts'
import { Beats, BeatsIntoSong, Bpm, Dynamics, PitchClass, SpecificPitch, computeBeatTiming, convertBpmToMpb, convertSpecificPitchToMidiNumber, sortGenerators, tastefullyShortenDuration } from '../helper.ts'

// Types
type Note = [pitch: SpecificPitch, position: BeatsIntoSong, duration: Beats]

type Quality = 'major' | 'minor' | 'diminished' | 'augmented'

type Extension = '6' | '7' | 'maj7' | '7(b5)' | '9'

type Chord = {
    root: PitchClass,
    quality: Quality,
    extension?: Extension,
    position: BeatsIntoSong,
    duration: Beats,
}

type Section = {
    length: Beats,
    melody: Note[],
    chords: Chord[],
}

// Easy to work with
const tempo: Bpm = 118
// const tempo: Bpm = 240
const beatsPerBar = 4
const song = (() => {
    const sections: { [key: string]: Section } = {
        '1-16': {
            length: 64,
            melody: [
                ['C5', 0, 1],
                ['B4', 1, 1],
                ['A4', 2, 0.5],
                ['G4', 2.5, 1.5],
                //----------------------------------------
                ['F4', 4, 1.5],
                ['G4', 5.5, 0.5],
                ['A4', 6, 1],
                ['C5', 7, 1],
                //----------------------------------------
                ['B4', 8, 1],
                ['A4', 9, 1],
                ['G4', 10, 0.5],
                ['F4', 10.5, 1.5],
                //----------------------------------------
                ['E4', 12, 4],
                //----------------------------------------
                ['A4', 16, 1],
                ['G4', 17, 1],
                ['F4', 18, 0.5],
                ['E4', 18.5, 1.5],
                //----------------------------------------
                ['D4', 20, 1.5],
                ['E4', 21.5, 0.5],
                ['F4', 22, 1],
                ['A4', 23, 1],
                //----------------------------------------
                ['G#4', 24, 1],
                ['F4', 25, 1],
                ['E4', 26, 0.5],
                ['D4', 26.5, 1.5],
                //----------------------------------------
                ['C4', 28, 3],
                ['C#4', 31, 1],
                //----------------------------------------
                ['D4', 32, 0.5],
                ['A4', 32.5, 1],
                ['A4', 33.5, 3.5], //---------------------
                ['C5', 37, 2],
                ['B4', 39, 1],
                //----------------------------------------
                ['G4', 40, 7], //-------------------------
                ['B3', 47, 1],
                //----------------------------------------
                ['C4', 48, 0.5],
                ['F4', 48.5, 1],
                ['F4', 49.5, 3.5], //---------------------
                ['A4', 53, 2],
                ['G4', 55, 1],
                //----------------------------------------
                ['F4', 56, 2],
                ['E4', 58, 7],
            ],
            chords: [
                { root: 'A', quality: 'minor', extension: '7', position: 0, duration: 4, },
                { root: 'D', quality: 'minor', extension: '7', position: 4, duration: 4, },
                { root: 'G', quality: 'major', extension: '7', position: 8, duration: 4, },
                { root: 'C', quality: 'major', extension: 'maj7', position: 12, duration: 2, },
                { root: 'C', quality: 'major', extension: '7', position: 14, duration: 2, },
                { root: 'F', quality: 'major', extension: 'maj7', position: 16, duration: 4, },
                { root: 'B', quality: 'minor', extension: '7(b5)', position: 20, duration: 4, },
                { root: 'E', quality: 'minor', extension: '7', position: 24, duration: 4, },
                { root: 'A', quality: 'minor', extension: '7', position: 28, duration: 2, },
                { root: 'A', quality: 'major', extension: '7', position: 30, duration: 2, },
                { root: 'D', quality: 'minor', extension: '7', position: 32, duration: 4, },
                { root: 'G', quality: 'major', extension: '7', position: 36, duration: 4, },
                { root: 'C', quality: 'major', extension: 'maj7', position: 40, duration: 4, },
                { root: 'E', quality: 'minor', extension: '7', position: 44, duration: 2, },
                { root: 'A', quality: 'minor', extension: '7', position: 46, duration: 2, },
                { root: 'D', quality: 'minor', extension: '7', position: 48, duration: 4, },
                { root: 'G', quality: 'major', extension: '7', position: 52, duration: 4, },
                { root: 'F', quality: 'major', extension: '6', position: 56, duration: 2, },
                { root: 'C', quality: 'major', extension: 'maj7', position: 58, duration: 2, },
                { root: 'B', quality: 'minor', extension: '7(b5)', position: 60, duration: 2, },
                { root: 'E', quality: 'minor', extension: '7', position: 62, duration: 2, },
            ],
        },
        '17-26': {
            length: 40,
            melody: [
                ['C5', 0, 1],
                ['B4', 1, 1],
                ['A4', 2, 0.5],
                ['G4', 2.5, 1.5],
                //----------------------------------------
                ['F4', 4, 1.5],
                ['G4', 5.5, 0.5],
                ['A4', 6, 1],
                ['C5', 7, 1],
                //----------------------------------------
                ['B4', 8, 1],
                ['A4', 9, 1],
                ['G4', 10, 0.5],
                ['F4', 10.5, 1.5],
                //----------------------------------------
                ['E4', 12, 4],
                //----------------------------------------
                ['A4', 16, 1],
                ['G4', 17, 1],
                ['F4', 18, 0.5],
                ['E4', 18.5, 1.5],
                //----------------------------------------
                ['D4', 20, 1],
                ['E4', 21, 1],
                ['F4', 22, 1],
                ['A4', 23, 1],
                //----------------------------------------
                ['G#4', 24, 1],
                ['F4', 25, 1],
                ['E4', 26, 0.5],
                ['D4', 26.5, 1.5],
                //----------------------------------------
                ['C4', 28, 3],
                ['C#4', 31, 1],
                //----------------------------------------
                ['D4', 32, 0.5],
                ['A4', 32.5, 1],
                ['A4', 33.5, 3.5], //---------------------
                ['C5', 37, 2],
                ['B4', 39, 1],
            ],
            chords: [
                { root: 'A', quality: 'minor', extension: '7', position: 0, duration: 4, },
                { root: 'D', quality: 'minor', extension: '7', position: 4, duration: 4, },
                { root: 'G', quality: 'major', extension: '7', position: 8, duration: 4, },
                { root: 'C', quality: 'major', extension: 'maj7', position: 12, duration: 2, },
                { root: 'C', quality: 'major', extension: '7', position: 14, duration: 2, },
                { root: 'F', quality: 'major', extension: 'maj7', position: 16, duration: 4, },
                { root: 'B', quality: 'minor', extension: '7(b5)', position: 20, duration: 4, },
                { root: 'E', quality: 'minor', extension: '7', position: 24, duration: 4, },
                { root: 'A', quality: 'minor', extension: '7', position: 28, duration: 2, },
                { root: 'A', quality: 'major', extension: '7', position: 30, duration: 2, },
                { root: 'D', quality: 'minor', extension: '7', position: 32, duration: 4, },
                { root: 'G', quality: 'major', extension: '7', position: 36, duration: 4, },
            ],
        },
        '27-32': {
            length: 24,
            melody: [
                ['G4', 0, 7], //-------------------------
                ['G#4', 7, 1],
                //----------------------------------------
                ['A4', 8, 0.5],
                ['C4', 8.5, 1],
                ['C4', 9.5, 3.5], //---------------------
                ['C4', 13, 2],
                ['D4', 15, 1],
                //----------------------------------------
                ['C4', 16, 4],
            ],
            chords: [
                { root: 'E', quality: 'minor', extension: '7', position: 0, duration: 4, },
                { root: 'A', quality: 'minor', extension: '7', position: 4, duration: 4, },
                { root: 'D', quality: 'minor', extension: '7', position: 8, duration: 4, },
                { root: 'G', quality: 'major', extension: '7', position: 12, duration: 4, },
                { root: 'C', quality: 'major', extension: '6', position: 16, duration: 4, },
                { root: 'B', quality: 'minor', extension: '7(b5)', position: 20, duration: 2, },
                { root: 'E', quality: 'minor', extension: '7', position: 22, duration: 2, },
            ],
        },
        '33-38': {
            length: 24,
            melody: [
                ['E5', 0, 7], //-------------------------
                ['C5', 7, 1],
                //----------------------------------------
                ['D5', 8, 0.5],
                ['A4', 8.5, 1],
                ['A4', 9.5, 3.5], //---------------------
                ['B4', 13, 2],
                ['D5', 15, 1],
                //----------------------------------------
                ['C5', 16, 7],
            ],
            chords: [
                { root: 'E', quality: 'minor', extension: '7', position: 0, duration: 4, },
                { root: 'A', quality: 'minor', extension: '7', position: 4, duration: 4, },
                { root: 'D', quality: 'minor', extension: '7', position: 8, duration: 4, },
                { root: 'G', quality: 'major', extension: '7', position: 12, duration: 4, },
                { root: 'C', quality: 'major', extension: '6', position: 16, duration: 8, },
            ],
        },
    }

    const order = ['1-16', '17-26', '27-32', '1-16', '17-26', '33-38',]

    const melody: Note[] = []

    const chords: Chord[] = []

    let position: BeatsIntoSong = 0

    for (const key of order) {
        const section = sections[key]

        const sectionLength = section.length
        const sectionMelody = section.melody
        const sectionChords = section.chords

        for (const [notePitch, notePosition, noteDuration] of sectionMelody) {
            melody.push([notePitch, notePosition + position, noteDuration])
        }

        for (const chord of sectionChords) {
            chords.push({ ...chord, position: chord.position + position })
        }

        position += sectionLength
    }

    return { length: position, melody, chords }
})()
const velocity = Dynamics.mf

// Fast to work with
const mpb: Milliseconds = convertBpmToMpb(tempo)

function* playBassPart(bass: Part): Generator<Event> {
    const directionControl = bass.controller.getOptionControl('Direction: ', ['down', 'up'])

    const lowestBassSpecificPitch = 'E1'
    const lowestBassNote = convertSpecificPitchToMidiNumber(lowestBassSpecificPitch)

    const swingAmount = 0.2
    const swingDivision = 1

    function bringIntoBassRange(pitch: PitchNumber): PitchNumber {
        return pitch >= lowestBassNote ? pitch : bringIntoBassRange(pitch + 12)
    }

    yield {
        time: -Infinity,
        type: EventType.Compute
    }

    for (const [chordIndex, { root, quality, extension, position, duration }] of song.chords.entries()) {
        const rootNote = convertSpecificPitchToMidiNumber(`${root}1`)
        const bassRoot = bringIntoBassRange(rootNote)
        const third = quality === 'major' ? bassRoot + 4 : bassRoot + 3
        const fifth = extension === '7(b5)' ? bassRoot + 6 : bassRoot + 7
        const extensionNote = extension === '6' ? bassRoot + 9 : extension === '7' ? bassRoot + 10 : extension === 'maj7' ? bassRoot + 11 : extension === '7(b5)' ? bassRoot + 10 : bassRoot + 12
        const tastefulQuarterNote = tastefullyShortenDuration(1)

        if (duration === 4) {
            console.log('chord', root, quality, extension, position, duration)

            const notes = directionControl.value ? [bassRoot, third, fifth, extensionNote] : [bassRoot + 12, extensionNote, fifth, third]

            for (const [index, pitch] of notes.entries()) {
                yield {
                    type: EventType.NoteOn,
                    time: computeBeatTiming(position + index, mpb, swingAmount, swingDivision),
                    part: bass,
                    pitch,
                    velocity,
                }

                yield {
                    type: EventType.NoteOff,
                    time: computeBeatTiming(position + index + tastefulQuarterNote, mpb, swingAmount, swingDivision),
                    part: bass,
                    pitch,
                }
            }
        } else if (duration === 2) {
            console.log('chord', root, quality, extension, position, duration)

            function isPaired(testChord: Chord): Boolean {
                console.log('found a pair!')
                return testChord.root === root && testChord.extension === extension
            }

            const isFirstPart = position % beatsPerBar === 0
            const isPartOfPair = isPaired(song.chords[chordIndex + (isFirstPart ? 1 : -1)])
            const bassRootTwoBeats = (directionControl.value ? 0 : 12) + bassRoot
            const notes = isPartOfPair ? (isFirstPart ? [bassRootTwoBeats, bassRootTwoBeats] : [fifth, fifth]) : [bassRootTwoBeats, fifth]
            for (const [index, pitch] of notes.entries()) {
                yield {
                    type: EventType.NoteOn,
                    time: computeBeatTiming(position + index, mpb, swingAmount, swingDivision),
                    part: bass,
                    pitch,
                    velocity,
                }

                yield {
                    type: EventType.NoteOff,
                    time: computeBeatTiming(position + index + tastefulQuarterNote, mpb, swingAmount, swingDivision),
                    part: bass,
                    pitch,
                }
            }
        } else {
            const bassRootTwoBeats = (directionControl.value ? 0 : 12) + bassRoot
            console.log('chord', root, quality, extension, position, duration)
            for (let i = 0; i < duration; i += 1) {
                yield {
                    type: EventType.NoteOn,
                    time: computeBeatTiming(position + i, mpb, swingAmount, swingDivision),
                    part: bass,
                    pitch: i % 2 === 0 ? bassRootTwoBeats : fifth,
                    velocity,
                }

                yield {
                    type: EventType.NoteOff,
                    time: computeBeatTiming(position + i + tastefulQuarterNote, mpb, swingAmount, swingDivision),
                    part: bass,
                    pitch: i % 2 === 0 ? bassRootTwoBeats : fifth,
                }
            }
        }
    }
}

function* playLeadPart(lead: Part): Generator<Event> {
    const swingAmount = 0.25
    const swingDivision = 1

    for (const [specificPitch, position, duration] of song.melody) {
        const pitch = convertSpecificPitchToMidiNumber(specificPitch)
        const startTime = computeBeatTiming(position, mpb, swingAmount, swingDivision)
        const endTime = computeBeatTiming(position + tastefullyShortenDuration(duration), mpb, swingAmount, swingDivision)
        yield {
            type: EventType.NoteOn,
            time: startTime,
            part: lead,
            pitch,
            velocity,
        }

        yield {
            type: EventType.NoteOff,
            time: endTime,
            part: lead,
            pitch,
        }
    }
}

const chart: Chart = {
    title: 'Fly Me to the Moon',
    compose: function* ({ bass, lead }) {
        for (const event of sortGenerators(playBassPart(bass), playLeadPart(lead))) {
            yield event
        }
    },
}

export default chart