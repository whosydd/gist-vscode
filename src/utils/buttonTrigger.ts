import {
  commands,
  env,
  ProgressLocation,
  QuickPick,
  QuickPickItem,
  QuickPickItemButtonEvent,
  Uri,
  window,
  workspace,
} from 'vscode'
import { ajaxDeleteGist, ajaxForkGist, ajaxStarGist, ajaxUnstarGist } from './ajax'
import { ButtonType, GenerateItem, GistButton, GistQuickPickItem } from './types'

export const itemButtonTrigger = async (
  quickpick: QuickPick<QuickPickItem>,
  e: QuickPickItemButtonEvent<QuickPickItem>
) => {
  let {
    label,
    description,
    owner: { user, gist_id },
  } = e.item as GistQuickPickItem

  if (description === undefined) {
    description = ''
  }

  switch ((e.button as GistButton).flag) {
    case ButtonType.REMOTE:
      await env.openExternal(Uri.parse(`https://gist.github.com/${user}/${gist_id}`))
      break
    case ButtonType.STAR:
      quickpick.busy = true
      const star_res = await ajaxStarGist(gist_id)
      tip(star_res.status, 204)
      quickpick.busy = false
      break
    case ButtonType.UNSTAR:
      quickpick.busy = true
      const unstar_res = await ajaxUnstarGist(gist_id)
      tip(unstar_res.status, 204)
      commands.executeCommand('gist-vscode.showStarredGists')
      quickpick.busy = false
      break
    case ButtonType.FORK:
      quickpick.busy = true
      const fork_res = await ajaxForkGist(gist_id)
      tip(fork_res.status, 201)
      quickpick.busy = false
      break
    case ButtonType.DELETE:
      window
        .showInformationMessage(
          `Do you want to delete ${label}?`,
          { modal: true, detail: `Description: ${description}` },
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
                  window.showErrorMessage(`Request failed. ${res.status}`)
                }
              }
            )
          }
        })
      break
    case ButtonType.GENERATE:
      let generate: GenerateItem[] = await workspace
        .getConfiguration('gist-vscode')
        .get('generate')!

      const item = { label, url: `https://gist.github.com/${user}/${gist_id}` }

      let flag = false
      generate.forEach(item => {
        if (item.url.split('/').pop() === gist_id) {
          flag = true
          return
        }
      })
      if (!flag) {
        generate.push(item)
        workspace.getConfiguration('gist-vscode').update('generate', generate)
        window.showInformationMessage('Success.')
      } else {
        window.showWarningMessage('Added.')
      }
      break
  }
}

const tip = (status: number, compare: number) => {
  if (status === compare) {
    window.showInformationMessage('Success.')
  } else {
    window.showWarningMessage(`Request failed. ${status}`)
  }
}
