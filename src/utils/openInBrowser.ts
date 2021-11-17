import * as vscode from 'vscode'

export default (context: vscode.ExtensionContext) => {
  const userInfo: { login: string } | undefined = context.globalState.get('user')
  const login = userInfo?.login

  vscode.env.openExternal(vscode.Uri.parse('https://gist.github.com/' + login))
}
