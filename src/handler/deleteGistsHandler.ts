import { window, workspace } from 'vscode'
import { AjaxType, ButtonType, CLEAR, MORE } from '../utils/types'
import createPicklist from '../utils/updatePicklist'

export default async () => {
  let page = 1
  // per_page default 30
  let PER_PAGE: number = workspace.getConfiguration('gist-vscode').get('per_page')!
  const picks = window.createQuickPick()
  picks.show()
  picks.canSelectMany = true
  picks.busy = true
  const picklist = await createPicklist(page, PER_PAGE, AjaxType.SHOW_AUTH_GISTS)
  picks.items = picklist
  picks.buttons = [CLEAR, MORE]
  picks.busy = false

  picks.onDidAccept(() => {
    console.log('picks.value:', picks.value)
  })

  picks.onDidTriggerButton(async (e: any) => {
    console.log('e:', e)

    switch (e.flag) {
      case ButtonType.MORE:
        const oldlist = [...picks.items]
        page++
        picks.busy = true
        const newlist = await createPicklist(page, PER_PAGE, AjaxType.SHOW_AUTH_GISTS)
        picks.items = [...oldlist, ...newlist]
        picks.busy = false
        break
      case ButtonType.CLEAR:
        picks.selectedItems = []
        break

      default:
        break
    }
  })
}
