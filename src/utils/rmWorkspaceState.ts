import * as vscode from 'vscode'

export default async (context: vscode.ExtensionContext) => {
  vscode.window
    .showWarningMessage(
      'Are you serious?',
      {
        modal: true,
        detail: '警告：删除缓存后，将无法通过本地文件操作gists上与之对应的文件！',
      },
      'OK'
    )
    .then(value => {
      if (value === 'OK') {
        const data = context.workspaceState.keys()
        data.forEach(item => context.workspaceState.update(item, undefined))
        vscode.window.showWarningMessage('All clear!', 'Reload', 'Later').then(value => {
          if (value === 'Reload') vscode.commands.executeCommand('workbench.action.reloadWindow')
        })
      }
    })
}
