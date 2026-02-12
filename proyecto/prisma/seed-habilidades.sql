-- Seed de habilidades organizadas por área de conocimiento
-- Ejecutar: mysql -u root -proot servicios_estudiantiles < prisma/seed-habilidades.sql

USE `servicios_estudiantiles`;

-- Habilidades de Ingeniería en Sistemas / Tecnología
INSERT INTO habilidades (nombre_habilidad) VALUES
('JavaScript'),
('Python'),
('Java'),
('C++'),
('React'),
('Node.js'),
('Angular'),
('Vue.js'),
('TypeScript'),
('PHP'),
('Laravel'),
('Django'),
('Spring Boot'),
('SQL'),
('MySQL'),
('PostgreSQL'),
('MongoDB'),
('Firebase'),
('Git'),
('Docker'),
('Kubernetes'),
('AWS'),
('Azure'),
('API REST'),
('GraphQL'),
('Machine Learning'),
('Inteligencia Artificial'),
('Data Science'),
('Big Data'),
('Ciberseguridad'),
('DevOps'),
('Testing'),
('Scrum'),
('Agile');

-- Habilidades de Diseño
INSERT INTO habilidades (nombre_habilidad) VALUES
('Diseño Gráfico'),
('UI/UX Design'),
('Adobe Photoshop'),
('Adobe Illustrator'),
('Figma'),
('Sketch'),
('Adobe XD'),
('InDesign'),
('After Effects'),
('Premiere Pro'),
('Ilustración Digital'),
('Animación 2D'),
('Animación 3D'),
('Blender'),
('AutoCAD'),
('SketchUp'),
('Diseño Web'),
('Prototipado'),
('Diseño de Interfaces'),
('Branding'),
('Tipografía');

-- Habilidades de Negocios y Administración
INSERT INTO habilidades (nombre_habilidad) VALUES
('Marketing Digital'),
('SEO'),
('SEM'),
('Google Ads'),
('Facebook Ads'),
('Email Marketing'),
('Content Marketing'),
('Social Media Management'),
('Análisis de Mercado'),
('Gestión de Proyectos'),
('Finanzas'),
('Contabilidad'),
('Excel Avanzado'),
('Power BI'),
('Tableau'),
('Análisis Financiero'),
('Planificación Estratégica'),
('Liderazgo'),
('Gestión de Equipos'),
('Negociación'),
('Ventas'),
('Atención al Cliente'),
('CRM');

-- Habilidades de Comunicación y Multimedia
INSERT INTO habilidades (nombre_habilidad) VALUES
('Redacción'),
('Copywriting'),
('Edición de Video'),
('Fotografía'),
('Producción Audiovisual'),
('Locución'),
('Community Management'),
('Relaciones Públicas'),
('Periodismo Digital'),
('Podcasting'),
('Storytelling');

-- Habilidades de Ingeniería y Arquitectura
INSERT INTO habilidades (nombre_habilidad) VALUES
('CAD'),
('Revit'),
('ArchiCAD'),
('Modelado 3D'),
('Renderizado'),
('Cálculo Estructural'),
('Diseño Arquitectónico'),
('Gestión de Obra'),
('BIM'),
('Topografía');

-- Habilidades de Ciencias e Investigación
INSERT INTO habilidades (nombre_habilidad) VALUES
('Investigación'),
('Análisis Estadístico'),
('SPSS'),
('R'),
('Metodología de Investigación'),
('Redacción Científica'),
('Análisis de Datos'),
('Matemáticas Aplicadas');

-- Habilidades de Idiomas
INSERT INTO habilidades (nombre_habilidad) VALUES
('Inglés Avanzado'),
('Inglés Intermedio'),
('Francés'),
('Alemán'),
('Portugués'),
('Traducción'),
('Interpretación');

-- Habilidades Generales/Soft Skills
INSERT INTO habilidades (nombre_habilidad) VALUES
('Trabajo en Equipo'),
('Comunicación Efectiva'),
('Resolución de Problemas'),
('Pensamiento Crítico'),
('Creatividad'),
('Adaptabilidad'),
('Gestión del Tiempo'),
('Organización'),
('Presentaciones'),
('Oratoria'),
('Ética Profesional');

-- Habilidades Legales y Administrativas
INSERT INTO habilidades (nombre_habilidad) VALUES
('Derecho'),
('Legislación'),
('Contratos'),
('Recursos Humanos'),
('Nómina'),
('Compliance');

SELECT 'Habilidades insertadas correctamente' as Resultado;
SELECT COUNT(*) as 'Total Habilidades' FROM habilidades;
