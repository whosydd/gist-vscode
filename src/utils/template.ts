import { ThemeIcon } from 'vscode'
import { ButtonType, GistButton } from './types'

export const auth_buttons_template: GistButton[] = [
  {
    iconPath: new ThemeIcon('trash'),
    tooltip: 'Delete',
    flag: ButtonType.DELETE,
  },
  {
    iconPath: new ThemeIcon('github'),
    tooltip: 'Open gist in browser',
    flag: ButtonType.REMOTE,
  },
]

export const starred_buttons_template: GistButton[] = [
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

export const user_buttons_template: GistButton[] = [
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
    tooltip: 'Open gist in the browser',
    flag: ButtonType.REMOTE,
  },
]

export const back_button_template: GistButton = {
  iconPath: new ThemeIcon('arrow-left'),
  tooltip: 'Back',
  flag: ButtonType.BACK,
}

export const more_button_template: GistButton = {
  iconPath: new ThemeIcon('sync'),
  tooltip: 'More',
  flag: ButtonType.MORE,
}

export const clear_button_template: GistButton = {
  iconPath: new ThemeIcon('clear-all'),
  tooltip: 'Clear',
  flag: ButtonType.CLEAR,
}
