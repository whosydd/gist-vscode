import path = require('path')
import * as vscode from 'vscode'

export default async (file: { fsPath: string }, context: vscode.ExtensionContext) => {
  try {
    const filename = file.fsPath.split(path.sep).pop()
    if (filename === undefined) throw new Error(`Not found ${filename}!`)

    const gist_id: string | undefined = context.workspaceState.get(filename)
    if (gist_id === undefined) throw new Error(`Not found ${filename}!`)

    vscode.env.clipboard.writeText(gist_id)

    vscode.window.showInformationMessage('Copied!')
  } catch (error: any) {
    vscode.window.showErrorMessage(error.message)
  }
}
