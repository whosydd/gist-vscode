import { ExtensionContext, QuickInputButton, Uri, window, workspace } from 'vscode'
import { itemButtonTrigger } from '../utils/buttonTrigger'
import downloader from '../utils/downloader'
import { AjaxType, ButtonType, GistButton, GistQuickPickItem, MORE } from '../utils/types'
import updatePicklist from '../utils/updatePicklist'

export default async (uri: Uri, type: AjaxType) => {
  let page = 1
  // per_page default 30
  let per_page: number = workspace.getConfiguration('gist-vscode').get('per_page')!

  const quickpick = window.createQuickPick()
  quickpick.show()

  quickpick.keepScrollPosition = true
  quickpick.matchOnDescription = true

  const tip = (list: GistQuickPickItem[]) => {
    if (list.length < per_page) {
      quickpick.title = undefined
      quickpick.buttons = []
    } else {
      quickpick.title = `Loading More -->`
      quickpick.buttons = [MORE]
    }
  }

  quickpick.busy = true
  let picklist = await updatePicklist(page, per_page, type)

  if (!picklist) {
    return
  }

  tip(picklist)
  quickpick.items = picklist
  quickpick.busy = false

  quickpick.onDidTriggerButton(async (e: QuickInputButton) => {
    switch ((e as GistButton).flag) {
      case ButtonType.MORE:
        quickpick.busy = true
        const curList = [...quickpick.items]
        const newPicklist = await updatePicklist(++page, per_page, type)
        if (!newPicklist) {
          return
        }
        quickpick.items = [...curList, ...newPicklist]
        quickpick.busy = false
        tip(newPicklist)
        break
    }
  })

  quickpick.onDidTriggerItemButton(e => {
    itemButtonTrigger(quickpick, e)
  })

  quickpick.onDidChangeSelection(async e => {
    try {
      await downloader(uri, e as GistQuickPickItem[])
      quickpick.dispose()
    } catch (err: any) {
      window.showErrorMessage(`Download Failed. ${err.message}`)
    }
  })
}
