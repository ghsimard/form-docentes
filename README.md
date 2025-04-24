# Form Docentes - Encuesta de Ambiente Escolar

Este proyecto es una aplicación web para recopilar información sobre el ambiente escolar a través de una encuesta dirigida a docentes. La aplicación es parte del Programa Rectores Líderes Transformadores y Coordinadores Líderes Transformadores.

## Características

- Formulario interactivo para docentes
- Autocompletado de nombres de instituciones educativas
- Validación de campos requeridos
- Almacenamiento de respuestas en base de datos PostgreSQL
- Interfaz bilingüe (español)
- Diseño responsivo

## Tecnologías Utilizadas

- React
- TypeScript
- Node.js
- Express
- PostgreSQL
- Tailwind CSS

## Requisitos Previos

- Node.js (v14 o superior)
- PostgreSQL (v13 o superior)
- npm o yarn

## Instalación

1. Clonar el repositorio:
```bash
git clone https://github.com/ghsimard/form-docentes.git
cd form-docentes
```

2. Instalar dependencias:
```bash
npm install
```

3. Configurar variables de entorno:
Crear un archivo `.env` en la raíz del proyecto con las siguientes variables:
```
DB_USER=tu_usuario
DB_PASSWORD=tu_contraseña
DB_HOST=localhost
DB_PORT=5432
DB_NAME=form_docentes
```

4. Iniciar el servidor de desarrollo:
```bash
npm start
```

5. En otra terminal, iniciar el servidor backend:
```bash
npm run server
```

## Estructura del Proyecto

- `/src` - Código fuente de la aplicación React
  - `/components` - Componentes React reutilizables
  - `/data` - Datos estáticos y configuraciones
  - `/types` - Definiciones de tipos TypeScript
  - `/server` - Código del servidor Express

## Scripts Disponibles

- `npm start` - Inicia el servidor de desarrollo de React
- `npm run build` - Construye la aplicación para producción
- `npm run server` - Inicia el servidor backend
- `npm test` - Ejecuta las pruebas
- `npm run import-rectores` - Importa datos de rectores desde Excel

## Contribución

Para contribuir al proyecto:

1. Fork el repositorio
2. Crear una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abrir un Pull Request

## Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.
 