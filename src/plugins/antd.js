import Antd from 'ant-design-vue'
import 'ant-design-vue/dist/reset.css'

// 아이콘 import
import * as Icons from '@ant-design/icons-vue'

export function setupAntd(app) {
  // Ant Design Vue 등록
  app.use(Antd)
  
  // 모든 아이콘 전역 등록
  Object.keys(Icons).forEach(key => {
    app.component(key, Icons[key])
  })
}
