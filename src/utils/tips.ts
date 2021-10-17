import * as vscode from 'vscode'

export const setTokenTip = (error: any) =>
  vscode.window
    .showErrorMessage(typeof error === 'string' ? error : error.message, 'Set Token', 'Later')
    .then(value => {
      if (value === 'Set Token') vscode.commands.executeCommand('gist-vscode.setToken')
    })
