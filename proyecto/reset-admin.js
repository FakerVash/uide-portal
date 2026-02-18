const bcrypt = require('bcrypt');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function resetAdmin() {
  try {
    console.log('🔧 Reseteando usuario admin...');
    
    // Hash para contraseña 'admin123'
    const hashedPassword = await bcrypt.hash('admin123', 10);
    console.log('✅ Hash generado:', hashedPassword);
    
    // Buscar si ya existe el admin
    const existingAdmin = await prisma.usuario.findUnique({
      where: { email: 'admin@uide.edu.ec' }
    });
    
    if (existingAdmin) {
      // Actualizar contraseña existente
      await prisma.usuario.update({
        where: { id_usuario: existingAdmin.id_usuario },
        data: {
          contrasena: hashedPassword,
          rol: 'ADMIN',
          activo: true
        }
      });
      console.log('✅ Admin actualizado exitosamente');
    } else {
      // Crear nuevo admin
      await prisma.usuario.create({
        data: {
          email: 'admin@uide.edu.ec',
          contrasena: hashedPassword,
          nombre: 'Administrador',
          apellido: 'Sistema',
          rol: 'ADMIN',
          activo: true,
          bio: 'Cuenta administrativa del sistema',
          foto_perfil: 'https://ui-avatars.com/api/?name=Admin+Sistema&background=870a42&color=fff'
        }
      });
      console.log('✅ Admin creado exitosamente');
    }
    
    // Verificar el usuario
    const admin = await prisma.usuario.findUnique({
      where: { email: 'admin@uide.edu.ec' },
      select: {
        id_usuario: true,
        email: true,
        nombre: true,
        rol: true,
        activo: true
      }
    });
    
    console.log('📋 Datos del admin:', admin);
    console.log('🔑 Credenciales para login:');
    console.log('   Email: admin@uide.edu.ec');
    console.log('   Contraseña: admin123');
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

resetAdmin();
