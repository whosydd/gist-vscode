import { Endpoints } from '@octokit/types'
import { QuickInputButton, QuickPickItem } from 'vscode'

export interface GistQuickPickItem extends QuickPickItem {
  raw_url: string
  owner: {
    user: string
    gist_id: string
  }
}

export interface GistButtons extends QuickInputButton {
  flag: ButtonType
}

export enum ReqType {
  SHOW_AUTH_GISTS,
  SHOW_STARRED_GISTS,
  SHOW_FORKED_GISTS,
  SHOW_PUBLIC_GISTS,
  SHOW_OTHER_USER_GISTS,
}

export enum ButtonType {
  REMOTE,
  STAR,
  UNSTAR,
  FORK,
  BACK,
}

export enum CreateQuickPickType {
  FILENAME,
  DESCRIPTION,
  PUBLIC,
}

export enum CreateGistType {
  SELECTED,
  FILE,
}

export enum AjaxType {
  CREATE_GIST,
  GET_GIST,
}

export type ListAuthGistsRes = Endpoints['GET /gists']['response']

export type CreateGistParams = Endpoints['POST /gists']['parameters']
