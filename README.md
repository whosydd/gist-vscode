# Gist for VSCode 正在开发中

## TODO LIST

### DONE:

- 设置`token`并保存在`context.globalState`中（扩展范围） - 单用户
- 更新已验证用户的`gists`列表，并将`filename`、`gist_id`、`raw_url`保存在`context.workspaceState`中，方便其他接口进行进一步操作
- 获取已验证用户的`gists`列表，并将选中文件保存在`workspace`根目录的`.gist`文件夹中
- 从文件创建`gist` - 该命令只能通过`资源管理器右键菜单`，`编辑器右键菜单`，`编辑器标题图标`执行，为了简化操作，已将相关命令从`命令面板`中去除
- 在`.gist`文件夹中添加复制`gist_id`命令，可以将当前文件的`gist_id`复制到剪贴板，这个功能可以与[PrettierConfig for VS Code](https://marketplace.visualstudio.com/items?itemName=whosydd.prettier-config)和[StylelintConfig for VS Code](https://marketplace.visualstudio.com/items?itemName=whosydd.stylelint-config)进行联动，方便快速的配置相关文件
- 在`.gist`文件夹中添加删除命令（只有此文件夹中的文件点击会出现命令选项），可以在删除本地文件的同时删除远程 gist 文件，同时也可以直接通过命令面板批量删除远程 gist 文件
- 在创建`gist`后，提示是否将`gist_id`复制到剪贴板
- 如果`.gist`文件夹中的文件找不到`gist_id`，会提示是否为当前文件创建 gist
- 新的命令，可以删除`workspaceState`中缓存的数据

### TODO:

- 多用户配置暂时感觉没必要，以后迭代的时候再考虑
- 目前对于`per_page`还不确定，可以根据配置改变
- 从选中代码创建 gist
- 编辑 gist
  - 实现 1：下载到缓存区再编辑，保存后推送到 gist
  - 实现 2：使用 webview 直接打开独立面板
  - 实现 3：还没想到
- 评论相关的所有功能
- 有关删除 gist 的行为，考虑要不要添加备份功能，防止误操作
- 创建 gist 时，公共还是私人的模式选择
- 将`workspaceState`中缓存的数据以`json`格式保存到`.gist`中
