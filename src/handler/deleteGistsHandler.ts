import { ProgressLocation, window, workspace } from 'vscode'
import { ajaxDeleteGist } from '../utils/ajax'
import { itemButtonTrigger } from '../utils/buttonTrigger'
import { AjaxType, ButtonType, CLEAR, GistButton, GistQuickPickItem, MORE } from '../utils/types'
import updatePicklist from '../utils/updatePicklist'

export default async () => {
  let page = 1
  // per_page default 30
  let per_page: number = workspace.getConfiguration('gist-vscode').get('per_page')!
  const quickpick = window.createQuickPick()
  quickpick.show()
  quickpick.canSelectMany = true
  quickpick.busy = true
  const picklist = await updatePicklist(page, per_page, AjaxType.SHOW_AUTH_GISTS)

  if (!picklist) {
    return
  }

  quickpick.items = picklist
  quickpick.buttons = [CLEAR, MORE]
  quickpick.busy = false

  quickpick.onDidAccept(() => {
    const delList = quickpick.selectedItems

    if (delList.length === 0) {
      return
    }

    window.withProgress({ location: ProgressLocation.Notification }, async progress => {
      progress.report({ message: 'Deleting ...' })
      delList.forEach(async e => {
        const gist_id = (e as GistQuickPickItem).owner.gist_id
        const res = await ajaxDeleteGist(gist_id)
        if (res.status !== 204) {
          window.showWarningMessage(`${e.label} delete failed!`)
        }
      })
      quickpick.dispose()
    })
  })

  quickpick.onDidTriggerButton(async e => {
    switch ((e as GistButton).flag) {
      case ButtonType.MORE:
        const oldlist = [...quickpick.items]
        page++
        quickpick.busy = true
        const newlist = await updatePicklist(page, per_page, AjaxType.SHOW_AUTH_GISTS)

        if (!newlist) {
          return
        }

        quickpick.items = [...oldlist, ...newlist]
        quickpick.busy = false
        break
      case ButtonType.CLEAR:
        quickpick.selectedItems = []
        break
    }
  })

  quickpick.onDidTriggerItemButton(e => {
    itemButtonTrigger(quickpick, e)
  })
}
