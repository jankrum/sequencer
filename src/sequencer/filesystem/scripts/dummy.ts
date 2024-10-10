import { ScriptFunction, Controller, ScoreEvent, ScoreEventType, EventBufferEvent, EventBufferEventType } from '../types.ts'

const script: ScriptFunction = (_controller: Controller, score: ScoreEvent[]): EventBufferEvent[] => {
    const eventBuffer: EventBufferEvent[] = []

    for (const event of score) {
        switch (event.type) {
            case ScoreEventType.Tempo:
                eventBuffer.push({
                    position: event.position,
                    type: EventBufferEventType.Tempo,
                    bpm: event.bpm,
                })
                break
            case ScoreEventType.Note:
                const { position, pitch, duration } = event
                eventBuffer.push({
                    position,
                    type: EventBufferEventType.NoteOn,
                    pitch,
                })
                eventBuffer.push({
                    position: position + duration - 0.1,
                    type: EventBufferEventType.NoteOff,
                    pitch,
                })
                break
            default:
                throw new Error('Invalid event type')
        }
    }

    const sortedEventBuffer: EventBufferEvent[] = eventBuffer.toSorted((a: EventBufferEvent, b: EventBufferEvent) => a.position - b.position)

    return sortedEventBuffer
}

export default script