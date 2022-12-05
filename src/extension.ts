import * as vscode from 'vscode'
import { createGistHandler, deleteGistsHandler, showGistsHandler } from './utils/handler'
import { setTokenHandler } from './utils/pat'
import { AjaxType, CreateGistType } from './utils/types'

export function activate(context: vscode.ExtensionContext) {
  // set token
  const setToken = vscode.commands.registerCommand('gist-vscode.setToken', setTokenHandler)

  // list auth user gists
  const showAuthGists = vscode.commands.registerCommand('gist-vscode.showAuthGists', () =>
    showGistsHandler(AjaxType.SHOW_AUTH_GISTS)
  )

  // list public gists
  const showPublicGists = vscode.commands.registerCommand('gist-vscode.showPublicGists', () =>
    showGistsHandler(AjaxType.SHOW_PUBLIC_GISTS)
  )

  // list starred gists
  const showStarredGists = vscode.commands.registerCommand('gist-vscode.showStarredGists', () =>
    showGistsHandler(AjaxType.SHOW_STARRED_GISTS)
  )

  // list other user gists
  const showUserGists = vscode.commands.registerCommand('gist-vscode.showUserGists', () =>
    showGistsHandler(AjaxType.SHOW_OTHER_USER_GISTS)
  )

  // create a gist by selected
  const createGistBySelect = vscode.commands.registerCommand('gist-vscode.createGistBySelect', () =>
    createGistHandler(CreateGistType.SELECTED)
  )

  // create a gist by file
  const createGistByFile = vscode.commands.registerCommand('gist-vscode.createGistByFile', () =>
    createGistHandler(CreateGistType.FILE)
  )

  // delete gists
  const deleteGists = vscode.commands.registerCommand('gist-vscode.deleteGists', deleteGistsHandler)

  const list = [
    setToken,
    showAuthGists,
    showPublicGists,
    showStarredGists,
    showUserGists,
    createGistBySelect,
    createGistByFile,
    deleteGists,
  ]

  context.subscriptions.push(...list)
}

// This method is called when your extension is deactivated
export function deactivate() {}
