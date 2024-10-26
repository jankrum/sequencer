import { PitchNumber, Chart, BufferEvent, BufferEventType, MillisecondsIntoSong, } from '../../../../types.ts'
import { Bpm, convertBpmToMpb, computeScheduleAheadTime, Dynamics, triggerLength } from '../helper.ts'

// Constants
const minTempo: Bpm = 60
const maxTempo: Bpm = 240  // Maximum tempo should technically be ~630 BPM
const pitch: PitchNumber = 32  // Metronome click sample
const velocity: Dynamics = Dynamics.f

// Chart
const chart: Chart = {
    title: 'Metronome',
    compose: ({ drum }): BufferEvent[] => {
        // Controls
        const tempoControl = drum.controller.getRangeControl('Tempo: ', minTempo, maxTempo, ' BPM')

        // Recursive function to make metronome beats
        // Schedules 
        const makeMetronomeBeatAtTime = (targetTime: MillisecondsIntoSong): BufferEvent[] => [
            {
                time: targetTime - computeScheduleAheadTime,
                type: BufferEventType.Compute,
                callback: (buffer) => {
                    const tempo = tempoControl.value
                    const nextTargetTime = targetTime + convertBpmToMpb(tempo)
                    buffer.push(...makeMetronomeBeatAtTime(nextTargetTime))
                }
            },
            {
                time: targetTime,
                type: BufferEventType.NoteOn,
                part: drum,
                pitch,
                velocity,
            },
            {
                time: targetTime + triggerLength,
                type: BufferEventType.NoteOff,
                part: drum,
                pitch,
            },
        ]

        return makeMetronomeBeatAtTime(0)
    },
}

export default chart