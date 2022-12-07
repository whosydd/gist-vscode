import download = require('download')
import path = require('path')
import { ProgressLocation, window, workspace } from 'vscode'
import { GistQuickPickItem } from './types'

export default async (e: readonly GistQuickPickItem[]) => {
  const { label, description, raw_url, owner, buttons } = e[0]

  // path
  const root = workspace.workspaceFolders![0]
  const rootPath = root.uri.fsPath

  // input
  let input = await window.showInputBox({
    placeHolder: 'Like src/test',
    prompt: 'Please use relative path.',
  })

  if (input === undefined) {
    window.showErrorMessage('Try again!')
    return
  }

  let dst = ''
  if (input === '') {
    dst = rootPath
  } else {
    if (input.match(/\B\/.*/)) {
      input = input.slice(1)
    }
    dst = path.resolve(rootPath, input)
  }

  window.withProgress(
    {
      location: ProgressLocation.Notification,
    },
    async progress => {
      progress.report({
        message: 'Downloading ...',
      })
      await download(raw_url, dst, { filename: label })
    }
  )
}
