import * as download from 'download'
import * as fs from 'fs'
import * as vscode from 'vscode'
import updateAuthUserGists from '../api/updateAuthUserGists'
import path = require('path')

export default async (context: vscode.ExtensionContext) => {
  try {
    // 获取最新gist列表
    const { files, pickList } = await updateAuthUserGists(context)

    const pickFile: string | undefined = await vscode.window.showQuickPick(pickList, {
      // TODO: 暂时还无法解决多个文件下载时的同名文件问题
      canPickMany: false,
    })

    // 出现选单时，未选择任何文件
    if (pickFile === undefined) return

    // 获取文件名和下载链接
    const [filename, desc, gist_id] = pickFile.split(/ - |   \[|]/)
    const pick = files.filter(file => Object.keys(file)[0] === gist_id)[0]
    const url = pick[gist_id].raw_url

    // 不管工作区中添加了多少文件夹，都会保存在第一个文件夹中
    const workspace = vscode.workspace.workspaceFolders
    if (workspace === undefined) throw new Error('Please open a workspace')
    const rootDir = workspace[0].uri.fsPath

    // 保证文件夹存在
    const location = path.resolve(rootDir, '.gist')
    if (!fs.existsSync(location)) fs.mkdirSync(location)

    // 如果本地已存在同名文件，提示改名
    let newFilename: string
    const existFiles = await vscode.workspace.findFiles(`.gist/${filename}`)
    if (existFiles.length > 0)
      vscode.window
        .showWarningMessage(`${filename} already existed!`, 'Rename', "it's OK")
        .then(async value => {
          if (value === 'Rename') {
            let newName = await vscode.window.showInputBox({
              value: `${filename}`,
            })
            const ext = filename.split('.').pop()
            if (ext === undefined || newName === undefined) throw new Error('')
            if (!newName.includes(ext)) newFilename = newName + '.' + ext
            else newFilename = newName
          } else if (value === `it's OK`) newFilename = filename
          else throw new Error('')
          fs.writeFileSync(`${location}/${newFilename}`, await download(url))
        })
    else fs.writeFileSync(`${location}/${filename}`, await download(url))

    //#region
    // if (existFiles.length > 0) {
    //   const ext = filename.split('.').pop()
    //   vscode.window
    //     .showInputBox({
    //       title: 'Gist: rename',
    //       value: `${filename} already existed! Please enter new filename`,
    //     })
    //     .then(async newname => {
    //       if (ext !== undefined && newname !== undefined) {
    //         if (newname === `${filename} already existed! Please enter new filename`) return
    //         if (newname.split('.').pop() !== ext) newFilename = `${newname}.${ext}`
    //         else newFilename = newname
    //       }
    //       fs.writeFileSync(`${location}/${newFilename}`, await download(url))
    //     })
    // } else fs.writeFileSync(`${location}/${filename}`, await download(url))

    // const result: object[] | undefined = context.workspaceState.get('files')
    // result?.forEach((item: { [key: string]: any }) => {
    //   if (item[filename]) item[filename].isDownload = true
    // })
    //#endregion
  } catch (error: any) {
    if (error.message === '') return
    vscode.window.showErrorMessage(error.message)
  }
}
