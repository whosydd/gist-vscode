import * as fs from 'fs'
import * as vscode from 'vscode'

export default async (file: { fsPath: string }, context: vscode.ExtensionContext) => {
  // TODO: 获取workspaceState中的数据，输出到.gist中的store.json文件
  if (file === undefined) {
    //
  } else {
    const filePath = file.fsPath

    const data = context.workspaceState.keys()
    console.log(data)
  }
}
