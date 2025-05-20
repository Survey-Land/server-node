import 'dotenv/config';
import App from './app';
import { AuthService } from './services/authService';

async function bootstrap() {


  
    const { created } = await AuthService.createAdminUser('en');
    console.log(
      created ? '✅ Admin user created' : 'ℹ️ Admin user already exists'
    );
  

  const port = parseInt(process.env.PORT || '3000', 10);
  const server = new App();
  await server.listen(port);
}

bootstrap().catch((error) => {
  console.error('Failed to start the server:', error);
  process.exit(1);
});