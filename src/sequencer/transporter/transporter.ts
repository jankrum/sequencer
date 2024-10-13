import { PlaybackState, TransporterConfig } from '../../types.ts'
import dm from '../../dm.ts'
import Paginator from '../paginator/paginator.ts'
import Playbacker from '../playbacker/playbacker.ts'

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

export default class Transporter {
    #chartTitleHeading = dm('h2')
    #buttons = makeButtons()

    constructor(config: TransporterConfig) {
        console.debug('Transporter', config)

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