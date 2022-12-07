import {
  ajaxListAuthGists,
  ajaxListPublicGists,
  ajaxListStarredGists,
  ajaxListUserGists,
} from './ajax'
import {
  AjaxType,
  DELETE,
  FORK,
  GENERATE,
  GistButton,
  GistQuickPickItem,
  GITHUB,
  ListAuthGistsRes,
  ListPublicGistRes,
  ListStarredGistsRes,
  ListUserGistsRes,
  STAR,
  UNSTAR,
} from './types'

export default async (
  page: number,
  per_page: number,
  type: AjaxType,
  username?: string
): Promise<GistQuickPickItem[]> => {
  let res: ListAuthGistsRes | ListStarredGistsRes | ListUserGistsRes | ListPublicGistRes

  // buttons
  let buttons: GistButton[]

  // 处理 data
  switch (type) {
    case AjaxType.SHOW_AUTH_GISTS:
      res = await ajaxListAuthGists(page, per_page)
      buttons = [GENERATE, DELETE, GITHUB]
      break
    case AjaxType.SHOW_PUBLIC_GISTS:
      res = await ajaxListPublicGists(page, per_page)
      buttons = [GENERATE, STAR, FORK, GITHUB]
      break
    case AjaxType.SHOW_STARRED_GISTS:
      res = await ajaxListStarredGists(page, per_page)
      buttons = [GENERATE, UNSTAR, GITHUB]
      break
    case AjaxType.SHOW_USER_GISTS:
      if (username === undefined) {
        break
      }
      res = await ajaxListUserGists(page, per_page, username)
      buttons = [GENERATE, STAR, FORK, GITHUB]
      break
  }

  // 验证请求是否成功
  if (res! && res.status !== 200) {
    throw new Error('Request failed.')
  } else {
    return new Promise((resolve, reject) => {
      // 处理响应数据格式
      const pickList = res.data.reduce((pre: GistQuickPickItem[], cur) => {
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
}
