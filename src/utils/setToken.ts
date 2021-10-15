import * as vscode from 'vscode'

export default async (context: vscode.ExtensionContext) => {
  const token: string | undefined = await vscode.window.showInputBox({
    title: 'Gist for VSCode',
    value: '请输入 https://github.com/settings/tokens 获取的 Personal access tokens',
  })
  try {
    if (token === undefined) throw new Error('未完成设置Token！')

    if (token === '') throw new Error('未输入任何内容！')

    if (!/^ghp_/.test(token)) throw new Error('Token格式不正确！')

    // 扩展范围内保存token
    context.globalState.update('token', token)
    vscode.window.showInformationMessage('Token设置成功！')
  } catch (error: any) {
    vscode.window.showErrorMessage(error.message, '设置 Token', '稍后再试').then(value => {
      if (value === '设置 Token') vscode.commands.executeCommand('gist-vscode.setToken')
      if (value === '稍后再试') return
    })
  }
}
