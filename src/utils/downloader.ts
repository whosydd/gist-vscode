import download = require('download')
import path = require('path')
import { ExtensionContext, FoldingContext, ProgressLocation, Uri, window, workspace } from 'vscode'
import { GistQuickPickItem } from './types'
import fs = require('fs')

export default async (uri: Uri, e: readonly GistQuickPickItem[]) => {
  const { label, description, raw_url, owner, buttons } = e[0]

  let dst = ''

  // folder
  if (uri !== undefined) {
    dst = uri.fsPath
  } else {
    // path
    const root = workspace.workspaceFolders![0]
    const rootPath = root.uri.fsPath

    // input
    let input = await window.showInputBox({
      placeHolder: 'Like src/test',
      prompt: 'Please use relative path.',
    })

    if (input === undefined) {
      return
    }

    if (input === '') {
      dst = rootPath
    } else {
      if (input.match(/\B\/.*/)) {
        input = input.slice(1)
      }
      dst = path.resolve(rootPath, input)
    }
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
