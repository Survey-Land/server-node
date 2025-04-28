import App from './app'
import 'dotenv/config'

const port = parseInt(process.env.PORT || '3000', 10)

const server = new App()

server.listen(port).catch((error) => {
  console.error('Failed to start the server:', error)
  process.exit(1)
})
