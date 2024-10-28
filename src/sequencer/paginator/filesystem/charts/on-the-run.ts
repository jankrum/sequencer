import { Chart, EventType, Milliseconds, MillisecondsIntoSong, PitchNumber } from '../../../../types.ts'
import { Beats, Bpm, convertBpmToMpb, convertSpecificPitchToMidiNumber, Dynamics, SpecificPitch, tastefullyShortenDuration } from '../helper.ts'

// Easy to work with
const tempo: Bpm = 165
const specificPitches: SpecificPitch[] = ['E3', 'G3', 'A3', 'G3', 'D4', 'C4', 'D4', 'E4']
const runDurationInBeats: Beats = 2
const velocity: Dynamics = Dynamics.mf

// Fast to work with
const millisecondsPerBeat = convertBpmToMpb(tempo)
const runDuration: Milliseconds = runDurationInBeats * millisecondsPerBeat
const stepDuration: Milliseconds = runDuration / specificPitches.length
const fastNotes = specificPitches.map((specificPitch, index): [PitchNumber, MillisecondsIntoSong, MillisecondsIntoSong] => {
    const pitch = convertSpecificPitchToMidiNumber(specificPitch)
    const startTime = index * stepDuration
    const endTime = startTime + tastefullyShortenDuration(stepDuration)

    return [pitch, startTime, endTime]
})

// Chart
const chart: Chart = {
    title: 'On the Run',
    compose: function* ({ lead }) {
        const repeatAgainControl = lead.controller.getOptionControl('Repeat again: ', ['No', 'Yes'], '!')

        yield {
            time: -Infinity,
            type: EventType.Compute,
        }

        let position: MillisecondsIntoSong = 0

        while (repeatAgainControl.value) {
            for (const [pitch, startTime, endTime] of fastNotes) {
                yield {
                    time: position + startTime,
                    type: EventType.NoteOn,
                    part: lead,
                    pitch,
                    velocity,
                }

                yield {
                    time: position + endTime,
                    type: EventType.NoteOff,
                    part: lead,
                    pitch,
                }
            }

            position += runDuration
        }
    },
}

export default chart