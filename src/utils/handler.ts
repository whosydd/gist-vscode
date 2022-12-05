import { env, ExtensionContext, Uri, window, workspace } from 'vscode'
import { ajaxForkGist, ajaxStarGist, ajaxUnstarGist } from './ajax'
import createPicklist from './createPicklist'
import { ButtonTip, GistQuickPickItem, ReqType } from './types'
import path = require('path')
import download = require('download')

export const showGistsHandler = async (context: ExtensionContext, type: ReqType) => {
  let page = 1
  // per_page default 30
  let PER_PAGE: number = workspace.getConfiguration('gist-vscode').get('per_page')!

  // 获取 picklist
  let picklist
  let username: string | undefined
  if (type === ReqType.SHOW_OTHER_USER_GISTS) {
    username = await window.showInputBox({ value: 'username' })
    if (!username) {
      return
    }
    picklist = await createPicklist(page, PER_PAGE, type, username)
  } else {
    picklist = await createPicklist(page, PER_PAGE, type)
  }

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
        case ButtonTip.STAR:
          quickpick.busy = true
          const star_res = await ajaxStarGist(gist_id)
          quickpick.busy = false
          if (star_res.status === 204) {
            window.showInformationMessage('Success.')
          } else {
            window.showWarningMessage('Failed.' + star_res.status)
          }
          break
        case ButtonTip.UNSTAR:
          quickpick.busy = true
          const unstar_res = await ajaxUnstarGist(gist_id)
          quickpick.busy = false
          if (unstar_res.status === 204) {
            window.showInformationMessage('Success.')
          } else {
            window.showWarningMessage('Failed.' + unstar_res.status)
          }
          break
        case ButtonTip.FORK:
          quickpick.busy = true
          const fork_res = await ajaxForkGist(gist_id)
          quickpick.busy = false
          if (fork_res.status === 201) {
            window.showInformationMessage('Success.')
          } else {
            window.showWarningMessage('Failed.' + fork_res.status)
          }
          break
        default:
          break
      }
    })

    // load list
    let curList: GistQuickPickItem[] = picklist
    quickpick.onDidChangeValue(async e => {
      page++
      quickpick.busy = true
      let newPicklist
      if (type === ReqType.SHOW_OTHER_USER_GISTS) {
        if (!username) {
          return
        }
        newPicklist = await createPicklist(page, PER_PAGE, type, username)
      } else {
        newPicklist = await createPicklist(page, PER_PAGE, type)
      }
      curList = [...curList, ...newPicklist]

      if (curList.length === quickpick.items.length) {
        quickpick.busy = false
        return
      }

      setTimeout(() => {
        quickpick.items = curList
        quickpick.busy = false
      }, 200)
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
        let input = await window.showInputBox({
          value: INPUT_DEFAULT_VALUE,
          prompt: 'Please use relative path.',
        })

        if (input === undefined) {
          return
        }

        if (input.match(/\B\/.*/)) {
          input = input.slice(1)
        }

        let dst = ''
        if (input === INPUT_DEFAULT_VALUE || input === '') {
          dst = path.resolve(rootPath)
        } else {
          dst = path.resolve(rootPath, input)
        }

        // download
        await download(raw_url, dst, { filename: label })

        // tip
        window.showInformationMessage(
          `Success. You can find ${label} in ${
            input === INPUT_DEFAULT_VALUE || input === '' ? 'workspace root path' : input
          }.`
        )
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
