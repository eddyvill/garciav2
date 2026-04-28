# Documento de Requerimientos — Sistema de Gestión de Proyectos

## Introducción

Sistema de gestión de proyectos y asignación de tareas para **García Construcciones 503**, una empresa de construcción y remodelación corporativa. El sistema permitirá a la gerencia, supervisores y personal de ejecución gestionar proyectos activos simultáneamente, asignar tareas, dar seguimiento al avance y mantener control operativo en tiempo real. Se integrará al sitio web existente construido con React + Vite + Tailwind + GSAP, utilizando Supabase como backend (PostgreSQL, Auth, Storage, Real-time).

## Glosario

- **Sistema**: El sistema de gestión de proyectos y asignación de tareas de García Construcciones 503
- **Gerencia**: Rol de usuario con visibilidad total sobre todos los proyectos, capacidad de crear proyectos, asignar supervisores y aprobar avances
- **Supervisor**: Rol de usuario asignado a uno o más proyectos, responsable de gestionar tareas dentro de sus proyectos asignados
- **Personal_de_Ejecución**: Rol de usuario que visualiza sus tareas asignadas y reporta avance de ejecución
- **Proyecto**: Unidad de trabajo principal que agrupa tareas, tiene un equipo asignado, fechas de inicio/fin y un estado general de avance
- **Tarea**: Unidad de trabajo individual dentro de un proyecto, asignada a Personal_de_Ejecución, con fecha límite, prioridad y estado de ejecución
- **Dashboard**: Panel principal que muestra un resumen visual del estado de todos los proyectos y métricas clave
- **Tablero_Kanban**: Vista de tareas organizada en columnas por estado (Pendiente, En Progreso, Completada, Bloqueada)
- **Evidencia_Fotográfica**: Imagen subida por el Personal_de_Ejecución como prueba de avance o finalización de una tarea
- **Supabase_Auth**: Servicio de autenticación de Supabase utilizado para gestionar el inicio de sesión y los roles de usuario
- **Supabase_Storage**: Servicio de almacenamiento de archivos de Supabase utilizado para guardar evidencias fotográficas
- **Supabase_Realtime**: Servicio de suscripciones en tiempo real de Supabase utilizado para actualizar datos sin recargar la página
- **Porcentaje_de_Avance**: Métrica calculada a partir de la proporción de tareas completadas respecto al total de tareas de un proyecto
- **Notificación**: Mensaje generado por el Sistema para informar a un usuario sobre un evento relevante (asignación, cambio de estado, fecha límite próxima)

## Requerimientos

### Requerimiento 1: Autenticación y Control de Acceso

**User Story:** Como usuario de García Construcciones 503, quiero iniciar sesión de forma segura y acceder únicamente a las funcionalidades correspondientes a mi rol, para que la información de los proyectos esté protegida y cada persona vea solo lo que le corresponde.

#### Criterios de Aceptación

1. THE Sistema SHALL autenticar a los usuarios mediante correo electrónico y contraseña utilizando Supabase_Auth.
2. THE Sistema SHALL asignar a cada usuario exactamente uno de los siguientes roles: Gerencia, Supervisor o Personal_de_Ejecución.
3. WHEN un usuario inicia sesión, THE Sistema SHALL redirigir al usuario al Dashboard correspondiente a su rol.
4. WHEN un usuario sin sesión activa intenta acceder a una ruta protegida, THE Sistema SHALL redirigir al usuario a la página de inicio de sesión.
5. IF un usuario intenta acceder a una funcionalidad no permitida para su rol, THEN THE Sistema SHALL denegar el acceso y mostrar un mensaje indicando permisos insuficientes.
6. WHEN un usuario cierra sesión, THE Sistema SHALL invalidar la sesión activa y redirigir a la página de inicio de sesión.

---

### Requerimiento 2: Gestión de Proyectos

**User Story:** Como Gerencia, quiero crear, editar y gestionar proyectos de construcción, para que cada obra tenga su información organizada y un equipo asignado.

#### Criterios de Aceptación

1. WHILE el usuario tiene rol de Gerencia, THE Sistema SHALL permitir crear un Proyecto con los siguientes campos obligatorios: nombre, descripción, fecha de inicio, fecha estimada de finalización y ubicación.
2. WHILE el usuario tiene rol de Gerencia, THE Sistema SHALL permitir editar los datos de cualquier Proyecto existente.
3. WHILE el usuario tiene rol de Gerencia, THE Sistema SHALL permitir asignar uno o más Supervisores a un Proyecto.
4. WHILE el usuario tiene rol de Gerencia, THE Sistema SHALL permitir asignar Personal_de_Ejecución a un Proyecto.
5. THE Sistema SHALL mantener cada Proyecto en uno de los siguientes estados: Planificación, En Progreso, Pausado o Completado.
6. WHEN la Gerencia cambia el estado de un Proyecto, THE Sistema SHALL registrar la fecha y el usuario que realizó el cambio.
7. WHILE el usuario tiene rol de Supervisor, THE Sistema SHALL mostrar únicamente los Proyectos asignados a ese Supervisor.
8. THE Sistema SHALL calcular el Porcentaje_de_Avance de cada Proyecto como la proporción de Tareas en estado Completada respecto al total de Tareas del Proyecto.

