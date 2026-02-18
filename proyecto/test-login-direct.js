const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

async function testLogin() {
  const prisma = new PrismaClient();
  
  try {
    // Buscar usuario
    const user = await prisma.usuario.findUnique({
      where: { email: 'admin@uide.edu.ec' }
    });
    
    console.log('Usuario encontrado:', !!user);
    console.log('Datos:', {
      email: user?.email,
      rol: user?.rol,
      activo: user?.activo
    });
    
    // Verificar contraseña
    if (user) {
      const isValid = await bcrypt.compare('admin123', user.contrasena);
      console.log('Contraseña válida:', isValid);
      
      // Verificar hash
      console.log('Hash guardado:', user.contrasena.substring(0, 20) + '...');
    }
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testLogin();
