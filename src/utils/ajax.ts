import { Octokit } from '@Octokit/rest'

// 显示已验证用户的 gists
export const showAuthGists = (octokit: Octokit, page: number, per_page: number) => {
  return octokit.rest.gists.list({ page, per_page })
}

// show starred gists
export const showStarredGists = () => {
  console.log('显示已经star的gists')
}

// show forked gists
export const showForkedGists = () => {
  console.log('显示已经fork的gists')
}

// show public gists
export const showPublicGists = (octokit: Octokit, page: number, per_page: number) => {
  return octokit.rest.gists.listPublic({ page, per_page })
}

// 显示其他用户的 public gists
export const showUserPublicGists = () => {
  console.log('显示已经fork的gists')
}

// create
export const createGist = () => {
  console.log('创建gist')
}

// update
export const updateGist = () => {
  console.log('修改gist')
}

// delete
export const deleteGist = () => {
  console.log('删除gist')
}
