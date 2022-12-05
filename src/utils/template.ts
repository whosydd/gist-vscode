import { ThemeIcon } from 'vscode'
import { ButtonTip, GistButtons } from './types'

export const auth_buttons_template: GistButtons[] = [
  {
    iconPath: new ThemeIcon('github'),
    tooltip: 'Open gist in browser',
    flag: ButtonTip.REMOTE,
  },
]

export const starred_buttons_template: GistButtons[] = [
  {
    iconPath: new ThemeIcon('star-delete'),
    tooltip: 'Unstar',
    flag: ButtonTip.UNSTAR,
  },
  {
    iconPath: new ThemeIcon('github'),
    tooltip: 'Open gist in browser',
    flag: ButtonTip.REMOTE,
  },
]

export const user_buttons_template: GistButtons[] = [
  {
    iconPath: new ThemeIcon('star-full'),
    tooltip: 'Star',
    flag: ButtonTip.STAR,
  },
  {
    iconPath: new ThemeIcon('gist-fork'),
    tooltip: 'Fork',
    flag: ButtonTip.FORK,
  },
  {
    iconPath: new ThemeIcon('github'),
    tooltip: 'Open gist in browser',
    flag: ButtonTip.REMOTE,
  },
]
