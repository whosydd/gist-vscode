# Gist for VS Code

## Getting Started

### Set Token

1. Generate PAT at https://github.com/settings/tokens and select `gist` scope.
2. Use `Gist: Set Token` command or add it in the `settings.json`.

### Commands

- Gist: Set Token
- Gist: List Gists
- Gist: List Starred Gists
- Gist: List Gists For User
- Gist: List Public Gists
- Gist: Delete Gists

![image-20230316214357182](https://raw.githubusercontent.com/whosydd/images-in-one/main/images/202303162144121.png)

### Explorer/Context

- List Gists
- Generate Files By Gist

![image-20230316214724341](https://raw.githubusercontent.com/whosydd/images-in-one/main/images/202303162147541.png)

### Create Gist By Select

![create gist by select](https://raw.githubusercontent.com/whosydd/images-in-one/main/images/202212152003293.png)

### Create Gist By File

#### Editor

![create gist by file](https://raw.githubusercontent.com/whosydd/images-in-one/main/images/202212152003655.png)

#### Explorer/Context

![create gist by file1](https://raw.githubusercontent.com/whosydd/images-in-one/main/images/202212152008466.png)

### Generate Files By Gist

Use this command, you need config [gist-vscode.generate](#generate) in the settings.json or use `Add To Generate List` command after list gists.

![generate](https://raw.githubusercontent.com/whosydd/images-in-one/main/images/202212152001474.png)

## Settings

### gist-vscode.token

Set token for extension. 

### gist-vscode.per_page

Gists per request. Default is `30`, max is `100`

### gist-vscode.showTitleIcon

Show icon on the editor title. Default is `false`

### <span id = "generate">gist-vscode.generate</span>

```json
// settings.json
{
    "gist-vscode.generate": [
    {
      "label": ".prettierrc",
      "description": "prettier config file", // optional
      "url": "https://gist.github.com/whosydd/3d7554d6818b0f9c9a2ec8e928857211"
    },
    //...
  ]
}
```

## Thanks

<a href="https://www.flaticon.com/free-icons/github" title="github icons">Github icons created by Pixel perfect - Flaticon</a>
