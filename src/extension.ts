import * as vscode from 'vscode'
import createGistByFile from './utils/createGistByFile'
import delGist from './utils/delGist'
import getAuthUserGists from './utils/getAuthUserGists'
import getGistId from './utils/getGistId'
import getWorkspaceState from './utils/getWorkspaceState'
import rmWorkspaceState from './utils/rmWorkspaceState'
import setToken from './utils/setToken'

export function activate(context: vscode.ExtensionContext) {
  // 保存token
  let pat = vscode.commands.registerCommand('gist-vscode.setToken', () => setToken(context))

  // 获取验证用户的gists
  let getAuthUserGistsHandle = vscode.commands.registerCommand('gist-vscode.getAuthUserGists', () =>
    getAuthUserGists(context)
  )

  // 获取.gist/文件夹中文件的gist_id
  let getGistIdHandle = vscode.commands.registerCommand('gist-vscode.getGistId', file =>
    getGistId(file, context)
  )

  // 创建gist - 文件
  let createGistByFileHandle = vscode.commands.registerCommand(
    'gist-vscode.createGistByFile',
    file => {
      createGistByFile(file, context)
    }
  )

  // 删除gist
  let delGistHandle = vscode.commands.registerCommand('gist-vscode.delGist', file => {
    delGist(file, context)
  })

  // 获取workspaceState中的数据并存储到.gist文件夹中
  let getWorkspaceStateHandle = vscode.commands.registerCommand(
    'gist-vscode.getWorkspaceState',
    file => {
      getWorkspaceState(file, context)
    }
  )

  // 删除workspaceState中的数据
  let rmWorkspaceStateHandle = vscode.commands.registerCommand(
    'gist-vscode.rmWorkspaceState',
    () => {
      rmWorkspaceState(context)
    }
  )

  const subs = [
    pat,
    getAuthUserGistsHandle,
    getGistIdHandle,
    createGistByFileHandle,
    delGistHandle,
    getWorkspaceStateHandle,
    rmWorkspaceStateHandle,
  ]
  context.subscriptions.push(...subs)
}

// this method is called when your extension is deactivated
export function deactivate() {}
