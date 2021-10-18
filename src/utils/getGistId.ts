import path = require('path')
import * as vscode from 'vscode'
import createGistByFile from './createGistByFile'

export default async (file: { fsPath: string }, context: vscode.ExtensionContext) => {
  try {
    const filename = file.fsPath.split(path.sep).pop()
    if (filename === undefined) throw new Error(`Not found ${filename}!`)

    const gist_id: string | undefined = context.workspaceState.get(filename)
    if (gist_id === undefined) throw new Error(`Not found gist_id`)

    vscode.env.clipboard.writeText(gist_id)

    vscode.window.showInformationMessage('Copied!')
  } catch (error: any) {
    if (error.message === 'Not found gist_id')
      vscode.window
        .showInformationMessage('This file does not exist in gists!', 'Create', 'Ignore')
        .then(value => {
          if (value === 'Create') createGistByFile(file, context)
          else return
        })
    else vscode.window.showErrorMessage(error.message)
  }
}
