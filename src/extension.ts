import * as vscode from 'vscode'
import { showAuthGistsHandler } from './utils/handler'
import { setTokenHandler } from './utils/pat'

export function activate(context: vscode.ExtensionContext) {
  // set token
  const setToken = vscode.commands.registerCommand('gist-vscode.setToken', () => setTokenHandler())

  const showAuthGists = vscode.commands.registerCommand('gist-vscode.showAuthGists', () =>
    showAuthGistsHandler(context)
  )

  const list = [setToken, showAuthGists]

  context.subscriptions.push(...list)
}

// This method is called when your extension is deactivated
export function deactivate() {}
