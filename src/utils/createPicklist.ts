import { Octokit } from '@octokit/rest'
import { commands, ThemeIcon, workspace } from 'vscode'
import { showAuthGists } from './ajax'
import { ButtonTip, GistButtons, GistQuickPickItem, ListAuthGistsRes, ReqType } from './types'

const token: string | undefined = workspace.getConfiguration('gist-vscode').get('token')

if (!token) {
  commands.executeCommand('gist-vscode.setToken')
}
export default async (
  page: number,
  per_page: number,
  type: ReqType
): Promise<GistQuickPickItem[]> => {
  const octokit = new Octokit({
    auth: token,
  })
  let res: ListAuthGistsRes | undefined

  // 处理 ajax
  switch (type) {
    case ReqType.SHOW_AUTH_GISTS:
      res = await showAuthGists(octokit, page, per_page)
      break

    default:
      break
  }

  // 验证请求是否成功
  if (res && res.status !== 200) {
    throw new Error('request failed.')
  }

  // buttons
  const buttons: GistButtons[] = [
    {
      iconPath: new ThemeIcon('github'),
      tooltip: 'Open gist in browser',
      flag: ButtonTip.REMOTE,
    },
  ]

  return new Promise((resolve, reject) => {
    // 处理响应数据格式
    const pickList = res!.data.reduce((pre: GistQuickPickItem[], cur) => {
      const { filename, raw_url } = Object.values(cur.files).flat()[0]
      if (!filename || !raw_url) {
        throw new Error('Not found any file')
      }
      const pick: GistQuickPickItem = {
        label: filename,
        description: `${cur.description}`,
        raw_url,
        owner: {
          user: cur.owner?.login!,
          gist_id: cur.id,
        },
        buttons,
      }
      return [pick, ...pre]
    }, [])

    resolve(pickList)
  })
}
