import { WorkspaceFolder } from 'vscode'

export default (folder: WorkspaceFolder) => {
  const dst = folder.uri.fsPath
  console.log('dst:', dst)
  console.log('folder:', folder)
}
