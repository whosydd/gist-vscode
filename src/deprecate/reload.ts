// import * as vscode from 'vscode'
// import octokit from '../config/octokit'
// import { File } from '../config/types'
// import { setTokenTip } from '../utils/tips'

// export default async (context: vscode.ExtensionContext) => {
//   try {
//     // 获取token
//     const token: { default: string } | undefined = context.globalState.get('token')
//     if (token === undefined) throw new Error('token not set yet')

//     // 获取最新的gists列表
//     // TODO: per_page参数待定
//     const res = await octokit(token.default).rest.gists.list({ per_page: 10 })

//     let files: File[] = []
//     // 验证token有效性
//     if (res.status !== 200) throw new Error('Token is invalid!')
//     res.data.forEach(item => {
//       const { filename, raw_url } = Object.values(item.files).flat()[0]
//       if (filename !== undefined) files.push({ [filename]: { gist_id: cur.id, raw_url } })
//     })
//     context.workspaceState.update('files', files)
//   } catch (error: any) {
//     setTokenTip(error)
//   }
// }
