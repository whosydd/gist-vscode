import * as vscode from 'vscode'
// set token
export const setTokenHandler = async () => {
  // 从配置下中读取token
  let token: string | undefined = vscode.workspace.getConfiguration('gist-vscode').get('token')

  // TODO: 多用户设置
  // const multi = vscode.workspace.getConfiguration('gist-for-vscode').get('multi')

  // 设置token
  if (!token) {
    const input = vscode.window.createInputBox()
    input.show()
    input.ignoreFocusOut = true
    input.title = 'Set Token'
    input.placeholder =
      'Please enter <Personal access tokens> from https://github.com/settings/tokens'

    input.onDidAccept(async () => {
      token = input.value
      if (input.value === '') {
        input.placeholder = 'Nothing entered!'
      } else {
        if (!/^ghp_/.test(token)) {
          input.value = ''
          input.placeholder = 'The format is incorrect!'
        } else {
          input.hide()
          await vscode.workspace.getConfiguration('gist-vscode').update('token', token, true)
          await vscode.window.showInformationMessage('Success!')
        }
      }
    })

    input.onDidHide(() => {
      input.dispose()
    })
  } else {
    vscode.window.showInformationMessage('Already done.', 'Open User Settings').then(value => {
      if (value === 'Open User Settings') {
        vscode.commands.executeCommand('workbench.action.openApplicationSettingsJson')
        vscode.workspace.getConfiguration('gist-vscode').update('token', token, true)
      }
    })
  }
}
