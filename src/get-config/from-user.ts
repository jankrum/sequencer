import { PartName, Config } from '../types.ts'
import getProblems from './get-problems.ts'

class PartConfig {
    partName: PartName
    constructor(partName: PartName) {
        this.partName = partName
    }
}

class ConfigForm {
    constructor() {
        this.partConfigs = {
            bass: new PartConfig('bass',)
        }
    }
}

export default async function getConfigFromUser(): Promise<Config> {
    // The form we will be working with
    const configForm = new ConfigForm()

    // Add the form to the page
    document.body.appendChild(configForm)

    // Set up the form
    configForm.setUp()

    // Wait for the user to successfully submit the form
    const config = await configForm.getPromise()

    // Remove the form from the page
    return config
}