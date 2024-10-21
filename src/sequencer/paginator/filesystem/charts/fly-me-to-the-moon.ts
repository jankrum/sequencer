// https://musescore.com/user/34876540/scores/8425946

import { Chart, BufferEvent, } from '../../../../types.ts'
import Part from '../../../playbacker/band/part/part.ts'
import { SpecificPitch, BeatsIntoSong, Beats, PitchClass, pipe, finish, setTempo, PipeOperation, play, } from '../helper.ts'

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

function joinSections(sections: { [key: string]: Section }, order: string[]): Section {
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
}

const sections: { [key: string]: Section } = {
    '1-16': {
        length: 64,
        melody: [
            //----------------------------------------
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
            { root: 'F', quality: 'major', extension: '7', position: 16, duration: 4, },
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
            ['B4', 15, 1],
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

function makeBassPart(bass: Part, song: Section): PipeOperation[] {
    const notes: PipeOperation[] = []

    for (const { root, position, duration } of song.chords) {
        for (let i = 0; i < duration; i += 1) {
            notes.push(play(bass, `${root}1`, position + i, 0.7, 0x7F))
        }
    }

    return notes
}

function makeLeadPart(lead: Part, song: Section): PipeOperation[] {
    const notes: PipeOperation[] = []

    for (const [pitch, position, duration] of song.melody) {
        notes.push(play(lead, pitch, position, duration, 0x7F))
    }

    return notes
}

const order = ['1-16', '17-26', '27-32', '1-16', '17-26', '33-38',]

const song = joinSections(sections, order)

console.debug('song', song)

const chart: Chart = {
    title: 'Fly Me to the Moon',
    compose: ({ bass, drum, keys, lead }): BufferEvent[] => pipe(
        finish(drum, keys),
        setTempo(118),
        // setTempo(240),
        ...makeBassPart(bass, song),
        ...makeLeadPart(lead, song),
        finish(bass),
    ),
}

export default chart