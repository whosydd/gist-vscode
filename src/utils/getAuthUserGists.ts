import * as download from 'download'
import * as fs from 'fs'
import * as vscode from 'vscode'
import updateAuthUserGists from '../api/updateAuthUserGists'
import { QuickPickItem } from '../config/types'
import path = require('path')

export default async (context: vscode.ExtensionContext) => {
  try {
    let page = 1
    // 获取per_page的配置项
    let per_page: number | undefined = vscode.workspace
      .getConfiguration('gist-for-vscode')
      .get('per_page')
    if (per_page === undefined) throw new Error('')

    const quickPick = vscode.window.createQuickPick()
    const pickList = await updateAuthUserGists(context, page, per_page)
    const more = { label: 'More...' }

    // 当数据条数小于默认值时，不显示more
    if (per_page && pickList.length < per_page) quickPick.items = [...pickList]
    else quickPick.items = [more, ...pickList]

    quickPick.show()

    quickPick.onDidChangeSelection(async item => {
      // TODO: 暂时还无法解决多个同名文件下载时的问题
      if (per_page === undefined) throw new Error('')
      if (item[0])
        if (item[0].label === 'More...') {
          quickPick.busy = true
          page++
          const tmp = [...quickPick.items]
          const pickList = await updateAuthUserGists(context, page, per_page)
          const newList = (pickList as vscode.QuickPickItem[]).concat(tmp.slice(1))
          quickPick.items = [more, ...newList]
          quickPick.busy = false

          if (pickList.length < per_page) quickPick.items = [...newList]
        } else {
          quickPick.dispose()
          // 获取文件名和下载链接
          const { label, description, gist_id, raw_url } = (item as QuickPickItem[])[0]

          if (gist_id === undefined || raw_url === undefined) throw new Error('')

          // 获取工作区目录
          let rootPath = ''
          const workspace = vscode.workspace.workspaceFolders
          if (workspace === undefined) throw new Error('Please open a workspace')
          // 如果工作区中存在的多个文件夹，显示选择框
          if (workspace.length > 1) {
            const pick = await vscode.window.showWorkspaceFolderPick()
            if (!pick) throw new Error('')
            rootPath = pick.uri.fsPath
          } else {
            const pick = workspace[0]
            rootPath = pick.uri.fsPath
          }

          // 保证文件夹存在
          const location = path.resolve(rootPath, '.gist')
          if (!fs.existsSync(location)) fs.mkdirSync(location)

          // 如果本地已存在同名文件，提示改名
          let newFilename: string
          const existFile = fs.existsSync(`${rootPath}/.gist/${label}`)
          if (existFile)
            vscode.window
              .showWarningMessage(`${label} already existed!`, 'Rename', 'Replace')
              .then(async value => {
                if (value === 'Rename') {
                  let newName = await vscode.window.showInputBox({
                    value: `${label}`,
                  })
                  const ext = label.split('.').pop()
                  if (ext === undefined || newName === undefined) return
                  if (!newName.includes(ext)) newFilename = newName + '.' + ext
                  else newFilename = newName
                } else if (value === `Replace`) newFilename = label
                else return
                fs.writeFileSync(`${location}/${newFilename}`, await download(raw_url))

                context.workspaceState.update(newFilename, gist_id)

                vscode.window.showInformationMessage('Done!')
              })
          else {
            fs.writeFileSync(`${location}/${label}`, await download(raw_url))

            context.workspaceState.update(label, gist_id)

            vscode.window.showInformationMessage('Done!')
          }
        }
      else return
    })
  } catch (error: any) {
    if (error.message === '') return
    vscode.window.showErrorMessage(error.message)
  }
}
