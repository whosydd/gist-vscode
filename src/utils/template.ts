import { ThemeIcon } from 'vscode'
import { ButtonType, GistButtons } from './types'

export const auth_buttons_template: GistButtons[] = [
  {
    iconPath: new ThemeIcon('github'),
    tooltip: 'Open gist in browser',
    flag: ButtonType.REMOTE,
  },
]

export const starred_buttons_template: GistButtons[] = [
  {
    iconPath: new ThemeIcon('star-delete'),
    tooltip: 'Unstar',
    flag: ButtonType.UNSTAR,
  },
  {
    iconPath: new ThemeIcon('github'),
    tooltip: 'Open gist in the browser',
    flag: ButtonType.REMOTE,
  },
]

export const user_buttons_template: GistButtons[] = [
  {
    iconPath: new ThemeIcon('star-full'),
    tooltip: 'Star',
    flag: ButtonType.STAR,
  },
  {
    iconPath: new ThemeIcon('gist-fork'),
    tooltip: 'Fork',
    flag: ButtonType.FORK,
  },
  {
    iconPath: new ThemeIcon('github'),
    tooltip: 'Open gist in browser',
    flag: ButtonType.REMOTE,
  },
]

export const back_button: GistButtons = {
  iconPath: new ThemeIcon('arrow-left'),
  tooltip: 'Back',
  flag: ButtonType.BACK,
}
