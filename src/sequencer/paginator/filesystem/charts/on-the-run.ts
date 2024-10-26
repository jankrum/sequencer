import { Chart, BufferEvent, BufferComputeEvent, BufferEventType, BufferNoteOnEvent, BufferNoteOffEvent, MillisecondsIntoSong, Milliseconds, } from '../../../../types.ts'
import { convertSpecificPitchToMidiNumber, SpecificPitch, Dynamics, convertBpmToMpb, computeScheduleAheadTime, tastefullyShortenDuration, Bpm, Beats } from '../helper.ts'

// Easy to work with
const tempo: Bpm = 165
const specificPitches: SpecificPitch[] = ['E3', 'G3', 'A3', 'G3', 'D4', 'C4', 'D4', 'E4']
const runDurationInBeats: Beats = 2
const velocity: Dynamics = Dynamics.mf

// Fast to work with
const millisecondsPerBeat = convertBpmToMpb(tempo)
const pitches = specificPitches.map(convertSpecificPitchToMidiNumber)
const runDuration: Milliseconds = runDurationInBeats * millisecondsPerBeat
const stepDuration: Milliseconds = runDuration / pitches.length

// Chart
const chart: Chart = {
    title: 'On the Run',
    compose: ({ lead }): BufferEvent[] => {
        // Do this every time you compose
        const repeatAgainControl = lead.controller.getOptionControl('Repeat again: ', ['No', 'Yes'], '!')

        // Given a position of milliseconds into the song, maybe make a run
        function maybeMakeRun(position: MillisecondsIntoSong): BufferComputeEvent {
            return {
                time: position - computeScheduleAheadTime,
                type: BufferEventType.Compute,
                callback: (buffer) => {
                    // If we should repeat again, then make a run
                    // Otherwise, add nothing and the final finish event will be reached
                    if (repeatAgainControl.value) {
                        // Make a note on and off event for each pitch in the run
                        const noteOnAndOffEvents = pitches.map((pitch, index): [BufferNoteOnEvent, BufferNoteOffEvent] => {
                            const startPosition: MillisecondsIntoSong = position + (index * stepDuration)
                            return [
                                {
                                    time: startPosition,
                                    type: BufferEventType.NoteOn,
                                    part: lead,
                                    pitch,
                                    velocity,
                                },
                                {
                                    time: startPosition + tastefullyShortenDuration(stepDuration),
                                    type: BufferEventType.NoteOff,
                                    part: lead,
                                    pitch,
                                },
                            ]
                        }).flat()

                        // By unshifting, we are preventing the finish event from being reached
                        buffer.unshift(
                            ...noteOnAndOffEvents,
                            maybeMakeRun(position + runDuration),
                        )
                    }
                }
            }
        }

        // Only need one compute event to start everything
        return [
            maybeMakeRun(0),
        ]
    },
}

export default chart