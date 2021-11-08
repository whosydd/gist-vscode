import * as vscode from 'vscode'
import octokit from '../config/octokit'
import { QuickPickItem } from '../config/types'
import { setTokenTip } from '../utils/tips'

export default async (
  context: vscode.ExtensionContext,
  page: number,
  per_page: number
): Promise<QuickPickItem[]> => {
  return new Promise(async (resolve, reject) => {
    try {
      // 获取token
      const token: { default: string } | undefined = context.globalState.get('token')
      if (!token) throw new Error('Token not set yet')

      // 发送请求获取gists列表
      const res = await octokit(token.default).rest.gists.list({ page, per_page })

      // 验证token有效性
      if (res.status !== 200) throw new Error('Token is invalid!')

      // 将返回结果处理成可用数据
      const pickList = res.data.reduce((pre: QuickPickItem[], cur) => {
        const { filename, raw_url } = Object.values(cur.files).flat()[0]

        if (!filename || !raw_url) throw new Error('Not found any file')

        const pick: QuickPickItem = {
          label: filename,
          description: `${cur.description}`,
          gist_id: cur.id,
          raw_url,
        }
        return [pick, ...pre]
      }, [])

      resolve(pickList)
    } catch (error: any) {
      if (error.message === 'Not found any file') vscode.window.showErrorMessage(error.message)
      else setTokenTip(error.message)
    }
  })
}