---

### Requerimiento 3: Asignación y Gestión de Tareas

**User Story:** Como Supervisor, quiero crear y asignar tareas dentro de mis proyectos, para que el personal de ejecución sepa exactamente qué debe hacer, cuándo y con qué prioridad.

#### Criterios de Aceptación

1. WHILE el usuario tiene rol de Supervisor o Gerencia, THE Sistema SHALL permitir crear una Tarea dentro de un Proyecto con los siguientes campos obligatorios: título, descripción, fecha límite, prioridad (Alta, Media, Baja) y Personal_de_Ejecución asignado.
2. WHILE el usuario tiene rol de Supervisor o Gerencia, THE Sistema SHALL permitir editar los datos de una Tarea existente dentro de los Proyectos asignados al usuario.
3. THE Sistema SHALL mantener cada Tarea en uno de los siguientes estados: Pendiente, En Progreso, Completada o Bloqueada.
4. WHILE el usuario tiene rol de Supervisor o Gerencia, THE Sistema SHALL permitir cambiar el estado de cualquier Tarea dentro de los Proyectos asignados al usuario.
5. WHILE el usuario tiene rol de Personal_de_Ejecución, THE Sistema SHALL permitir cambiar el estado de las Tareas asignadas a ese usuario únicamente de Pendiente a En Progreso, de En Progreso a Completada, o de En Progreso a Bloqueada.
6. WHEN una Tarea es asignada a un Personal_de_Ejecución, THE Sistema SHALL enviar una Notificación al Personal_de_Ejecución indicando el nombre de la Tarea, el Proyecto y la fecha límite.
7. THE Sistema SHALL mostrar las Tareas de un Proyecto en formato de Tablero_Kanban con columnas por estado.
8. THE Sistema SHALL permitir filtrar Tareas por prioridad, estado, Personal_de_Ejecución asignado y fecha límite.

---

### Requerimiento 4: Seguimiento de Avance y Evidencia

**User Story:** Como Personal_de_Ejecución, quiero reportar el avance de mis tareas y subir evidencia fotográfica, para que los supervisores y la gerencia puedan verificar el progreso de la obra.

#### Criterios de Aceptación

1. WHILE el usuario tiene rol de Personal_de_Ejecución, THE Sistema SHALL mostrar una lista de las Tareas asignadas a ese usuario con su estado actual, prioridad y fecha límite.
2. WHEN el Personal_de_Ejecución cambia el estado de una Tarea a Completada, THE Sistema SHALL solicitar al menos una Evidencia_Fotográfica antes de confirmar el cambio de estado.
3. WHEN el Personal_de_Ejecución sube una Evidencia_Fotográfica, THE Sistema SHALL almacenar la imagen en Supabase_Storage asociada a la Tarea correspondiente con la fecha y hora de carga.
4. THE Sistema SHALL aceptar Evidencia_Fotográfica en formatos JPEG y PNG con un tamaño máximo de 10 MB por imagen.
5. WHILE el usuario tiene rol de Supervisor o Gerencia, THE Sistema SHALL permitir visualizar todas las Evidencias_Fotográficas asociadas a una Tarea.
6. WHEN el Personal_de_Ejecución marca una Tarea como Bloqueada, THE Sistema SHALL solicitar un comentario describiendo el motivo del bloqueo.

---

### Requerimiento 5: Dashboard y Monitoreo

**User Story:** Como Gerencia, quiero ver un panel centralizado con el estado de todos los proyectos y tareas, para tener visibilidad completa de las operaciones y detectar retrasos a tiempo.

#### Criterios de Aceptación

1. WHILE el usuario tiene rol de Gerencia, THE Sistema SHALL mostrar un Dashboard con la lista de todos los Proyectos activos, su Porcentaje_de_Avance y su estado actual.
2. WHILE el usuario tiene rol de Gerencia, THE Sistema SHALL mostrar en el Dashboard el número total de Tareas por estado (Pendiente, En Progreso, Completada, Bloqueada) de cada Proyecto.
3. WHILE el usuario tiene rol de Supervisor, THE Sistema SHALL mostrar un Dashboard con los Proyectos asignados a ese Supervisor, su Porcentaje_de_Avance y el desglose de Tareas por estado.
4. WHILE el usuario tiene rol de Personal_de_Ejecución, THE Sistema SHALL mostrar un Dashboard con las Tareas asignadas a ese usuario, organizadas por Proyecto y estado.
5. THE Sistema SHALL resaltar visualmente las Tareas cuya fecha límite sea igual o anterior a la fecha actual y cuyo estado sea diferente de Completada.
6. WHILE el usuario tiene rol de Gerencia, THE Sistema SHALL mostrar un indicador de Proyectos con más del 20% de Tareas en estado Bloqueada.

