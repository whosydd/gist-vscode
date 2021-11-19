import path = require('path')
import * as vscode from 'vscode'
import createGistByFile from './createGistByFile'

export default async (file: vscode.Uri, context: vscode.ExtensionContext) => {
  try {
    const filename = file.fsPath.split(path.sep).pop()!

    const gist_id: string | undefined = context.workspaceState.get(filename)
    if (!gist_id) throw new Error(`Not found gist_id`)

    vscode.env.clipboard.writeText(gist_id)

    vscode.window.showInformationMessage('Copied!')
  } catch (error: any) {
    vscode.window
      .showInformationMessage(`Not found gist_id in local cache!`, 'Create gist', 'Ignore')
      .then(value => {
        if (value === 'Create gist') createGistByFile(file, context)
        else return
      })
  }
}
