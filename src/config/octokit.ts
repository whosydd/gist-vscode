import { Octokit } from '@octokit/rest'

export default (token: string) => {
  const octokit = new Octokit({
    auth: token,
    baseUrl: 'https://api.github.com',
  })
  return octokit
}
