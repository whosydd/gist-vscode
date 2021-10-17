import * as vscode from 'vscode'

export default async (context: vscode.ExtensionContext) => {
  // TODO: 多用户设置
  // const multi = vscode.workspace.getConfiguration('gist-for-vscode').get('multi')

  const user = 'default'

  const token: string | undefined = await vscode.window.showInputBox({
    title: 'Gist for VSCode',
    value: 'Please enter <Personal access tokens> from https://github.com/settings/tokens',
  })
  try {
    if (token === undefined) throw new Error('Setting has not been completed!')

    if (token === '') throw new Error('Nothing entered!')

    if (!/^ghp_/.test(token)) throw new Error('The format is incorrect!')

    // 扩展范围内保存token
    context.globalState.update('token', { [user]: token })
    vscode.window.showInformationMessage('Successfully!')
  } catch (error: any) {
    vscode.window.showErrorMessage(error.message, 'Try again', 'Later').then(value => {
      if (value === 'Try again') vscode.commands.executeCommand('gist-vscode.setToken')
    })
  }
}