---

### Requerimiento 6: Notificaciones en Tiempo Real

**User Story:** Como usuario del sistema, quiero recibir notificaciones cuando ocurran eventos relevantes en mis proyectos o tareas, para mantenerme informado sin necesidad de revisar manualmente.

#### Criterios de Aceptación

1. THE Sistema SHALL utilizar Supabase_Realtime para entregar Notificaciones a los usuarios conectados sin necesidad de recargar la página.
2. WHEN una Tarea cambia de estado, THE Sistema SHALL enviar una Notificación al Supervisor del Proyecto y a la Gerencia.
3. WHEN faltan 24 horas para la fecha límite de una Tarea cuyo estado es diferente de Completada, THE Sistema SHALL enviar una Notificación al Personal_de_Ejecución asignado y al Supervisor del Proyecto.
4. WHEN la Gerencia crea un nuevo Proyecto, THE Sistema SHALL enviar una Notificación a los Supervisores asignados al Proyecto.
5. THE Sistema SHALL mostrar un contador de Notificaciones no leídas en la barra de navegación del usuario.
6. WHEN el usuario abre el panel de Notificaciones, THE Sistema SHALL marcar las Notificaciones visibles como leídas.

---

### Requerimiento 7: Perfiles de Personal y Asignaciones

**User Story:** Como Gerencia, quiero ver el perfil de cada miembro del equipo con sus asignaciones activas, para gestionar la carga de trabajo y tomar decisiones de asignación informadas.

#### Criterios de Aceptación

1. THE Sistema SHALL mantener un perfil para cada usuario con los siguientes datos: nombre completo, rol, correo electrónico, teléfono y foto de perfil.
2. WHILE el usuario tiene rol de Gerencia, THE Sistema SHALL mostrar la lista completa de Personal_de_Ejecución y Supervisores con sus asignaciones activas.
3. WHILE el usuario tiene rol de Gerencia, THE Sistema SHALL mostrar para cada miembro del equipo el número de Tareas asignadas agrupadas por estado.
4. WHILE el usuario tiene rol de Gerencia, THE Sistema SHALL permitir filtrar el personal por rol, Proyecto asignado y disponibilidad.
5. WHILE el usuario tiene rol de Supervisor, THE Sistema SHALL mostrar la lista de Personal_de_Ejecución asignado a los Proyectos del Supervisor con sus Tareas activas.

---

### Requerimiento 8: Historial y Reportes

**User Story:** Como Gerencia, quiero consultar el historial de actividades y generar reportes de ejecución, para analizar el rendimiento de los proyectos y del personal.

#### Criterios de Aceptación

1. THE Sistema SHALL registrar un historial de cambios para cada Tarea que incluya: estado anterior, estado nuevo, usuario que realizó el cambio y fecha con hora.
2. THE Sistema SHALL registrar un historial de cambios para cada Proyecto que incluya: estado anterior, estado nuevo, usuario que realizó el cambio y fecha con hora.
3. WHILE el usuario tiene rol de Gerencia, THE Sistema SHALL permitir generar un reporte de avance por Proyecto que incluya: Porcentaje_de_Avance, número de Tareas por estado, Tareas vencidas y Tareas bloqueadas.
4. WHILE el usuario tiene rol de Gerencia, THE Sistema SHALL permitir generar un reporte de rendimiento por Personal_de_Ejecución que incluya: número de Tareas completadas, Tareas vencidas y tiempo promedio de ejecución.
5. WHILE el usuario tiene rol de Gerencia o Supervisor, THE Sistema SHALL permitir filtrar el historial de actividades por Proyecto, usuario, rango de fechas y tipo de evento.

---

### Requerimiento 9: Integración con el Sitio Web Existente

**User Story:** Como Gerencia, quiero que el sistema de gestión se integre al sitio web existente de García Construcciones 503, para que los usuarios accedan desde una sola plataforma sin necesidad de aplicaciones separadas.

#### Criterios de Aceptación

1. THE Sistema SHALL integrarse al sitio web existente construido con React, Vite, Tailwind CSS y GSAP como una sección protegida accesible desde la navegación principal.
2. THE Sistema SHALL mantener consistencia visual con el diseño actual del sitio web de García Construcciones 503, utilizando la misma paleta de colores, tipografía y componentes de interfaz.
3. THE Sistema SHALL ser completamente funcional en dispositivos de escritorio con resolución mínima de 1024px de ancho y en dispositivos móviles con resolución mínima de 375px de ancho.
4. THE Sistema SHALL cargar la vista inicial del Dashboard en un tiempo máximo de 3 segundos en una conexión de 4G estándar.
5. IF la conexión con Supabase se interrumpe, THEN THE Sistema SHALL mostrar un indicador visual de desconexión y reintentar la conexión cada 5 segundos.
