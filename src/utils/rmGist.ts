import { Octokit } from '@octokit/rest'
import * as vscode from 'vscode'

export default async (octokit: Octokit, context: vscode.ExtensionContext) => {
  await vscode.commands.executeCommand('gist-vscode.reload')
  const gistIds: object[] | undefined = context.workspaceState.get('gistId')

  if (gistIds === undefined) throw new Error('还未储存任何gist_id!')

  // const rmList = gistIds.filter(item => {
  //   const i = Object.values(item)[0].isDownload
  // })

  const list = gistIds.flatMap(item => `${Object.keys(item)} -- ${Object.values(item)}`)

  const pickFiles = await vscode.window.showQuickPick(list, {
    canPickMany: true,
  })

  if (pickFiles === undefined) return

  pickFiles.forEach(item => {
    const [_, gist_id] = item.split(' -- ')
    // 发送请求
    octokit.rest.gists.delete({ gist_id })
  })
  vscode.window.showInformationMessage('Select is already removed')
}
