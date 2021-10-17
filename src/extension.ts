import * as vscode from 'vscode'
import createGistByFile from './utils/createGistByFile'
import getAuthUserGists from './utils/getAuthUserGists'
// import reload from './deprecate/reload'
import rmGist from './utils/rmGist'
import setToken from './utils/setToken'

export function activate(context: vscode.ExtensionContext) {
  // 保存token
  let pat = vscode.commands.registerCommand('gist-vscode.setToken', () => setToken(context))

  // 获取验证用户的gists
  let authUserList = vscode.commands.registerCommand('gist-vscode.getAuthUserGists', () =>
    getAuthUserGists(context)
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
    rmGist(context)
  })
  const subs = [pat, authUserList, createGistByFileHandle, delGistHandle]
  context.subscriptions.push(...subs)
}

// this method is called when your extension is deactivated
export function deactivate() {}
