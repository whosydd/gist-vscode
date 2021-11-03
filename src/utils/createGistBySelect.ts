import * as fs from 'fs'
import * as vscode from 'vscode'
import octokit from '../config/octokit'
import { setTokenTip } from './tips'
import path = require('path')

export default async (file: { fsPath: string }, context: vscode.ExtensionContext) => {
  // 获取选中代码块
  const editor = vscode.window.activeTextEditor
  if (!editor) throw new Error('hello world!')
  const {
    document: { lineAt, getText },
    selection: { start, end, active },
  } = editor
  const code = (
    start.isEqual(end) ? lineAt(active.line).text : getText(new vscode.Range(start, end))
  ).trim()

  try {
    // 获取文件
    const filePath = file.fsPath

    // 文件名
    const filename = filePath.split(path.sep).pop()
    // 文件内容
    const content = fs.readFileSync(filePath, 'utf-8')
    // 文件描述
    const description = await vscode.window.showInputBox({
      title: 'Gist: create a gist',
      value: `Description for ${filename}`,
    })
    if (!code.match(/\w+/)) throw new Error(`Selected code is empty, refusing to send to gists.`)

    if (description === undefined) throw new Error('')
    if (filename === undefined) throw new Error('')

    const body = {
      description,
      // TODO: 还没有设定是公共还是私人
      public: true,
      files: {
        [filename]: {
          content,
        },
      },
    }

    // 获取token
    const token: { default: string } | undefined = context.globalState.get('token')
    if (token === undefined) throw new Error('token not set yet')
    // 发送请求
    octokit(token.default)
      .rest.gists.create(body)
      .then(res => {
        if (res.status === 201) {
          const gist_id = res.data.id
          if (gist_id === undefined) return
          vscode.window.showInformationMessage('Done!', 'Copy gist_id').then(value => {
            if (value === 'Copy gist_id') {
              vscode.env.clipboard.writeText(gist_id)
              vscode.window.showInformationMessage('Copied!')
            } else return
          })
        } else vscode.window.showErrorMessage('Failed!')
      })
  } catch (error: any) {
    if (error.message === '') return
    vscode.window.showErrorMessage(error.message)
  }
}
