import { env, QuickPickItemKind, Uri, window, workspace } from 'vscode'
import createPicklist from './createPicklist'
import { ButtonTip, GistQuickPickItem, ReqType } from './types'

export const showAuthGistsHandler = async () => {
  let page = 1
  // per_page default 30
  let per_page: number = workspace.getConfiguration('gist-vscode').get('per_page')!

  // 获取 picklist
  let picklist = await createPicklist(page, per_page, ReqType.SHOW_AUTH_GISTS)

  try {
    // 创建 picklist
    const quickpick = window.createQuickPick()
    const MORE_LABEL = `$(refresh) More ...`
    const more = [{ label: MORE_LABEL }, { label: '', kind: QuickPickItemKind.Separator }]

    // 当数据条数小于默认值时，不显示more
    if (picklist.length < per_page) {
      quickpick.items = [...picklist]
    } else {
      quickpick.items = [...more, ...picklist]
    }

    quickpick.show()

    // click button
    quickpick.onDidTriggerItemButton(async (e: any) => {
      const { user, gist_id } = e.item.owner

      switch (e.button.flag) {
        case ButtonTip.REMOTE:
          await env.openExternal(Uri.parse(`https://gist.github.com/${user}/${gist_id}`))
          break

        default:
          break
      }
    })

    // quickpick.onDidAccept(() => {
    //   console.log('quickpick.activeItems:', quickpick.activeItems)
    //   const item = quickpick.activeItems

    // })

    // quickpick.onDidChangeSelection(async item => {
    quickpick.onDidAccept(async () => {
      const items = quickpick.activeItems

      if (items[0].label === MORE_LABEL) {
        quickpick.busy = true
        page++
        const tmp = [...quickpick.items]
        const picklist = await createPicklist(page, per_page, ReqType.SHOW_AUTH_GISTS)
        console.log('picklist.length:', picklist.length)
        tmp.splice(0, 2)

        const newList = picklist.concat(tmp as GistQuickPickItem[])
        quickpick.items = [...more, ...newList]
        quickpick.busy = false

        if (picklist.length < per_page) {
          quickpick.items = [...newList]
        }

        console.log('picklist:', picklist)
      } else {
        // quickpick.dispose()
        // 获取文件名和下载链接
        // const { label, description, raw_url } = (items as MyQuickPickItem[])[0]
        // console.log('label:', label)
        // console.log('description:', description)
        // console.log('raw_url:', raw_url)
        //     // 获取工作区目录
        //     // let rootPath = ''
        //     // const workspace = workspace.workspaceFolders
        //     // if (!workspace) {
        //     //   throw new Error('Please open a workspace')
        //     // }
        //     // 如果工作区中存在的多个文件夹，显示选择框
        //     // if (workspace.length > 1) {
        //     //   const pick = await window.showWorkspaceFolderPick()
        //     //   if (!pick) {
        //     //     return
        //     //   }
        //     //   rootPath = pick.uri.fsPath
        //     // } else {
        //     //   const pick = workspace[0]
        //     //   rootPath = pick.uri.fsPath
        //     // }
        //     // 保证文件夹存在
        //     // const location = path.resolve(rootPath, '.gist')
        //     // if (!fs.existsSync(location)) {
        //     //   fs.mkdirSync(location)
        //     // }
        //     // 如果本地已存在同名文件，提示改名
        //     // let newFilename: string
        //     // const existFile = fs.existsSync(`${rootPath}/.gist/${label}`)
        //     // if (existFile) {
        //     //   vscode.window
        //     //     .showWarningMessage(`${label} already existed!`, 'Rename', 'Replace')
        //     //     .then(async value => {
        //     //       if (value === 'Rename') {
        //     //         let newName = await vscode.window.showInputBox({
        //     //           value: `${label}`,
        //     //         })
        //     //         const ext = label.split('.').pop()
        //     //         if (!ext || !newName) {
        //     //           return
        //     //         }
        //     //         if (!newName.includes(ext)) {
        //     //           newFilename = newName + '.' + ext
        //     //         } else {
        //     //           newFilename = newName
        //     //         }
        //     //       } else if (value === `Replace`) {
        //     //         newFilename = label
        //     //       } else {
        //     //         return
        //     //       }
        //     //       fs.writeFileSync(`${location}/${newFilename}`, await download(raw_url))
        //     //       context.workspaceState.update(newFilename, gist_id)
        //     //       vscode.window.showInformationMessage('Done!')
        //     //     })
        //     // } else {
        //     //   fs.writeFileSync(`${location}/${label}`, await download(raw_url))
        //     //   context.workspaceState.update(label, gist_id)
        //     //   vscode.window.showInformationMessage('Done!')
        //     // }
      }
    })
  } catch (err: any) {
    window.showErrorMessage(err.message)
  }
}
