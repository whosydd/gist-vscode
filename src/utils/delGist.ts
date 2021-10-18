import * as vscode from 'vscode'
import updateAuthUserGists from '../api/updateAuthUserGists'
import octokit from '../config/octokit'
import { setTokenTip } from './tips'

export default async (context: vscode.ExtensionContext) => {
  try {
    // 先获取最新的gists列表
    const { files, pickList } = await updateAuthUserGists(context)

    const pickFiles = await vscode.window.showQuickPick(pickList, {
      canPickMany: true,
    })

    if (pickFiles === undefined) return

    const rmList = pickFiles.map(pickFile => {
      const [filename, desc, gist_id] = pickFile.split(/  \|  /)
      return gist_id
    })

    // TODO: 备份gist（将删除的gist暂时保存在context.workspaceState中，防止后悔）

    // 获取token
    const token: { default: string } | undefined = context.globalState.get('token')
    if (token === undefined) throw new Error('Token not set yet')

    // 发送请求
    rmList.forEach(gist_id => octokit(token.default).rest.gists.delete({ gist_id }))

    vscode.window.showInformationMessage('Done!')
  } catch (error: any) {
    if (error.message === 'Token not set yet') setTokenTip(error)
    else vscode.window.showErrorMessage(error.message)
  }
}
