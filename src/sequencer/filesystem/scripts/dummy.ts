import { ScriptFunction, Controller, ScoreEvent, ScoreEventType, ScoreTempoEvent, ScoreNoteEvent, BufferTempoEvent, BufferNoteOnEvent, BufferNoteOffEvent, BufferEvent, BufferEventType } from '../../../types/chart.ts'

const script: ScriptFunction = (_controller: Controller, score: ScoreEvent[]): BufferEvent[] => {
    const eventBuffer: BufferEvent[] = []

    function transformTempoEvent(event: ScoreTempoEvent): BufferTempoEvent {
        return {
            position: event.position,
            type: BufferEventType.Tempo,
            bpm: event.bpm,
        }
    }

    function transformNoteEvent(event: ScoreNoteEvent): [BufferNoteOnEvent, BufferNoteOffEvent] {
        const noteOnEvent: BufferNoteOnEvent = {
            position: event.position,
            type: BufferEventType.NoteOn,
            pitch: event.pitch,
        }

        const noteOffEvent: BufferNoteOffEvent = {
            position: event.position + event.duration - 0.1,
            type: BufferEventType.NoteOff,
            pitch: event.pitch,
        }

        return [noteOnEvent, noteOffEvent]
    }

    for (const event of score) {
        switch (event.type) {
            case ScoreEventType.Tempo:
                eventBuffer.push(transformTempoEvent(event))
                break
            case ScoreEventType.Note:
                eventBuffer.push(...transformNoteEvent(event))
                break
            default:
                throw new Error('Invalid event type')
        }
    }

    function sortEventBuffer(unsortedEventBuffer: BufferEvent[]): BufferEvent[] {
        return unsortedEventBuffer.sort((a: BufferEvent, b: BufferEvent) => a.position - b.position)
    }

    const sortedEventBuffer = sortEventBuffer(eventBuffer)

    return sortedEventBuffer
}

export default script