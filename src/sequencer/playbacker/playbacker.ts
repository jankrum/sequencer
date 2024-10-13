import { PlaybackState, PlaybackAction, Chart, PartsConfig } from '../../types.ts'
import Band from './band/band.ts'
import Transporter from '../transporter/transporter.ts'

export default class Playbacker {
    #playbackState = PlaybackState.Paused
    #subscription: (playbackAction: PlaybackAction) => void = () => { }
    #band = new Band(this)

    constructor(config: PartsConfig) {
        console.debug('Playbacker', config)
    }

    changeChart(chart: Chart): void {
        console.debug('changeChart', chart)
        this.#band.changeChart(chart)
        if (this.#playbackState != PlaybackState.Stopped) {
            this.stop()
        }
    }

    play(): void {
        switch (this.#playbackState) {
            case PlaybackState.Playing:
                console.debug('already playing')
                break
            case PlaybackState.Paused:
                console.debug('resume')
                this.#subscription(PlaybackAction.Resume)
                this.#playbackState = PlaybackState.Playing
                break
            case PlaybackState.Stopped:
                console.debug('play')
                this.#subscription(PlaybackAction.Play)
                this.#playbackState = PlaybackState.Playing
                break
        }
    }

    pause(): void {
        switch (this.#playbackState) {
            case PlaybackState.Playing:
                console.debug('pause')
                this.#subscription(PlaybackAction.Pause)
                this.#playbackState = PlaybackState.Paused
                break
            case PlaybackState.Paused:
                console.debug('already paused')
                break
            case PlaybackState.Stopped:
                console.debug('already stopped')
                break
        }
    }

    stop(): void {
        switch (this.#playbackState) {
            case PlaybackState.Playing:
                console.debug('stop')
                this.#subscription(PlaybackAction.Stop)
                this.#playbackState = PlaybackState.Stopped
                break
            case PlaybackState.Paused:
                console.debug('stop')
                this.#subscription(PlaybackAction.Stop)
                this.#playbackState = PlaybackState.Stopped
                break
            case PlaybackState.Stopped:
                console.debug('already stopped')
                break
        }
    }

    connect(transporter: Transporter): void {
        this.#subscription = (playbackAction: PlaybackAction) => {
            switch (playbackAction) {
                case PlaybackAction.Play:
                    this.#band.play()
                    transporter.changePlayback(PlaybackState.Playing)
                    break
                case PlaybackAction.Pause:
                    this.#band.pause()
                    transporter.changePlayback(PlaybackState.Paused)
                    break
                case PlaybackAction.Resume:
                    this.#band.resume()
                    transporter.changePlayback(PlaybackState.Playing)
                    break
                case PlaybackAction.Stop:
                    this.#band.stop()
                    transporter.changePlayback(PlaybackState.Stopped)
                    break
            }
        }
    }
}