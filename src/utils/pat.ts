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
    input.title = 'Gist For VS Code: Set Token'
    input.buttons = [
      {
        iconPath: new vscode.ThemeIcon('github'),
        tooltip: 'Get personal access tokens from github',
      },
    ]
    input.placeholder =
      'Please enter <Personal Access Tokens> from https://github.com/settings/tokens'

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
          vscode.window
            .showInformationMessage('Success! Please reload vscode to enable it.', 'Reload Now')
            .then(value => {
              if (value === 'Reload Now') {
                vscode.commands.executeCommand('workbench.action.reloadWindow')
              }
            })
        }
      }
    })

    input.onDidTriggerButton(async e => {
      await vscode.env.openExternal(vscode.Uri.parse(`https://github.com/settings/tokens`))
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
