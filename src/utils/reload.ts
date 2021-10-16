import { Octokit } from '@octokit/rest'
import * as vscode from 'vscode'

export default async (octokit: Octokit, context: vscode.ExtensionContext) => {
  const res = await octokit.rest.gists.list({ per_page: 10 })
  let files: object[] = []
  res.data.forEach(item => {
    const { filename, raw_url } = Object.values(item.files).flat()[0]
    if (filename !== undefined) files.push({ [filename]: item.id })
  })
  context.workspaceState.update('gistId', files)
}
