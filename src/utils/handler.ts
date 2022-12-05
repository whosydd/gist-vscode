import {
  env,
  ExtensionContext,
  InputBox,
  ProgressLocation,
  QuickPickItem,
  Range,
  Uri,
  window,
  workspace,
} from 'vscode'
import { ajaxCreateGist, ajaxDeleteGist, ajaxForkGist, ajaxStarGist, ajaxUnstarGist } from './ajax'
import createPicklist from './createPicklist'
import { back_button_template, clear_button_template, more_button_template } from './template'
import {
  AjaxType,
  ButtonType,
  CreateGistParams,
  CreateGistType,
  GistQuickPickItem,
  QuickPickType,
} from './types'
import path = require('path')
import download = require('download')

export const showGistsHandler = async (type: AjaxType) => {
  let page = 1
  // per_page default 30
  let PER_PAGE: number = workspace.getConfiguration('gist-vscode').get('per_page')!

  // create input
  const input = createInputBox(QuickPickType.INPUT, 'List Gists For User')!

  // create picklist
  let quickpick = createQuickPick(QuickPickType.QUICKPICK, 'List Gists For User')!

  // get picklist
  let picklist: GistQuickPickItem[]
  let username: string | undefined
  if (type === AjaxType.SHOW_OTHER_USER_GISTS) {
    input.onDidAccept(async () => {
      username = input.value

      if (!username) {
        input.placeholder = 'Please enter username'
      } else {
        quickpick.show()
        quickpick.busy = true
        picklist = await createPicklist(page, PER_PAGE, type, username)
        quickpick.busy = false
        if (picklist.length === 0) {
          quickpick.items = [{ label: 'Back' }]
        } else {
          quickpick.busy = true
          quickpick.items = picklist
          quickpick.busy = false
        }

        quickpick.onDidChangeActive(e => {
          const label = e[0].label
          if (e.length === 1 && label === 'Back') {
            quickpick.placeholder = 'Not Found'
          }
        })

        quickpick.onDidTriggerButton(e => {
          input.show()
          quickpick.placeholder = ''
        })

        quickpick.onDidChangeSelection(e => {
          if (e[0].label === 'Back') {
            input.show()
            quickpick.placeholder = ''
          }
        })
      }
    })
    input.show()
  } else {
    quickpick = window.createQuickPick()
    quickpick.show()
    quickpick.placeholder = 'Search'
    quickpick.busy = true
    picklist = await createPicklist(page, PER_PAGE, type)
    quickpick.items = picklist
    quickpick.busy = false
  }

  quickpick.items = picklist!

  // click button
  quickpick.onDidTriggerItemButton(async (e: any) => {
    const { user, gist_id } = e.item.owner

    switch (e.button.flag) {
      case ButtonType.REMOTE:
        await env.openExternal(Uri.parse(`https://gist.github.com/${user}/${gist_id}`))
        break
      case ButtonType.STAR:
        quickpick.busy = true
        const star_res = await ajaxStarGist(gist_id)
        quickpick.busy = false
        resStatusTip(star_res.status, 204)
        break
      case ButtonType.UNSTAR:
        quickpick.busy = true
        const unstar_res = await ajaxUnstarGist(gist_id)
        quickpick.busy = false
        resStatusTip(unstar_res.status, 204)
        break
      case ButtonType.FORK:
        quickpick.busy = true
        const fork_res = await ajaxForkGist(gist_id)
        quickpick.busy = false
        resStatusTip(fork_res.status, 201)
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
              ajaxWithProgress(AjaxType.DELETE_GIST, 'Waiting ...', gist_id)
            }
          })

      default:
        break
    }
  })

  // load list
  let curList: GistQuickPickItem[] = picklist!
  quickpick.onDidChangeValue(async e => {
    page++
    quickpick.busy = true
    let newPicklist
    if (type === AjaxType.SHOW_OTHER_USER_GISTS) {
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
      let input = await window.showInputBox({
        placeHolder: 'Like src/test',
        prompt: 'Please use relative path.',
      })

      if (input && input.match(/\B\/.*/)) {
        input = input.slice(1)
      }

      let dst = ''
      if (!input) {
        dst = path.resolve(rootPath)
      } else {
        dst = path.resolve(rootPath, input)
      }

      // download
      ajaxWithProgress(AjaxType.GET_GIST, 'Downloading ...', { raw_url, dst, label })
    } catch (err: any) {
      window.showErrorMessage('Download Failed. ', err.message)
    }
  })
  quickpick.show()
  quickpick.onDidHide(() => quickpick.dispose())
}

