import { Octokit } from '@octokit/rest'
import * as vscode from 'vscode'
import getAuthUserGists from './utils/getAuthUserGists'
import setToken from './utils/setToken'

export function activate(context: vscode.ExtensionContext) {
  console.log(context.workspaceState)
  console.log(context.globalState)

  // HOW:将token保存到用户上，可以使用多用户的配置，目前还不知道有没有必要
  // HOW:另外，保存方式也需要探讨，是写成一行用正则分割，还是分两次写
  // 保存token
  let pat = vscode.commands.registerCommand('gist-vscode.setToken', () => setToken(context))

  // 读取token
  const token: string | undefined = context.globalState.get('token')

  if (token === undefined) vscode.commands.executeCommand('gist-vscode.setToken')

  const octokit = new Octokit({
    auth: token,
    baseUrl: 'https://api.github.com',
  })

  // 获取验证用户的gists
  let authUserList = vscode.commands.registerCommand('gist-vscode.getAuthUserGists', () =>
    getAuthUserGists(octokit, context)
  )

  const subs = [pat, authUserList]
  context.subscriptions.push(...subs)
}

// this method is called when your extension is deactivated
export function deactivate() {}
