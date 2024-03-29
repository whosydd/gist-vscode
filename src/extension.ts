import * as vscode from 'vscode'
import authGistsHandler from './handler/authGistsHandler'
import createGistHandler from './handler/createGistHandler'
import deleteGistsHandler from './handler/deleteGistsHandler'
import generateHandler from './handler/generateHandler'
import userGistsHandler from './handler/userGistsHandler'
import { setTokenHandler } from './utils/pat'
import { AjaxType, CreateGistType } from './utils/types'

export function activate(context: vscode.ExtensionContext) {
  // set token
  const setToken = vscode.commands.registerCommand('gist-vscode.setToken', setTokenHandler)

  // list auth user gists
  const showAuthGists = vscode.commands.registerCommand('gist-vscode.showAuthGists', uri => {
    authGistsHandler(uri, AjaxType.SHOW_AUTH_GISTS)
  })

  // list public gists
  const showPublicGists = vscode.commands.registerCommand('gist-vscode.showPublicGists', uri =>
    authGistsHandler(uri, AjaxType.SHOW_PUBLIC_GISTS)
  )

  // list starred gists
  const showStarredGists = vscode.commands.registerCommand('gist-vscode.showStarredGists', uri => {
    authGistsHandler(uri, AjaxType.SHOW_STARRED_GISTS)
  })

  // list other user gists
  const showUserGists = vscode.commands.registerCommand('gist-vscode.showUserGists', uri =>
    userGistsHandler(uri)
  )

  // create a gist by selected
  const createGistBySelect = vscode.commands.registerCommand('gist-vscode.createGistBySelect', () =>
    createGistHandler(CreateGistType.SELECTED)
  )

  // create a gist by file
  const createGistByFile = vscode.commands.registerCommand('gist-vscode.createGistByFile', file =>
    createGistHandler(CreateGistType.FILE, file)
  )

  // delete gists
  const deleteGists = vscode.commands.registerCommand('gist-vscode.deleteGists', deleteGistsHandler)

  // generate
  const generate = vscode.commands.registerCommand('gist-vscode.generate', uri =>
    generateHandler(uri)
  )

  const list = [
    setToken,
    showAuthGists,
    showPublicGists,
    showStarredGists,
    showUserGists,
    createGistBySelect,
    createGistByFile,
    deleteGists,
    generate,
  ]

  context.subscriptions.push(...list)
}

// This method is called when your extension is deactivated
export function deactivate() {}
