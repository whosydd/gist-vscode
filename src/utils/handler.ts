import {
  env,
  ExtensionContext,
  InputBox,
  ProgressLocation,
  Range,
  Uri,
  window,
  workspace,
} from 'vscode'
import { ajaxCreateGist, ajaxForkGist, ajaxStarGist, ajaxUnstarGist } from './ajax'
import createPicklist from './createPicklist'
import { back_button_template } from './template'
import {
  AjaxType,
  ButtonType,
  CreateGistParams,
  CreateGistType,
  CreateQuickPickType,
  GistQuickPickItem,
} from './types'
import path = require('path')
import download = require('download')

export const showGistsHandler = async (context: ExtensionContext, type: AjaxType) => {
  try {
    let page = 1
    // per_page default 30
    let PER_PAGE: number = workspace.getConfiguration('gist-vscode').get('per_page')!

    // 创建 picklist
    const quickpick = window.createQuickPick()

    // 获取 picklist
    let picklist
    let username: string | undefined
    if (type === AjaxType.SHOW_OTHER_USER_GISTS) {
      username = await window.showInputBox({ placeHolder: 'username' })
      if (!username) {
        return
      }
      quickpick.show()

      picklist = await createPicklist(page, PER_PAGE, type, username)
    } else {
      picklist = await createPicklist(page, PER_PAGE, type)
    }

    quickpick.items = picklist

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
        window.showErrorMessage(err.message)
      }
    })

    quickpick.onDidHide(() => quickpick.dispose())
  } catch (err: any) {
    window.showErrorMessage(err.message)
  }
}

export const createGistHandler = async (context: ExtensionContext, type: CreateGistType) => {
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
      filename_input = createInputBox(CreateQuickPickType.FILENAME, title, filename)!
    } else {
      filename_input = createInputBox(CreateQuickPickType.FILENAME, title)!
    }

    // desc
    const desc_input = createInputBox(CreateQuickPickType.DESCRIPTION, title)

    // pick
    const pick = createQuickPick(CreateQuickPickType.PUBLIC, title)

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
      ajaxWithProgress(AjaxType.CREATE_GIST, 'Creating a gist ...', files)
      pick.hide()
    })

    pick.onDidTriggerButton(e => {
      desc_input.show()
    })
  } catch (err: any) {
    window.showErrorMessage(err.message)
  }
}

const createInputBox = (type: CreateQuickPickType, title: string, value?: string) => {
  switch (type) {
    case CreateQuickPickType.FILENAME:
      const filename = window.createInputBox()
      filename.title = title
      filename.placeholder = 'filename'
      value ? (filename.value = value) : ''
      filename.step = 1
      filename.totalSteps = 3
      return filename
    case CreateQuickPickType.DESCRIPTION:
      const desc = window.createInputBox()
      desc.title = title
      desc.placeholder = 'description'
      desc.step = 2
      desc.totalSteps = 3
      desc.buttons = [back_button_template]
      return desc
  }
}

const createQuickPick = (type: CreateQuickPickType, title: string) => {
  switch (type) {
    case CreateQuickPickType.PUBLIC:
      const quickpick = window.createQuickPick()
      quickpick.title = title
      quickpick.step = 3
      quickpick.totalSteps = 3
      quickpick.buttons = [back_button_template]
      return quickpick
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
            window.showErrorMessage(err.message)
          }
      }
    }
  )
}
