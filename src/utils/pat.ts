import * as vscode from 'vscode'
// set token
export const setTokenHandler = async () => {
  // 从配置下中读取token
  let token: string | undefined = vscode.workspace.getConfiguration('gist-vscode').get('token')

  // TODO: 多用户设置
  // const multi = vscode.workspace.getConfiguration('gist-for-vscode').get('multi')

  // 提示设置token
  if (!token) {
    token = await vscode.window.showInputBox({
      title: 'Gist for VS Code',
      value: 'Please enter <Personal access tokens> from https://github.com/settings/tokens',
    })

    try {
      if (!token) {
        throw new Error('Setting has not been completed!')
      }

      if (token === '') {
        throw new Error('Nothing entered!')
      }

      if (!/^ghp_/.test(token)) {
        throw new Error('The format is incorrect!')
      }

      await vscode.workspace.getConfiguration('gist-vscode').update('token', token, true)
      await vscode.window.showInformationMessage('Success!')
    } catch (error: any) {
      vscode.window.showWarningMessage(error.message, 'Try again', 'Later').then(value => {
        if (value === 'Try again') {
          vscode.commands.executeCommand('gist-vscode.setToken')
        }
      })
    }
  } else {
    vscode.window.showInformationMessage('Already done.', 'Open User Settings').then(value => {
      if (value === 'Open User Settings') {
        vscode.commands.executeCommand('workbench.action.openApplicationSettingsJson')
      }
    })
  }
}
