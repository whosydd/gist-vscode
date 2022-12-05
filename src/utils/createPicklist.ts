import { ajaxListAuthGists, ajaxListStarredGists, ajaxListUserGists } from './ajax'
import { auth_buttons_template, starred_buttons_template, user_buttons_template } from './template'
import { AjaxType, GistButtons, GistQuickPickItem, ListAuthGistsRes } from './types'

export default async (
  page: number,
  per_page: number,
  type: AjaxType,
  username?: string
): Promise<GistQuickPickItem[]> => {
  let res: ListAuthGistsRes | undefined

  // buttons
  let buttons: GistButtons[]

  // 处理 data
  switch (type) {
    case AjaxType.SHOW_AUTH_GISTS:
      res = await ajaxListAuthGists(page, per_page)
      buttons = auth_buttons_template
      break
    // case AjaxType.SHOW_PUBLIC_GISTS:
    //   res = await ajaxListPublicGists(octokit, page, per_page)
    //   break
    case AjaxType.SHOW_STARRED_GISTS:
      res = await ajaxListStarredGists(page, per_page)
      buttons = starred_buttons_template
      break
    case AjaxType.SHOW_OTHER_USER_GISTS:
      res = await ajaxListUserGists(page, per_page, username!)
      buttons = user_buttons_template
      break
    default:
      break
  }

  // 验证请求是否成功
  if (res && res.status !== 200) {
    throw new Error('request failed.')
  }

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
      return [...pre, pick]
    }, [])

    resolve(pickList)
  })
}
