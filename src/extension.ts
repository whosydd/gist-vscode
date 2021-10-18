import * as vscode from 'vscode'
import createGistByFile from './utils/createGistByFile'
import delGist from './utils/delGist'
import getAuthUserGists from './utils/getAuthUserGists'
import getGistId from './utils/getGistId'
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

  const subs = [pat, getAuthUserGistsHandle, getGistIdHandle, createGistByFileHandle, delGistHandle]
  context.subscriptions.push(...subs)
}

// this method is called when your extension is deactivated
export function deactivate() {}
