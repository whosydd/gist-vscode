import * as fs from 'fs'
import * as vscode from 'vscode'
import octokit from '../config/octokit'
import { setTokenTip } from './tips'
import path = require('path')

export default async (file: vscode.Uri, context: vscode.ExtensionContext) => {
  try {
    // 获取选中代码块
    const editor = vscode.window.activeTextEditor!
    const {
      document: { lineAt, getText },
      selection: { start, end, active },
    } = editor
    const code = (
      start.isEqual(end) ? lineAt(active.line).text : getText(new vscode.Range(start, end))
    ).trim()

    // 判断代码格式
    if (!code.match(/\w+/)) throw new Error(`Selected code is empty, refusing to send to gists.`)

    // 获取文件
    const filePath = file.fsPath

    // 文件名
    const tmpName = filePath.split(path.sep).pop()!
    const filename = await vscode.window.showInputBox({
      title: 'Gist: create a gist',
      value: tmpName,
    })
    if (!filename) return
    let newFilename: string
    const ext = tmpName.split('.').pop()!
    if (!filename.includes(ext)) newFilename = filename + '.' + ext
    else newFilename = filename
    if (!newFilename.includes('.')) throw new Error('Please set file extension')
    // 文件内容
    const content = code
    // 文件描述
    const description = await vscode.window.showInputBox({
      title: 'Gist: create a gist',
      value: `Description for ${newFilename}`,
    })
    if (!description) return

    // public or private
    const flag = await vscode.window.showQuickPick([
      { label: 'public', value: true },
      { label: 'private', value: false },
    ])
    if (!flag) return

    const body = {
      description,
      public: flag.value,
      files: {
        [newFilename]: {
          content,
        },
      },
    }

    // 获取token
    const token: { default: string } | undefined = context.globalState.get('token')
    if (!token) throw new Error('Token not set yet')
    // 发送请求
    octokit(token.default)
      .rest.gists.create(body)
      .then(res => {
        if (res.status === 201) {
          const gist_id = res.data.id!
          vscode.window.showInformationMessage('Done!', 'Copy gist_id').then(value => {
            if (value === 'Copy gist_id') {
              vscode.env.clipboard.writeText(gist_id)
              vscode.window.showInformationMessage('Copied!')
            } else return
          })
        } else vscode.window.showErrorMessage('Failed!')
      })
  } catch (error: any) {
    if (error.message === 'Token not set yet') setTokenTip(error)
    vscode.window.showErrorMessage(error.message)
  }
}
