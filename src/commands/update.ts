import { refreshConfig } from '../config'
import { resetFileDepthCache } from '../core/message'

export function updateUserConfig() {
  refreshConfig()

  // 配置变化后文件路径深度缓存需要失效
  resetFileDepthCache()
}
