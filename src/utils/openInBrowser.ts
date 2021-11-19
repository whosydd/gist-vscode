import * as vscode from 'vscode'

export default (context: vscode.ExtensionContext) => {
  try {
    const userInfo: { login: string; [propName: string]: any } | undefined =
      context.globalState.get('user1')

    if (!userInfo) throw new Error('Unable to get account information')

    const login = userInfo?.login

    vscode.env.openExternal(vscode.Uri.parse('https://gist.github.com/' + login))
  } catch (error: any) {
    vscode.window.showErrorMessage(error.message)
  }
}
