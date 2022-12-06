import { QuickInputButton, window, workspace } from 'vscode'
import { itemButtonTrigger } from '../utils/buttonTrigger'
import downloader from '../utils/downloader'
import { AjaxType, ButtonType, GistButton, GistQuickPickItem, MORE } from '../utils/types'
import updatePicklist from '../utils/updatePicklist'

export default async (type: AjaxType) => {
  let page = 1
  // per_page default 30
  let PER_PAGE: number = workspace.getConfiguration('gist-vscode').get('per_page')!

  const quickpick = window.createQuickPick()
  quickpick.show()

  quickpick.keepScrollPosition = true
  quickpick.busy = true
  let picklist = await updatePicklist(page, PER_PAGE, type)
  picklist.length < PER_PAGE ? (quickpick.buttons = []) : (quickpick.buttons = [MORE])
  quickpick.items = picklist
  quickpick.busy = false

  quickpick.onDidTriggerButton(async (e: QuickInputButton) => {
    switch ((e as GistButton).flag) {
      case ButtonType.MORE:
        quickpick.busy = true
        const curList = [...quickpick.items]
        const newPicklist = await updatePicklist(++page, PER_PAGE, type)
        quickpick.items = [...curList, ...newPicklist]
        quickpick.busy = false

        if (newPicklist.length < PER_PAGE) {
          quickpick.buttons = []
        }
        break

      default:
        break
    }
  })

  quickpick.onDidTriggerItemButton(e => {
    itemButtonTrigger(quickpick, e)
  })

  quickpick.onDidChangeSelection(async e => {
    try {
      await downloader(e as GistQuickPickItem[])
    } catch (err: any) {
      window.showErrorMessage(`Download Failed. ${err.message}`)
    }
  })
}
