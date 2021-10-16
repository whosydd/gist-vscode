import { Octokit } from '@octokit/rest'
import * as fs from 'fs'
import * as vscode from 'vscode'
import path = require('path')

export default async (file: any, octokit: Octokit, context: vscode.ExtensionContext) => {
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

  // 判断是否手快没改描述
  if (description === `Description for ${filename}`) {
    vscode.window.showWarningMessage('建议不要使用默认的desc~')
    await vscode.window.showInputBox({
      title: 'Gist: create a gist',
      value: `Description for ${filename}`,
    })
  }

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
  // 发送请求
  octokit.rest.gists.create(body).then(res => {
    if (res.status === 201) vscode.window.showInformationMessage('gist创建成功！')
    else vscode.window.showErrorMessage('gist创建失败！')
  })
}