export const createGistHandler = async (type: CreateGistType) => {
  try {
    let filename = ''
    let description = ''
    let content = ''

    if (type === CreateGistType.SELECTED) {
      // 获取选中代码块
      const editor = window.activeTextEditor
      if (!editor) {
        throw new Error('Got a bug!')
      }
      const {
        document: { lineAt, getText },
        selection: { start, end, active },
      } = editor
      content = (
        start.isEqual(end) ? lineAt(active.line).text : getText(new Range(start, end))
      ).trim()

      // 判断选中区域中有没有代码
      if (!content.match(/\w+/)) {
        throw new Error(`Selected code is empty.`)
      }
    }

    if (type === CreateGistType.FILE) {
      const editor = window.activeTextEditor

      filename = editor?.document.fileName.split(path.sep).pop()!

      content = editor?.document.getText()!
    }

    // title
    const title = 'Create Gist'

    // filename
    let filename_input: InputBox
    if (filename) {
      filename_input = createInputBox(QuickPickType.FILENAME, title, filename)!
    } else {
      filename_input = createInputBox(QuickPickType.FILENAME, title)!
    }

    // desc
    const desc_input = createInputBox(QuickPickType.DESCRIPTION, title)

    // pick
    const pick = createQuickPick(QuickPickType.PUBLIC, title)

    if (!filename_input || !desc_input || !pick) {
      throw new Error('Sorry, please try again.')
    }

    filename_input.show()

    filename_input.onDidAccept(() => {
      filename = filename_input.value
      if (!filename) {
        filename_input.placeholder = 'Please enter a filename'
      } else {
        desc_input.show()
      }
    })

    desc_input.onDidAccept(() => {
      description = desc_input.value
      pick.items = [
        {
          label: 'Public',
        },
        {
          label: 'Private',
        },
      ]
      pick.show()
    })
    desc_input.onDidTriggerButton(e => {
      filename_input.show()
    })

    pick.onDidChangeSelection(async e => {
      // files
      const files: CreateGistParams = {
        description,
        public: e[0].label === 'Public' ? true : false,
        files: {
          [filename]: {
            content,
          },
        },
      }

      // ajax
      ajaxWithProgress(AjaxType.CREATE_GIST, 'Waiting ...', files)
      pick.hide()
    })

    pick.onDidTriggerButton(e => {
      desc_input.show()
    })
  } catch (err: any) {
    window.showErrorMessage(err.message)
  }
}

export const deleteGistsHandler = async () => {
  let page = 1
  // per_page default 30
  let PER_PAGE: number = workspace.getConfiguration('gist-vscode').get('per_page')!
  const picks = window.createQuickPick()
  picks.show()
  picks.canSelectMany = true
  picks.busy = true
  const picklist = await createPicklist(page, PER_PAGE, AjaxType.SHOW_AUTH_GISTS)
  picks.items = picklist
  picks.buttons = [clear_button_template, more_button_template]
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

const createInputBox = (type: QuickPickType, title: string, value?: string) => {
  switch (type) {
    case QuickPickType.INPUT:
      const input = window.createInputBox()
      input.title = title
      input.placeholder = 'username'
      input.step = 1
      input.totalSteps = 2
      return input
    case QuickPickType.FILENAME:
      const filename = window.createInputBox()
      filename.title = title
      filename.placeholder = 'filename'
      value ? (filename.value = value) : ''
      filename.step = 1
      filename.totalSteps = 3
      return filename
    case QuickPickType.DESCRIPTION:
      const desc = window.createInputBox()
      desc.title = title
      desc.placeholder = 'description'
      desc.step = 2
      desc.totalSteps = 3
      desc.buttons = [back_button_template]
      return desc
  }
}

const createQuickPick = (type: QuickPickType, title: string) => {
  switch (type) {
    case QuickPickType.QUICKPICK:
      const quickpick = window.createQuickPick()
      quickpick.title = title
      quickpick.step = 2
      quickpick.totalSteps = 2
      quickpick.buttons = [back_button_template]
      return quickpick
    case QuickPickType.PUBLIC:
      const pick = window.createQuickPick()
      pick.title = title
      pick.step = 3
      pick.totalSteps = 3
      pick.buttons = [back_button_template]
      return pick
  }
}

// tip
const resStatusTip = (status: number, compare: number) => {
  if (status === compare) {
    window.showInformationMessage('Success.')
  } else {
    window.showWarningMessage('Failed.' + status)
  }
}

const ajaxWithProgress = (type: AjaxType, message: string, params?: any) => {
  window.withProgress(
    {
      location: ProgressLocation.Notification,
    },
    async progress => {
      progress.report({
        message,
      })

      let res
      switch (type) {
        case AjaxType.CREATE_GIST:
          res = await ajaxCreateGist(params)
          if (res.status === 201) {
            window.showInformationMessage('Success.')
          } else {
            window.showErrorMessage('Failed. ' + res.status)
          }
          break
        case AjaxType.GET_GIST:
          try {
            const { raw_url, dst, label } = params
            await download(raw_url, dst, { filename: label })
            window.showInformationMessage('Success.')
          } catch (err: any) {
            window.showErrorMessage('Failed. ', err.message)
          }
        case AjaxType.DELETE_GIST:
          res = await ajaxDeleteGist(params)
          if (res.status === 204) {
            window.showInformationMessage('Deleted.')
          } else {
            window.showErrorMessage('Failed. ' + res.status)
          }
          break
      }
    }
  )
}
