# TODO LIST

## DONE:

- 设置`token`并保存在`context.globalState`中（扩展范围） - 单用户
- 更新已验证用户的`gists`列表，并将`filename`、`gist_id`、`raw_url`保存在`context.workspaceState`中，方便其他接口进行进一步操作
- 获取已验证用户的`gists`列表，并将选中文件保存在`workspace`根目录的`.gist`文件夹中
- 从文件创建`gist` - 该命令只能通过`资源管理器右键菜单`，`编辑器右键菜单`，`编辑器标题图标`执行，为了简化操作，已将相关命令从`命令面板`中去除

## TODO:

- 多用户配置暂时感觉没必要，以后迭代的时候再考虑
- 目前对于`per_page`还不确定，可以根据配置改变
- 从选中代码创建gist
- 编辑gist
  - 实现1：下载到缓存区再编辑，保存后推送到gist
  - 实现2：使用webview直接打开独立面板
  - 实现3：还没想到
- 评论相关的所有功能
- 

