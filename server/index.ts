import Koa from 'koa'
import Router from '@koa/router'
import cors from '@koa/cors'
import bodyParser from 'koa-bodyparser'
import { registerRoutes } from './routes.js'

const app = new Koa()
const router = new Router()

// 中间件
app.use(cors())
app.use(bodyParser())

// 注册路由
registerRoutes(router)

// 使用路由
app.use(router.routes())
app.use(router.allowedMethods())

// 启动服务器
const PORT = 3001
app.listen(PORT, () => {
  console.log(`Mock API server is running on http://localhost:${PORT}`)
})
