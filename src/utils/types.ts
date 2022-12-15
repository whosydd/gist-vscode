import { Endpoints } from '@octokit/types'
import { QuickInputButton, QuickPickItem, ThemeIcon } from 'vscode'

export interface GistQuickPickItem extends QuickPickItem {
  raw_url: string
  owner: {
    user: string
    gist_id: string
  }
}

export interface GistButton extends QuickInputButton {
  flag: ButtonType
}

export type GenerateItem = {
  label: string
  url: string
}

export enum ButtonType {
  REMOTE,
  STAR,
  UNSTAR,
  FORK,
  BACK,
  DELETE,
  MORE,
  CLEAR,
  GENERATE,
}

export enum CreateGistType {
  SELECTED,
  FILE,
}

export enum AjaxType {
  SHOW_AUTH_GISTS,
  SHOW_STARRED_GISTS,
  SHOW_FORKED_GISTS,
  SHOW_PUBLIC_GISTS,
  SHOW_USER_GISTS,
  CREATE_GIST,
  GET_GIST,
  DELETE_GIST,
}

export type ListAuthGistsRes = Endpoints['GET /gists']['response']
export type ListStarredGistsRes = Endpoints['GET /gists/starred']['response']
export type ListUserGistsRes = Endpoints['GET /users/{username}/gists']['response']
export type ListPublicGistRes = Endpoints['GET /gists/public']['response']

export type CreateGistParams = Endpoints['POST /gists']['parameters']

export const GITHUB: GistButton = {
  iconPath: new ThemeIcon('github'),
  tooltip: 'Open gist in the browser',
  flag: ButtonType.REMOTE,
}

export const DELETE: GistButton = {
  iconPath: new ThemeIcon('trash'),
  tooltip: 'Delete',
  flag: ButtonType.DELETE,
}
export const STAR: GistButton = {
  iconPath: new ThemeIcon('star-full'),
  tooltip: 'Star',
  flag: ButtonType.STAR,
}

export const UNSTAR: GistButton = {
  iconPath: new ThemeIcon('star-delete'),
  tooltip: 'Unstar',
  flag: ButtonType.UNSTAR,
}
export const FORK: GistButton = {
  iconPath: new ThemeIcon('gist-fork'),
  tooltip: 'Fork',
  flag: ButtonType.FORK,
}

export const BACK: GistButton = {
  iconPath: new ThemeIcon('arrow-left'),
  tooltip: 'Back',
  flag: ButtonType.BACK,
}

export const MORE: GistButton = {
  iconPath: new ThemeIcon('sync'),
  tooltip: 'More',
  flag: ButtonType.MORE,
}

export const CLEAR: GistButton = {
  iconPath: new ThemeIcon('clear-all'),
  tooltip: 'Clear',
  flag: ButtonType.CLEAR,
}

export const GENERATE: GistButton = {
  iconPath: new ThemeIcon('repo-create'),
  tooltip: 'Add To Generate List',
  flag: ButtonType.GENERATE,
}
