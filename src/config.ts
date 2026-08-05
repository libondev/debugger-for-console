import { workspace } from 'vscode'
import type { WorkspaceConfiguration } from 'vscode'

// 插件配置的唯一读写入口，所有消费方都经过该模块，避免入口文件成为依赖枢纽
export let resolvedConfig = {} as WorkspaceConfiguration

// 当前编辑器的 tab 大小，用于创建语句时的缩进计算
export const tabSizeConfig = {
  value: 2,
  set() {
    this.value = workspace.getConfiguration('editor').get('tabSize', 2)
  },
}

// 重新读取工作区配置（热更新）
export function refreshConfig() {
  Object.assign(resolvedConfig, workspace.getConfiguration('debugger-for-console'))
  tabSizeConfig.set()
}

export function disposeConfig() {
  resolvedConfig = null!
}
