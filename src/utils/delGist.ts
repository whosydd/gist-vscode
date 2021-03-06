import path = require('path')
import * as fs from 'fs'
import * as vscode from 'vscode'
import octokit from '../config/octokit'
import { QuickPickItem } from '../config/types'
import { setTokenTip } from './tips'
import updateAuthUserGists from './updateAuthUserGists'

export default async (file: vscode.Uri, context: vscode.ExtensionContext) => {
  // 命令删除
  if (!file)
    try {
      let page = 1
      // 获取per_page的配置项
      let per_page: number = vscode.workspace.getConfiguration('gist-for-vscode').get('per_page')!

      const quickPick = vscode.window.createQuickPick()
      quickPick.canSelectMany = true
      const pickList = await updateAuthUserGists(context, page, per_page)
      const more = { label: 'More...' }

      // 当数据条数小于默认值时，不显示more
      if (per_page && pickList.length < per_page) quickPick.items = [...pickList]
      else quickPick.items = [more, ...pickList]

      quickPick.show()

      // 获取更多
      quickPick.onDidChangeSelection(async item => {
        if (item[0].label === 'More...') {
          quickPick.busy = true
          page++
          const tmp = [...quickPick.items]
          const pickList = await updateAuthUserGists(context, page, per_page)
          const newList = (pickList as vscode.QuickPickItem[]).concat(tmp.slice(1))
          quickPick.items = [more, ...newList]
          quickPick.busy = false

          if (pickList.length < per_page) quickPick.items = [...newList]
        } else return
      })

      // 生成rmlist
      quickPick.onDidAccept(() => {
        quickPick.dispose()
        const rmList = quickPick.selectedItems

        // 获取token
        const token: { default: string } | undefined = context.globalState.get('token')
        if (!token) throw new Error('Token not set yet')

        // 发送请求
        rmList.forEach(pick => {
          const { label, description, gist_id, raw_url } = pick as QuickPickItem
          if (gist_id) octokit(token.default).rest.gists.delete({ gist_id })
        })
        vscode.window.showInformationMessage('Done!')
      })

      // TODO: 备份gist（将删除的gist暂时保存在context.workspaceState中，防止后悔）
    } catch (error: any) {
      if (error.message === 'Token not set yet') setTokenTip(error)
      else vscode.window.showErrorMessage(error.message)
    }
  // 资源管理器中删除
  else
    try {
      const filename = file.fsPath.split(path.sep).pop()!

      const gist_id: string | undefined = context.workspaceState.get(filename)
      if (!gist_id) throw new Error(`Not found gist_id of ${filename} in local cache!`)

      // 获取token
      const token: { default: string } | undefined = context.globalState.get('token')
      if (!token) throw new Error('Token not set yet')
      // 发送请求
      octokit(token.default).rest.gists.delete({ gist_id })
      // 删除文件
      fs.rmSync(file.fsPath)

      vscode.window.showInformationMessage('Done!')
    } catch (error: any) {
      if (error.message === 'Token not set yet') setTokenTip(error)
      else vscode.window.showErrorMessage(error.message)
    }
}
