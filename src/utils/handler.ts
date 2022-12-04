import * as fs from 'fs'
import { env, ExtensionContext, Uri, window, workspace } from 'vscode'
import createPicklist from './createPicklist'
import { ButtonTip, GistQuickPickItem, ReqType } from './types'
import path = require('path')
import download = require('download')

export const showAuthGistsHandler = async (context: ExtensionContext) => {
  let page = 1
  // per_page default 30
  let PER_PAGE: number = workspace.getConfiguration('gist-vscode').get('per_page')!

  // 获取 picklist
  let picklist = await createPicklist(page, PER_PAGE, ReqType.SHOW_AUTH_GISTS)

  try {
    // 创建 picklist
    const quickpick = window.createQuickPick()
    quickpick.items = picklist

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

    // load list
    let curList: GistQuickPickItem[] = picklist
    quickpick.onDidChangeValue(async e => {
      quickpick.busy = true
      page++
      const newPicklist = await createPicklist(page, PER_PAGE, ReqType.SHOW_AUTH_GISTS)
      curList = [...newPicklist, ...curList]
      quickpick.items = curList
      quickpick.busy = false
    })

    // download
    quickpick.onDidChangeSelection(async e => {
      try {
        const { label, description, raw_url, owner, buttons } = e[0] as GistQuickPickItem

        // path
        const root = workspace.workspaceFolders![0]
        const rootPath = root.uri.fsPath

        // input
        const INPUT_DEFAULT_VALUE = 'Like src/test'
        const input = await window.showInputBox({
          title: 'Enter relative path.',
          value: INPUT_DEFAULT_VALUE,
        })

        let dst = ''
        if (!input || input === INPUT_DEFAULT_VALUE) {
          dst = path.resolve(rootPath)
        } else {
          dst = path.resolve(rootPath, input)
        }

        // download
        await download(raw_url, dst, { filename: label })

        // tip
        window.showInformationMessage(`Success. You can find ${label} in ${dst}`)
      } catch (err: any) {
        window.showErrorMessage(err.message)
      }
    })

    quickpick.onDidHide(() => quickpick.dispose())
    quickpick.show()
  } catch (err: any) {
    window.showErrorMessage(err.message)
  }
}
