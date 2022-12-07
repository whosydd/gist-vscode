import { QuickInputButton, window, workspace } from 'vscode'
import { itemButtonTrigger } from '../utils/buttonTrigger'
import { AjaxType, BACK, ButtonType, GistButton, MORE } from '../utils/types'
import updatePicklist from '../utils/updatePicklist'

export default () => {
  let page = 1
  // per_page default 30
  let per_page: number = workspace.getConfiguration('gist-vscode').get('per_page')!

  // create input
  const input = window.createInputBox()
  input.title = 'List Gists For User'
  input.placeholder = 'username'
  input.step = 1
  input.totalSteps = 2

  // create picklist
  const quickpick = window.createQuickPick()
  quickpick.keepScrollPosition = true
  quickpick.matchOnDescription = true
  quickpick.title = 'List Gists For User'
  quickpick.step = 2
  quickpick.totalSteps = 2
  quickpick.buttons = [BACK]

  let username = ''
  input.onDidAccept(async () => {
    username = input.value

    if (!username) {
      input.placeholder = 'Please enter username'
    } else {
      quickpick.show()
      quickpick.busy = true
      let picklist = await updatePicklist(1, per_page, AjaxType.SHOW_USER_GISTS, username)
      if (picklist.length === 0) {
        quickpick.items = [{ label: 'Back' }]
      } else {
        quickpick.items = picklist
        if (picklist.length === per_page) {
          quickpick.buttons = [BACK, MORE]
        }
      }
      quickpick.busy = false
    }
  })
  input.show()

  quickpick.onDidChangeActive(async e => {
    const label = e[0].label

    if (e.length === 1 && label === 'Back') {
      quickpick.placeholder = 'Not Found'
    }
  })

  quickpick.onDidChangeSelection(e => {
    const label = e[0].label

    if (e.length === 1 && label === 'Back') {
      input.show()
      quickpick.placeholder = ''
    }
  })

  quickpick.onDidTriggerButton(async (e: QuickInputButton) => {
    switch ((e as GistButton).flag) {
      case ButtonType.BACK:
        input.show()
        quickpick.placeholder = ''
        break
      case ButtonType.MORE:
        quickpick.busy = true
        const curList = [...quickpick.items]

        const newPicklist = await updatePicklist(
          ++page,
          per_page,
          AjaxType.SHOW_USER_GISTS,
          username
        )

        quickpick.items = [...curList, ...newPicklist]
        quickpick.busy = false

        if (newPicklist.length < per_page) {
          quickpick.buttons = [BACK]
        }
        break
    }
  })

  quickpick.onDidTriggerItemButton(e => {
    itemButtonTrigger(quickpick, e)
  })
}
