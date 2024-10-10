import { Chart, ScoreEventType } from '../types.ts'
import dummyScript from '../scripts/dummy.ts'

const chart: Chart = {
    title: "Bass Scale",
    parts: {
        bass: {
            script: dummyScript,
            score: [
                {
                    position: -Infinity,
                    type: ScoreEventType.Tempo,
                    bpm: 120
                },
                {
                    position: 0,
                    type: ScoreEventType.Note,
                    pitch: 36,
                    duration: 1
                },
                {
                    position: 1,
                    type: ScoreEventType.Note,
                    pitch: 38,
                    duration: 1
                },
                {
                    position: 2,
                    type: ScoreEventType.Note,
                    pitch: 40,
                    duration: 1
                },
                {
                    position: 3,
                    type: ScoreEventType.Note,
                    pitch: 41,
                    duration: 1
                },
                {
                    position: 4,
                    type: ScoreEventType.Note,
                    pitch: 43,
                    duration: 1
                },
                {
                    position: 5,
                    type: ScoreEventType.Note,
                    pitch: 45,
                    duration: 1
                },
                {
                    position: 6,
                    type: ScoreEventType.Note,
                    pitch: 47,
                    duration: 1
                },
                {
                    position: 7,
                    type: ScoreEventType.Note,
                    pitch: 48,
                    duration: 1
                },
            ],
        },
    },
}

export default chart