import {
  commands,
  env,
  ProgressLocation,
  QuickPick,
  QuickPickItem,
  QuickPickItemButtonEvent,
  Uri,
  window,
} from 'vscode'
import { ajaxDeleteGist, ajaxForkGist, ajaxStarGist, ajaxUnstarGist } from './ajax'
import resStatusTip from './resStatusTip'
import { ButtonType, GistButton, GistQuickPickItem } from './types'

export const itemButtonTrigger = async (
  quickpick: QuickPick<QuickPickItem>,
  e: QuickPickItemButtonEvent<QuickPickItem>
) => {
  const { user, gist_id } = (e.item as GistQuickPickItem).owner

  switch ((e.button as GistButton).flag) {
    case ButtonType.REMOTE:
      await env.openExternal(Uri.parse(`https://gist.github.com/${user}/${gist_id}`))
      break
    case ButtonType.STAR:
      quickpick.busy = true
      const star_res = await ajaxStarGist(gist_id)
      quickpick.busy = false
      tip(star_res.status, 204)
      break
    case ButtonType.UNSTAR:
      const unstar_res = await ajaxUnstarGist(gist_id)
      tip(unstar_res.status, 204)
      commands.executeCommand('gist-vscode.showStarredGists')
      break
    case ButtonType.FORK:
      quickpick.busy = true
      const fork_res = await ajaxForkGist(gist_id)
      quickpick.busy = false
      tip(fork_res.status, 201)
      break
    case ButtonType.DELETE:
      const label = e.item.label
      const desc = e.item.description
      window
        .showInformationMessage(
          `Do you want to delete ${label}?`,
          { modal: true, detail: `Description: ${desc}` },
          'Delete'
        )
        .then(async value => {
          if (value === 'Delete') {
            window.withProgress(
              {
                location: ProgressLocation.Notification,
              },
              async progress => {
                progress.report({ message: 'Waiting ...' })
                const res = await ajaxDeleteGist(gist_id)
                if (res.status === 204) {
                  window.showInformationMessage('Deleted.')
                } else {
                  window.showErrorMessage(`Failed. ${res.status}`)
                }
              }
            )
          }
        })

    default:
      break
  }
}

const tip = (status: number, compare: number) => {
  if (status === compare) {
    window.showInformationMessage('Success.')
  } else {
    window.showWarningMessage(`Failed. ${status}`)
  }
}
