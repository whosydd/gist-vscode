import { readFileSync } from 'fs'
import { ProgressLocation, QuickPickItem, Range, Uri, window } from 'vscode'
import { ajaxCreateGist } from '../utils/ajax'
import { BACK, CreateGistParams, CreateGistType } from '../utils/types'
import path = require('path')

export default async (type: CreateGistType, file?: Uri) => {
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
      if (!file) {
        return
      }
      filename = file.fsPath.split(path.sep).pop()!
      content = readFileSync(file.fsPath, 'utf-8')
    }

    // title
    const title = 'Create Gist'

    // filename
    const input = window.createInputBox()
    input.title = title
    input.placeholder = 'filename'
    filename ? (input.value = filename) : ''
    input.step = 1
    input.totalSteps = 3

    // desc
    const desc = window.createInputBox()
    desc.title = title
    desc.placeholder = 'description'
    desc.step = 2
    desc.totalSteps = 3
    desc.buttons = [BACK]

    // pick
    const pick = window.createQuickPick()
    pick.title = title
    pick.step = 3
    pick.totalSteps = 3
    pick.buttons = [BACK]

    input.show()

    input.onDidAccept(() => {
      filename = input.value
      if (!filename) {
        input.placeholder = 'Please enter a filename'
      } else {
        desc.show()
      }
    })

    desc.onDidAccept(() => {
      description = desc.value
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
    desc.onDidTriggerButton(e => {
      input.show()
    })

    pick.onDidChangeSelection(async (e: readonly QuickPickItem[]) => {
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

      window.withProgress(
        {
          location: ProgressLocation.Notification,
        },
        async progress => {
          progress.report({ message: 'Waiting ...' })
          const res = await ajaxCreateGist(files)
          if (res.status === 201) {
            window.showInformationMessage('Success.')
          } else {
            window.showErrorMessage(`Failed. ${res.status}`)
          }
        }
      )
      pick.hide()
    })

    pick.onDidTriggerButton(() => {
      desc.show()
    })
  } catch (err: any) {
    window.showErrorMessage(err.message)
  }
}
