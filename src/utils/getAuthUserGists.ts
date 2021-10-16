import { Octokit } from '@octokit/rest'
import * as download from 'download'
import * as fs from 'fs'
import * as vscode from 'vscode'
import path = require('path')

export default async (octokit: Octokit, context: vscode.ExtensionContext) => {
  // 发送请求获取列表
  // HOW: 关于per_page的取值，考虑是否通过配置项设置
  const res = await octokit.rest.gists.list({ per_page: 10 })

  let files: object[] = []

  // 将返回结果处理成可用数据
  const pickList: string[] = res.data.reduce((pre: string[], cur) => {
    const { filename, raw_url } = Object.values(cur.files).flat()[0]
    // 将数据组合成方便处理的字符串
    const desc = cur.description
    const str = `${filename} -- ${desc} - ${raw_url}`

    // HOW: 还不确定保存所有列出的gist映射，还是只保存下载过的gist，暂定保存所有列出的映射
    if (filename !== undefined) files.push({ [filename]: cur.id })

    return [str, ...pre]
  }, [])

  // workspace范围内保存映射（文件->gist_id），方便查询
  context.workspaceState.update('gistId', files)

  const pickFile: string | undefined = await vscode.window.showQuickPick(pickList)

  // 出现选单时，未选择任何文件
  if (pickFile === undefined) return

  try {
    const [filename, _, url] = pickFile.split(/ --? /)

    // 不管工作区中添加了多少文件夹，都会保存在第一个文件夹中
    const workspace = vscode.workspace.workspaceFolders
    if (workspace === undefined) throw new Error('请先选定工作区！')
    const rootDir = workspace[0].uri.fsPath

    // 保证文件夹存在
    const location = path.resolve(rootDir, '.gist')
    if (!fs.existsSync(location)) fs.mkdirSync(location)

    // 如果已存在同名文件，改名
    // let newFilename: string
    const existFiles = await vscode.workspace.findFiles(`.gist/${filename}`)
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

    fs.writeFileSync(
      `${location}/${existFiles.length > 0 ? 'new-' + filename : filename}`,
      await download(url)
    )
    // 弃用
    // const result: object[] | undefined = context.workspaceState.get('gistId')
    // result?.forEach((item: { [key: string]: any }) => {
    //   if (item[filename]) item[filename].isDownload = true
    // })
  } catch (error: any) {
    vscode.window.showErrorMessage(error.message)
  }
}
