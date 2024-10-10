// Imports
import dm from '../dm.ts'
import Chart from '../types/chart.ts'
import setlist from './filesystem/setlist.ts'

// Enums used in multiple classes
const enum PlaybackState {
    Playing,
    Paused,
    Stopped,
}

const enum PlaybackAction {
    Play,
    Pause,
    Resume,
    Stop,
}

//#region Transporter
const transporterSelector = '#transporter'

const enum TransporterButton {
    Previous = 'previous',
    Play = 'play',
    Pause = 'pause',
    Stop = 'stop',
    Next = 'next',
}

const buttonNamesAndSymbols: [TransporterButton, string][] = [
    [TransporterButton.Previous, '⏮'],
    [TransporterButton.Play, '▶'],
    [TransporterButton.Pause, '⏸'],
    [TransporterButton.Stop, '⏹'],
    [TransporterButton.Next, '⏭'],
]

const makeButton = ([name, symbol]: [TransporterButton, string]): [string, HTMLButtonElement] => [name, dm('button', {}, symbol)]
const makeButtons = () => Object.fromEntries(buttonNamesAndSymbols.map(makeButton))

const STATE_DICT = {
    [PlaybackState.Playing]: {
        play: true,
        pause: false,
        stop: false,
    },
    [PlaybackState.Paused]: {
        play: false,
        pause: true,
        stop: false,
    },
    [PlaybackState.Stopped]: {
        play: false,
        pause: true,
        stop: true,
    },
}

class Transporter {
    #chartTitleHeading = dm('h2')
    #buttons = makeButtons()

    constructor() {
        const transporterDiv = document.querySelector(transporterSelector)

        if (!transporterDiv) {
            throw new Error(`Transporter not found: ${transporterSelector}`)
        }

        const buttonDiv = dm('div', {}, ...Object.values(this.#buttons))

        transporterDiv?.append(this.#chartTitleHeading, buttonDiv)
    }

    changeChart(chartTitle: string, canPrevious: boolean, canNext: boolean): void {
        this.#chartTitleHeading.innerText = chartTitle
        this.#buttons.previous.disabled = !canPrevious
        this.#buttons.next.disabled = !canNext
    }

    changePlayback(playbackState: PlaybackState): void {
        for (const [buttonName, isDisabled] of Object.entries(STATE_DICT[playbackState])) {
            this.#buttons[buttonName].disabled = isDisabled
        }
    }

    connect(paginator: Paginator, playbacker: Playbacker): void {
        // To the paginator
        this.#buttons[TransporterButton.Previous].addEventListener('click', () => paginator.goPrevious())
        this.#buttons[TransporterButton.Next].addEventListener('click', () => paginator.goNext())

        // To the playbacker
        this.#buttons[TransporterButton.Play].addEventListener('click', () => playbacker.play())
        this.#buttons[TransporterButton.Pause].addEventListener('click', () => playbacker.pause())
        this.#buttons[TransporterButton.Stop].addEventListener('click', () => playbacker.stop())
    }
}
//#endregion

//#region Paginator
const setlistLength = setlist.length

class Paginator {
    #chartIndex = 0
    #subscription: (() => void) = () => { }

    goPrevious(): void {
        if (this.#chartIndex > 0) {
            this.#chartIndex -= 1
            this.#subscription()
        }
    }

    goNext(): void {
        if (this.#chartIndex < setlistLength - 1) {
            this.#chartIndex += 1
            this.#subscription()
        }
    }

    connect(transporter: Transporter, playbacker: Playbacker): void {
        this.#subscription = () => {
            const chart = setlist[this.#chartIndex]
            const chartTitle = chart.title
            const canPrevious = this.#chartIndex > 0
            const canNext = this.#chartIndex < setlistLength - 1

            transporter.changeChart(chartTitle, canPrevious, canNext)
            playbacker.changeChart(chart)
        }
    }

    start(): void {
        this.#subscription()
    }
}
//#endregion

//#region Playbacker
class Playbacker {
    #playbackState = PlaybackState.Paused
    #subscription: (playbackAction: PlaybackAction) => void = () => { }

    changeChart(chart: Chart): void {
        console.log('changeChart', chart)
        if (this.#playbackState != PlaybackState.Stopped) {
            this.stop()
        }
    }

    play(): void {
        switch (this.#playbackState) {
            case PlaybackState.Playing:
                console.log('already playing')
                break
            case PlaybackState.Paused:
                this.#subscription(PlaybackAction.Resume)
                console.log('resume')
                this.#playbackState = PlaybackState.Playing
                break
            case PlaybackState.Stopped:
                this.#subscription(PlaybackAction.Play)
                console.log('play')
                this.#playbackState = PlaybackState.Playing
                break
        }
    }

    pause(): void {
        switch (this.#playbackState) {
            case PlaybackState.Playing:
                this.#subscription(PlaybackAction.Pause)
                console.log('pause')
                this.#playbackState = PlaybackState.Paused
                break
            case PlaybackState.Paused:
                console.log('already paused')
                break
            case PlaybackState.Stopped:
                console.log('already stopped')
                break
        }
    }

    stop(): void {
        switch (this.#playbackState) {
            case PlaybackState.Playing:
                this.#subscription(PlaybackAction.Stop)
                console.log('stop')
                this.#playbackState = PlaybackState.Stopped
                break
            case PlaybackState.Paused:
                this.#subscription(PlaybackAction.Stop)
                console.log('stop')
                this.#playbackState = PlaybackState.Stopped
                break
            case PlaybackState.Stopped:
                console.log('already stopped')
                break
        }
    }

    connect(transporter: Transporter): void {
        this.#subscription = (playbackAction: PlaybackAction) => {
            switch (playbackAction) {
                case PlaybackAction.Play:
                    transporter.changePlayback(PlaybackState.Playing)
                    break
                case PlaybackAction.Pause:
                    transporter.changePlayback(PlaybackState.Paused)
                    break
                case PlaybackAction.Resume:
                    transporter.changePlayback(PlaybackState.Playing)
                    break
                case PlaybackAction.Stop:
                    transporter.changePlayback(PlaybackState.Stopped)
                    break
            }
        }
    }
}
//#endregion

//#region makeSequencer
export function makeSequencer(): void {
    const transporter = new Transporter()
    const paginator = new Paginator()
    const playbacker = new Playbacker()

    transporter.connect(paginator, playbacker)
    paginator.connect(transporter, playbacker)
    playbacker.connect(transporter)

    paginator.start()
}
//#endregion