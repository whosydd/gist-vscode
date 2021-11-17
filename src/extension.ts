import * as vscode from 'vscode'
import createGistByFile from './utils/createGistByFile'
import createGistBySelect from './utils/createGistBySelect'
import delGist from './utils/delGist'
import getAuthUserGists from './utils/getAuthUserGists'
import getGistId from './utils/getGistId'
import openInBrowser from './utils/openInBrowser'
import rmWorkspaceState from './utils/rmWorkspaceState'
import setToken from './utils/setToken'

export function activate(context: vscode.ExtensionContext) {
  // 保存token
  let patHandler = vscode.commands.registerCommand('gist-vscode.setToken', () => setToken(context))

  // 获取验证用户的gists
  let getAuthUserGistsHandler = vscode.commands.registerCommand(
    'gist-vscode.getAuthUserGists',
    () => getAuthUserGists(context)
  )

  // 获取.gist/文件夹中文件的gist_id
  let getGistIdHandler = vscode.commands.registerCommand('gist-vscode.getGistId', file =>
    getGistId(file, context)
  )

  // 创建gist - 文件
  let createGistByFileHandler = vscode.commands.registerCommand(
    'gist-vscode.createGistByFile',
    file => {
      createGistByFile(file, context)
    }
  )

  // 创建gist - 代码
  let createGistBySelectHandler = vscode.commands.registerCommand(
    'gist-vscode.createGistBySelect',
    file => {
      createGistBySelect(file, context)
    }
  )

  // 删除gist
  let delGistHandler = vscode.commands.registerCommand('gist-vscode.delGist', file => {
    delGist(file, context)
  })

  // 删除workspaceState中的数据
  let rmWorkspaceStateHandler = vscode.commands.registerCommand(
    'gist-vscode.rmWorkspaceState',
    () => {
      rmWorkspaceState(context)
    }
  )

  // 浏览器打开gists
  let openInBrowserHandler = vscode.commands.registerCommand('gist-vscode.openInBrowser', () =>
    openInBrowser(context)
  )

  const subs = [
    patHandler,
    getAuthUserGistsHandler,
    getGistIdHandler,
    createGistByFileHandler,
    createGistBySelectHandler,
    delGistHandler,
    rmWorkspaceStateHandler,
    openInBrowserHandler,
  ]
  context.subscriptions.push(...subs)
}

// this method is called when your extension is deactivated
export function deactivate() {}
