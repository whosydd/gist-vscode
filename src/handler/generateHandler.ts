import download = require('download')
import { commands, ProgressLocation, window, workspace } from 'vscode'
import { ajaxGetAuthGist } from '../utils/ajax'
import { GenerateItem } from '../utils/types'

export default (folder: any) => {
  const dst = folder.fsPath

  const files: GenerateItem[] = workspace.getConfiguration('gist-vscode').get('generate')!

  if (files.length === 0) {
    window.showWarningMessage('Sorry, empty list!', 'Generate Now').then(async value => {
      if (value === 'Generate Now') {
        commands.executeCommand('workbench.action.openApplicationSettingsJson')
        workspace.getConfiguration('gist-vscode').update('generate', [{ label: '', url: '' }], true)
      }
    })
    return
  }

  window.withProgress(
    {
      location: ProgressLocation.Notification,
    },
    async progress => {
      progress.report({
        message: 'Downloading ...',
      })

      files.forEach(async item => {
        const { label, url } = item
        const [owner, gist_id] = url.split('https://gist.github.com/')[1].split('/')

        const res = await ajaxGetAuthGist(gist_id)

        if (res.status !== 200) {
          window.showErrorMessage(`Request failed. ${res.status}`)
        } else {
          const raw_url = res.data.files![label]?.raw_url!
          await download(raw_url, dst, { filename: label })
        }
      })
    }
  )
}
