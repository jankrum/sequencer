import { Event, EventType, Milliseconds, PitchNumber } from "../../../../../types"
import Part from "../../../../playbacker/band/part/part"
import { Beats, Bpm, Chord, computeBeatTiming, convertBpmToMpb, convertSpecificPitchToMidiNumber, Dynamics, SwingAmount, tastefullyShortenDuration } from "./helper"

export default function* jazzPianist(keys: Part, tempo: Bpm, swingAmount: SwingAmount, swingDivision: Beats, chords: Chord[], velocity: Dynamics): Generator<Event> {
    const mpb: Milliseconds = convertBpmToMpb(tempo)

    const lowestPitch = 'A3'
    const highestPitch = 'A4'
    const lowestNote = convertSpecificPitchToMidiNumber(lowestPitch)
    const highestNote = convertSpecificPitchToMidiNumber(highestPitch)

    function bringIntoRange(pitch: PitchNumber): PitchNumber {
        if (pitch < lowestNote) {
            return bringIntoRange(pitch + 12)
        } else if (pitch > highestNote) {
            return bringIntoRange(pitch - 12)
        } else {
            return pitch
        }
    }

    function getPitches(chord: Chord): PitchNumber[] {
        const rootNote = convertSpecificPitchToMidiNumber(`${chord.root}1`)
        const root = bringIntoRange(rootNote)
        const third = root + (chord.quality === 'major' ? 4 : 3)
        const fifth = root + (chord.extension === '7(b5)' ? 6 : 7)
        const extensionNote = chord.extension === '6' ? root + 9 : chord.extension === '7' ? root + 10 : chord.extension === 'maj7' ? root + 11 : chord.extension === '7(b5)' ? root + 10 : root + 12
        return [root, third, fifth, extensionNote].map(bringIntoRange)
    }

    // This prevents the first note from being evaluated when the chart is loaded
    yield {
        type: EventType.Compute,
        time: -Infinity,
    }

    for (const chord of chords) {
        const { position, duration } = chord
        const pitches = getPitches(chord)
        const startTime = computeBeatTiming(position, mpb, swingAmount, swingDivision)
        const endTime = computeBeatTiming(tastefullyShortenDuration(position + duration), mpb, swingAmount, swingDivision)
        for (const pitch of pitches) {
            yield {
                type: EventType.NoteOn,
                time: startTime,
                part: keys,
                pitch,
                velocity,
            }
        }

        for (const pitch of pitches) {
            yield {
                type: EventType.NoteOff,
                time: endTime,
                part: keys,
                pitch,
            }
        }
    }
}