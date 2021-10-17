import * as vscode from 'vscode'
import updateAuthUserGists from '../api/updateAuthUserGists'
import octokit from '../config/octokit'
import { setTokenTip } from './tips'

export default async (context: vscode.ExtensionContext) => {
  try {
    // 先获取最新的gists列表
    const { files, pickList } = await updateAuthUserGists(context)
    // const rmList = files.filter(item => {
    //   const i = Object.values(item)[0].isDownload
    // })

    // const list = files.flatMap(item => `${Object.keys(item)} -- ${Object.values(item)}`)

    const pickFiles = await vscode.window.showQuickPick(pickList, {
      canPickMany: true,
    })

    if (pickFiles === undefined) return

    // 获取token
    const token: { default: string } | undefined = context.globalState.get('token')
    if (token === undefined) throw new Error('token not set yet')

    // FIX: 当删除多个同名文件时，总是删除第一个匹配的
    let rmList: object[] = []
    pickFiles.forEach(pickFile => {
      // 获取gist_id
      const [filename, _] = pickFile.split(/ -- /)
      // if (Object.keys(pickFile[0] === filename)) rmList.push(pickFile)
      // const file = files.filter(item => Object.keys(item)[0] === filename)
      // rmList.push(...file)
      // rmList.push(Object.values(file)[0].gist_id)
      // const gist_id = Object.values(file)[0].gist_id
    })
    console.log(rmList)

    // 发送请求
    // octokit(token.default).rest.gists.delete({ gist_id })
    vscode.window.showInformationMessage('Select is already removed')
  } catch (error: any) {
    setTokenTip(error)
  }
}
