import { Chart, BufferEvent, BufferComputeEvent, BufferEventType, BufferNoteOnEvent, BufferNoteOffEvent, } from '../../../../types.ts'
import Part from '../../../playbacker/band/part/part.ts'
import { convertSpecificPitchToMidiNumber, SpecificPitch, Beats, convertBpmToMpb, pipe, finish, PipeOperation, } from '../helper.ts'

const pitches: SpecificPitch[] = ['E3', 'G3', 'A3', 'G3', 'D4', 'C4', 'D4', 'E4']
const runDuration: Beats = 2
const stepDuration: Beats = runDuration / pitches.length
const millisecondsPerBeat = convertBpmToMpb(165)

function repeatRun(lead: Part): PipeOperation {
    // Doing this here to avoid doing it in the callback
    const midiPitches = pitches.map(convertSpecificPitchToMidiNumber)

    return (initialState) => {
        // This control determines if the run should repeat
        const repeatControl = lead.controller.getOptionControl('Repeat again: ', ['No', 'Yes'], '!')

        // Given a position, create a compute event that may create a run
        const maybeMakeRun = (position: number): BufferComputeEvent => ({
            time: (position * millisecondsPerBeat) - 100,  // Schedule the run to start 100ms before the position
            type: BufferEventType.Compute,
            callback: (buffer) => {
                if (repeatControl.value) {
                    // If the run should repeat, create note on and off events for each pitch
                    const noteOnAndOffEvents = midiPitches.map((pitch, index): [BufferNoteOnEvent, BufferNoteOffEvent] => {
                        const startPosition = position + (index * stepDuration)
                        return [
                            {
                                time: startPosition * millisecondsPerBeat,
                                type: BufferEventType.NoteOn,
                                part: lead,
                                pitch,
                                velocity: 0x7F,
                            },
                            {
                                time: (startPosition + stepDuration - 0.05) * millisecondsPerBeat,
                                type: BufferEventType.NoteOff,
                                part: lead,
                                pitch,
                            },
                        ]
                    }).flat()

                    // Push the note on and off events and a compute event for the next run
                    buffer.push(
                        ...noteOnAndOffEvents,
                        maybeMakeRun(position + runDuration),
                    )
                } else {
                    // If the run should not repeat, create a finish event
                    buffer.push({
                        time: position * millisecondsPerBeat,
                        type: BufferEventType.Finish,
                        part: lead,
                    })
                }
            }
        })

        return Object.assign({}, initialState, {
            bufferEvents: [
                ...initialState.bufferEvents,
                maybeMakeRun(0),
            ],
        })
    }
}

const chart: Chart = {
    title: 'On the Run',
    compose: ({ bass, drum, keys, lead }): BufferEvent[] => pipe(
        finish(bass, drum, keys),
        repeatRun(lead),
    ),
}

export default chart