import { Chart, EventType, MillisecondsIntoSong, PitchNumber } from '../../../../types.ts'
import { Bpm, convertBpmToMpb, Dynamics, triggerLength } from '../helper.ts'

// Constants
const minTempo: Bpm = 60
const maxTempo: Bpm = 240  // Maximum tempo should technically be ~630 BPM
const beatsPerBar = 4
const highPitch: PitchNumber = 33  // Metronome click sample
const lowPitch: PitchNumber = 32  // Metronome click sample
const velocity: Dynamics = Dynamics.f

// Chart
const chart: Chart = {
    title: 'Metronome',
    compose: function* ({ drum }) {
        const tempoControl = drum.controller.getRangeControl('Tempo: ', minTempo, maxTempo, ' BPM')

        let position: MillisecondsIntoSong = 0
        let beatNumber = 0

        while (true) {
            const isFirstBeat = beatNumber % beatsPerBar === 0
            const pitch = isFirstBeat ? highPitch : lowPitch

            yield {
                time: position,
                type: EventType.NoteOn,
                part: drum,
                pitch,
                velocity,
            }

            yield {
                time: position + triggerLength,
                type: EventType.NoteOff,
                part: drum,
                pitch,
            }

            position += convertBpmToMpb(tempoControl.value)
            beatNumber += 1
        }
    },
}

export default chart