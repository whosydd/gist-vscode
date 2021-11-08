import * as fs from 'fs'
import * as vscode from 'vscode'
import octokit from '../config/octokit'
import { setTokenTip } from './tips'
import path = require('path')

export default async (file: { fsPath: string }, context: vscode.ExtensionContext) => {
  try {
    // 获取文件
    const filePath = file.fsPath

    // 文件名
    const filename = filePath.split(path.sep).pop()!
    // 文件内容
    const content = fs.readFileSync(filePath, 'utf-8')
    // 文件描述
    const description = await vscode.window.showInputBox({
      title: 'Gist: create a gist',
      value: `Description for ${filename}`,
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
        [filename]: {
          content,
        },
      },
    }

    // 获取token
    const token: { default: string } | undefined = context.globalState.get('token')
    if (!token) throw new Error('token not set yet')
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
    setTokenTip(error)
  }
}
