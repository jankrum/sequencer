import { Event, EventType, Milliseconds, PitchNumber } from "../../../../../types"
import Part from "../../../../playbacker/band/part/part"
import { Beats, Bpm, Chord, computeBeatTiming, convertBpmToMpb, convertSpecificPitchToMidiNumber, Dynamics, SwingAmount, tastefullyShortenDuration } from "./helper"

export default function* jazzBassist(bass: Part, tempo: Bpm, beatsPerBar: Beats, swingAmount: SwingAmount, swingDivision: Beats, chords: Chord[], velocity: Dynamics): Generator<Event> {
    const directionControl = bass.controller.getOptionControl('DIR ', [`\\/`, '/\\'])

    const mpb: Milliseconds = convertBpmToMpb(tempo)
    const tastefulQuarterNote = tastefullyShortenDuration(1)

    const lowestBassSpecificPitch = 'E1'
    const lowestBassNote = convertSpecificPitchToMidiNumber(lowestBassSpecificPitch)

    function bringIntoBassRange(pitch: PitchNumber): PitchNumber {
        return pitch >= lowestBassNote ? pitch : bringIntoBassRange(pitch + 12)
    }

    function getPitches(index: number, chord: Chord): PitchNumber[] {
        const rootNote = convertSpecificPitchToMidiNumber(`${chord.root}1`)
        const root = bringIntoBassRange(rootNote)
        const third = root + (chord.quality === 'major' ? 4 : 3)
        const fifth = root + (chord.extension === '7(b5)' ? 6 : 7)
        const extensionNote = chord.extension === '6' ? root + 9 : chord.extension === '7' ? root + 10 : chord.extension === 'maj7' ? root + 11 : chord.extension === '7(b5)' ? root + 10 : root + 12
        const octave = root + 12
        const rootOrOctave = directionControl.value ? root : octave

        switch (chord.duration) {
            case 4:
                return directionControl.value ? [root, third, fifth, extensionNote] : [octave, extensionNote, fifth, third]
            case 2:
                const isFirstPart = chord.position % beatsPerBar === 0
                const neighborChord = chords[index + (isFirstPart ? 1 : -1)]
                console.log('checking neighbor chord', chord, neighborChord)
                const isPartOfPair = neighborChord.root === chord.root && neighborChord.extension === chord.extension
                return isPartOfPair ? (isFirstPart ? [rootOrOctave, rootOrOctave] : [fifth, fifth]) : [rootOrOctave, fifth]
            default:
                return Array.from({ length: chord.duration }, (_, i) => i % 2 === 0 ? rootOrOctave : fifth)
        }
    }

    // This prevents the first note from being evaluated when the chart is loaded
    yield {
        type: EventType.Compute,
        time: -Infinity,
    }

    for (const [index, chord] of chords.entries()) {
        for (const [noteIndex, pitch] of getPitches(index, chord).entries()) {
            const position = chord.position + noteIndex
            const startTime = computeBeatTiming(position, mpb, swingAmount, swingDivision)
            const endTime = computeBeatTiming(position + tastefulQuarterNote, mpb, swingAmount, swingDivision)

            yield {
                type: EventType.NoteOn,
                time: startTime,
                part: bass,
                pitch,
                velocity,
            }

            yield {
                type: EventType.NoteOff,
                time: endTime,
                part: bass,
                pitch,
            }
        }
    }
}