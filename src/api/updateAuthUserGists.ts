import * as vscode from 'vscode'
import octokit from '../config/octokit'
import { File } from '../config/types'
import { setTokenTip } from '../utils/tips'

export default async (
  context: vscode.ExtensionContext
): Promise<{ files: File[]; pickList: string[] }> => {
  return new Promise(async (resolve, reject) => {
    try {
      // 获取token
      const token: { default: string } | undefined = context.globalState.get('token')
      if (token === undefined) throw new Error('Token not set yet')

      // 发送请求获取gists列表
      // TODO: per_page参数待定
      const res = await octokit(token.default).rest.gists.list({ per_page: 10 })

      // 验证token有效性
      if (res.status !== 200) throw new Error('Token is invalid!')

      let files: File[] = []

      // 将返回结果处理成可用数据
      const pickList: string[] = res.data.reduce((pre: string[], cur) => {
        const { filename, raw_url } = Object.values(cur.files).flat()[0]

        if (filename === undefined || raw_url === undefined) throw new Error('Not found any file')

        // 将数据组合成方便处理的字符串
        const desc = cur.description

        let str: string
        // 判断是否存在desc
        if (desc?.trim() === '') str = filename
        else str = `${filename} - ${desc}   [${cur.id}]`

        files.push({ [cur.id]: { filename, raw_url } })

        return [str, ...pre]
      }, [])

      resolve({ files, pickList })
    } catch (error: any) {
      if (error.message === 'Not found any file') vscode.window.showErrorMessage(error.message)
      else setTokenTip(error.message)
    }
  })
}
