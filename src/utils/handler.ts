import { env, QuickPickItem, QuickPickItemKind, ThemeIcon, Uri, window, workspace } from 'vscode'
import createPicklist from './createPicklist'
import { ButtonTip, GistQuickPickItem, ReqType } from './types'

export const showAuthGistsHandler = async () => {
  let page = 1
  // per_page default 30
  let PER_PAGE: number = workspace.getConfiguration('gist-vscode').get('per_page')!

  // 获取 picklist
  let picklist = await createPicklist(page, PER_PAGE, ReqType.SHOW_AUTH_GISTS)

  try {
    // 创建 picklist
    const quickpick = window.createQuickPick()
    quickpick.items = picklist
    // const MORE_LABEL = `$(refresh) More ...`
    // const more: QuickPickItem[] = [
    //   { label: MORE_LABEL, alwaysShow: true },
    //   { label: '', kind: QuickPickItemKind.Separator },
    // ]

    // 当数据条数小于默认值时，不显示more
    // if (picklist.length < PER_PAGE) {
    //   quickpick.items = [...picklist]
    // } else {
    //   quickpick.items = [...more, ...picklist]
    // }

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

    // quickpick.onDidAccept(async () => {
    // const items = quickpick.activeItems
    // console.log('items:', items)

    // if (items[0].label === MORE_LABEL) {
    //   let curList = [...quickpick.items]
    //   curList.splice(0, 2)
    //   quickpick.busy = true
    //   page += 1
    //   picklist = await createPicklist(page, PER_PAGE, ReqType.SHOW_AUTH_GISTS)
    //   if (picklist.length < PER_PAGE) {
    //     quickpick.items = picklist.concat(curList as GistQuickPickItem[])
    //   } else {
    //     quickpick.items = [...more, ...picklist, ...curList]
    //   }
    //   quickpick.busy = false
    // } else {
    //   // quickpick.dispose()
    // }
    // })

    let curList: GistQuickPickItem[] = picklist
    quickpick.onDidChangeValue(async e => {
      quickpick.busy = true
      page++
      const newPicklist = await createPicklist(page, PER_PAGE, ReqType.SHOW_AUTH_GISTS)
      curList = [...newPicklist, ...curList]
      quickpick.items = curList
      quickpick.busy = false
    })

    quickpick.onDidHide(() => quickpick.dispose())
    quickpick.show()
  } catch (err: any) {
    window.showErrorMessage(err.message)
  }
}

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))
