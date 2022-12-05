import { Octokit } from '@Octokit/rest'
import { commands, workspace } from 'vscode'
import { CreateGistParams } from './types'

//  confirm token
const token: string | undefined = workspace.getConfiguration('gist-vscode').get('token')

if (!token) {
  commands.executeCommand('gist-vscode.setToken')
}

const octokit = new Octokit({
  auth: token,
})

// list auth user gists
export const ajaxListAuthGists = (page: number, per_page: number) => {
  return octokit.rest.gists.list({ page, per_page })
}

// list starred gists
export const ajaxListStarredGists = (page: number, per_page: number) => {
  return octokit.rest.gists.listStarred({ page, per_page })
}

// list public gists
// export const ajaxListPublicGists = (octokit: Octokit, page: number, per_page: number) => {
//   return octokit.rest.gists.listPublic({ page, per_page })
// }

// list other user public gists
export const ajaxListUserGists = (page: number, per_page: number, username: string) => {
  return octokit.rest.gists.listForUser({
    page,
    per_page,
    username,
  })
}

// star
export const ajaxStarGist = (gist_id: string) => {
  return octokit.rest.gists.star({
    gist_id,
  })
}

// unstar
export const ajaxUnstarGist = (gist_id: string) => {
  return octokit.rest.gists.unstar({
    gist_id,
  })
}

// fork
export const ajaxForkGist = (gist_id: string) => {
  return octokit.rest.gists.fork({
    gist_id,
  })
}

// create
export const ajaxCreateGist = (files: CreateGistParams) => {
  return octokit.rest.gists.create(files)
}

// update
export const updateGist = () => {
  console.log('修改gist')
}

// delete
export const deleteGist = () => {
  console.log('删除gist')
}
