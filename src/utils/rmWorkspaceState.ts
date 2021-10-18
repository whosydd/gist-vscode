import * as vscode from 'vscode'

export default async (context: vscode.ExtensionContext) => {
  const data = context.workspaceState.keys()
  data.forEach(item => context.workspaceState.update(item, undefined))
  vscode.window.showWarningMessage('All clear!', 'Reload', 'Later').then(value => {
    if (value === 'Reload') vscode.commands.executeCommand('workbench.action.reloadWindow')
  })
}
