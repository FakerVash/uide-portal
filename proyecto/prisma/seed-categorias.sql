-- Script para agregar categorías a la base de datos
-- Ejecutar este script en MySQL/phpMyAdmin

INSERT INTO categorias (nombre_categoria, descripcion, icono) VALUES
('Desarrollo Web', 'Creación y desarrollo de sitios web, aplicaciones web y sistemas online', 'code'),
('Diseño Gráfico', 'Diseño de logos, branding, ilustraciones y material gráfico', 'palette'),
('Tutorías', 'Clases particulares y tutorías académicas en diversas materias', 'school'),
('Multimedia', 'Edición de video, audio, fotografía y contenido multimedia', 'movie'),
('Asesorías', 'Asesoramiento profesional en proyectos de grado y consultorías', 'people'),
('Redacción', 'Redacción de contenido, artículos, ensayos y textos profesionales', 'edit'),
('Traducción', 'Servicios de traducción en múltiples idiomas', 'translate'),
('Marketing', 'Marketing digital, gestión de redes sociales y publicidad', 'trending_up'),
('Programación', 'Desarrollo de software, apps móviles y soluciones tecnológicas', 'laptop_mac'),
('Consultoría', 'Consultoría empresarial y asesoramiento estratégico', 'business_center');
