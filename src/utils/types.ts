import { Endpoints } from '@octokit/types'
import { QuickInputButton, QuickPickItem } from 'vscode'

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

export enum ButtonType {
  REMOTE,
  STAR,
  UNSTAR,
  FORK,
  BACK,
  DELETE,
  MORE,
  CLEAR,
}

export enum QuickPickType {
  INPUT,
  QUICKPICK,
  FILENAME,
  DESCRIPTION,
  PUBLIC,
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
  SHOW_OTHER_USER_GISTS,
  CREATE_GIST,
  GET_GIST,
  DELETE_GIST,
}

export type ListAuthGistsRes = Endpoints['GET /gists']['response']

export type CreateGistParams = Endpoints['POST /gists']['parameters']
