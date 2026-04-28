# Plan de Implementación: Sistema de Gestión de Proyectos

## Resumen

Plan de implementación incremental para el Sistema de Gestión de Proyectos de García Construcciones 503. Se integra al sitio web existente (React + Vite + Tailwind CSS + GSAP) como una sección protegida bajo `/gestion/*`, utilizando Supabase como backend completo. Cada tarea construye sobre las anteriores, comenzando con la infraestructura base y avanzando hasta la integración final.

## Tareas

- [x] 1. Configurar infraestructura base y cliente Supabase
  - [x] 1.1 Instalar dependencias necesarias
    - Instalar `@supabase/supabase-js`, `react-router-dom`, `zustand` y `fast-check` en el proyecto
    - Configurar variables de entorno `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY` en un archivo `.env.local`
    - _Requerimientos: 9.1_

  - [x] 1.2 Crear cliente Supabase y tipos de base de datos
    - Crear `app/src/lib/supabase.ts` con la inicialización del cliente tipado
    - Crear `app/src/lib/database.types.ts` con las interfaces TypeScript principales: `UserProfile`, `Project`, `Task`, `TaskEvidence`, `Notification`, `ActivityLog`, `ProjectMember`, y los tipos enumerados `UserRole`, `ProjectStatus`, `TaskStatus`, `TaskPriority`, `NotificationType`
    - _Requerimientos: 2.5, 3.3_

  - [x] 1.3 Configurar React Router v6 e integrar con el sitio existente
    - Envolver `App` en `BrowserRouter` en `app/src/main.tsx`
    - Modificar `app/src/App.tsx` para definir rutas: `/` (landing page actual), `/login` (página de login), `/gestion/*` (módulo de gestión con lazy loading via `React.lazy`)
    - Crear `app/src/gestion/GestionApp.tsx` como punto de entrada del módulo de gestión con sub-rutas
    - _Requerimientos: 9.1, 9.4_

  - [x] 1.4 Crear esquema SQL de base de datos
    - Crear archivo `app/src/gestion/db/schema.sql` con los tipos enumerados (`user_role`, `project_status`, `task_status`, `task_priority`, `notification_type`, `entity_type`, `reference_type`, `project_role`)
    - Incluir las tablas: `profiles`, `projects`, `project_members`, `tasks`, `task_evidence`, `notifications`, `activity_log`
    - Incluir todos los índices definidos en el diseño
    - Incluir las funciones de base de datos: `calculate_project_progress`, `get_task_counts`, `update_updated_at` (trigger), `log_status_change` (trigger)
    - _Requerimientos: 2.5, 2.6, 2.8, 8.1, 8.2_

  - [x] 1.5 Crear políticas de Row Level Security (RLS)
    - Crear archivo `app/src/gestion/db/rls-policies.sql` con todas las políticas RLS definidas en el diseño para cada tabla
    - Incluir políticas de Supabase Storage para el bucket `evidence`
    - _Requerimientos: 1.5, 2.7, 4.5_

- [x] 2. Implementar autenticación y control de acceso
  - [x] 2.1 Crear AuthProvider y contexto de autenticación
    - Crear `app/src/gestion/context/AuthContext.tsx` con un provider que gestione el estado de autenticación usando Supabase Auth
    - Implementar funciones `signIn(email, password)`, `signOut()`, y `getSession()`
    - Almacenar el perfil del usuario (incluyendo rol) en el contexto tras el login consultando la tabla `profiles`
    - _Requerimientos: 1.1, 1.2, 1.6_

  - [x] 2.2 Crear página de Login
    - Crear `app/src/gestion/pages/LoginPage.tsx` con formulario de email y contraseña
    - Implementar validación de campos con Zod y react-hook-form
    - Mostrar mensajes de error genéricos ("Correo o contraseña incorrectos") sin revelar cuál campo es incorrecto
    - Redirigir al dashboard correspondiente al rol del usuario tras login exitoso usando la función `getDashboardRoute(role)`
    - Mantener consistencia visual con el sitio existente (paleta de colores brand, tipografía Inter, componentes shadcn/ui)
    - _Requerimientos: 1.1, 1.3, 9.2_

  - [x] 2.3 Crear componente ProtectedRoute y lógica de redirección por rol
    - Crear `app/src/gestion/components/ProtectedRoute.tsx` que verifique sesión activa y rol del usuario
    - Redirigir a `/login` si no hay sesión activa
    - Mostrar mensaje de permisos insuficientes si el rol no tiene acceso a la ruta solicitada
    - Implementar función `getDashboardRoute(role)` que retorne la ruta correcta según el rol
    - _Requerimientos: 1.3, 1.4, 1.5_

  - [ ]* 2.4 Escribir test de propiedad para redirección por rol
    - **Propiedad 4: Redirección al dashboard según rol**
    - **Valida: Requerimiento 1.3**

  - [ ]* 2.5 Escribir test de propiedad para autorización basada en roles
    - **Propiedad 3: Autorización basada en roles**
    - **Valida: Requerimiento 1.5**

  - [ ]* 2.6 Escribir test de propiedad para transiciones de estado válidas
    - **Propiedad 2: Transiciones de estado válidas para Personal de Ejecución**
    - **Valida: Requerimiento 3.5**

- [x] 3. Punto de control — Verificar autenticación y rutas protegidas
  - Asegurar que todos los tests pasan, preguntar al usuario si surgen dudas.

- [x] 4. Implementar layout del módulo de gestión y navegación
  - [x] 4.1 Crear GestionLayout con sidebar y header
    - Crear `app/src/gestion/components/GestionLayout.tsx` con sidebar colapsable, header con nombre del usuario y botón de notificaciones, y área de contenido principal
    - Implementar navegación lateral con enlaces a: Dashboard, Proyectos, Equipo, Reportes
    - Adaptar la visibilidad de los enlaces según el rol del usuario (ej: Reportes solo para Gerencia)
    - Diseño responsive: sidebar colapsable en móvil (≥375px), expandida en escritorio (≥1024px)
    - _Requerimientos: 9.1, 9.2, 9.3_

  - [x] 4.2 Agregar enlace al módulo de gestión en la navegación principal del sitio
    - Modificar `app/src/sections/Navigation.tsx` para agregar un enlace "Gestión de Proyectos" que dirija a `/login` o `/gestion` según el estado de autenticación
    - _Requerimientos: 9.1_

- [x] 5. Implementar funciones utilitarias y lógica de negocio
  - [x] 5.1 Crear funciones de cálculo y validación
    - Crear `app/src/gestion/utils/calculations.ts` con las funciones: `calculateProgress(tasks)`, `getTaskCounts(tasks)`, `isOverdue(task, currentDate)`, `isDueSoon(task, currentDate)`, `hasHighBlockedRate(tasks)`
    - Crear `app/src/gestion/utils/validation.ts` con las funciones: `validateProject(data)`, `validateTask(data)`, `validateEvidence(file)`, `validateStatusChange(task, newStatus, evidence, comment)`, `isValidTransition(role, fromStatus, toStatus)`
    - Crear `app/src/gestion/utils/authorization.ts` con la función `hasPermission(role, action)` y la matriz de permisos según el diseño
    - Crear `app/src/gestion/utils/routing.ts` con `getDashboardRoute(role)` (si no se creó ya en 2.3)
    - _Requerimientos: 2.8, 3.5, 4.2, 4.4, 4.6, 5.5, 5.6, 1.5_

  - [ ]* 5.2 Escribir test de propiedad para cálculo de porcentaje de avance
    - **Propiedad 1: Cálculo de porcentaje de avance**
    - **Valida: Requerimiento 2.8**

  - [ ]* 5.3 Escribir test de propiedad para validación de entidades
    - **Propiedad 5: Validación de creación de entidades**
    - **Valida: Requerimientos 2.1, 3.1**

  - [ ]* 5.4 Escribir test de propiedad para validación de archivos de evidencia
    - **Propiedad 10: Validación de archivos de evidencia**
    - **Valida: Requerimiento 4.4**

  - [ ]* 5.5 Escribir test de propiedad para validación condicional en cambio de estado
    - **Propiedad 9: Validación condicional en cambio de estado**
    - **Valida: Requerimientos 4.2, 4.6**

  - [ ]* 5.6 Escribir test de propiedad para detección de tareas vencidas
    - **Propiedad 11: Detección de tareas vencidas**
    - **Valida: Requerimiento 5.5**

  - [ ]* 5.7 Escribir test de propiedad para detección de tasa alta de bloqueo
    - **Propiedad 12: Detección de tasa alta de bloqueo**
    - **Valida: Requerimiento 5.6**

  - [ ]* 5.8 Escribir test de propiedad para detección de tareas próximas a vencer
    - **Propiedad 14: Detección de tareas próximas a vencer**
    - **Valida: Requerimiento 6.3**

- [x] 6. Punto de control — Verificar funciones utilitarias y propiedades
  - Asegurar que todos los tests pasan, preguntar al usuario si surgen dudas.

- [x] 7. Implementar capa de datos con Zustand y hooks de Supabase
  - [x] 7.1 Crear stores de Zustand
    - Crear `app/src/gestion/stores/authStore.ts` para el estado de autenticación (usuario, perfil, sesión)
    - Crear `app/src/gestion/stores/projectStore.ts` para proyectos (lista, proyecto seleccionado, filtros)
    - Crear `app/src/gestion/stores/taskStore.ts` para tareas (lista por proyecto, filtros, agrupación Kanban)
    - Crear `app/src/gestion/stores/notificationStore.ts` para notificaciones (lista, conteo de no leídas)
    - _Requerimientos: 2.5, 3.3, 6.5_

  - [x] 7.2 Crear hooks de datos con suscripciones en tiempo real
    - Crear `app/src/gestion/hooks/useProjects.ts` con carga inicial y suscripción a cambios en `projects` via Supabase Realtime
    - Crear `app/src/gestion/hooks/useTasks.ts` con carga de tareas por proyecto y suscripción a cambios en `tasks`
    - Crear `app/src/gestion/hooks/useNotifications.ts` con suscripción a nuevas notificaciones filtradas por `user_id`
    - Crear `app/src/gestion/hooks/useTeamMembers.ts` para cargar miembros del equipo y sus asignaciones
    - _Requerimientos: 6.1, 6.5_

  - [x] 7.3 Crear funciones de agrupación y filtrado
    - Implementar `groupByStatus(tasks)` para la vista Kanban (4 columnas: pendiente, en_progreso, completada, bloqueada)
    - Implementar funciones de filtrado para tareas (por prioridad, estado, asignado, fecha límite) y para personal (por rol, proyecto, disponibilidad)
    - Implementar `getVisibleProjects(user, projects, members)` para filtrar proyectos según asignación del usuario
    - _Requerimientos: 3.7, 3.8, 7.4_

  - [ ]* 7.4 Escribir test de propiedad para agrupación Kanban
    - **Propiedad 6: Agrupación Kanban por estado**
    - **Valida: Requerimiento 3.7**

  - [ ]* 7.5 Escribir test de propiedad para correctitud de filtros
    - **Propiedad 7: Correctitud de filtros**
    - **Valida: Requerimientos 3.8, 7.4, 8.5**

  - [ ]* 7.6 Escribir test de propiedad para visibilidad de datos según asignación
    - **Propiedad 8: Visibilidad de datos según asignación**
    - **Valida: Requerimientos 2.7, 4.1**

  - [ ]* 7.7 Escribir test de propiedad para conteo de notificaciones no leídas
    - **Propiedad 15: Conteo de notificaciones no leídas**
    - **Valida: Requerimiento 6.5**

- [x] 8. Punto de control — Verificar capa de datos y stores
  - Asegurar que todos los tests pasan, preguntar al usuario si surgen dudas.

- [x] 9. Implementar gestión de proyectos (CRUD)
  - [x] 9.1 Crear página de lista de proyectos
    - Crear `app/src/gestion/pages/ProyectosList.tsx` con tarjetas de proyecto mostrando nombre, ubicación, estado, porcentaje de avance (barra de progreso) y conteo de tareas
    - Gerencia ve todos los proyectos; Supervisor ve solo los asignados
    - Incluir botón "Nuevo Proyecto" visible solo para Gerencia
    - _Requerimientos: 2.1, 2.7, 5.1_

  - [x] 9.2 Crear formulario de creación/edición de proyecto
    - Crear `app/src/gestion/components/ProjectForm.tsx` con campos: nombre, descripción, fecha de inicio, fecha estimada de finalización, ubicación
    - Validar campos obligatorios con Zod
    - Implementar creación y edición de proyectos via Supabase (INSERT/UPDATE en tabla `projects`)
    - Solo accesible para rol Gerencia
    - _Requerimientos: 2.1, 2.2_

  - [x] 9.3 Implementar asignación de equipo a proyecto
    - Crear `app/src/gestion/components/TeamAssignment.tsx` para asignar Supervisores y Personal de Ejecución a un proyecto
    - Insertar registros en `project_members` con el `role_in_project` correspondiente
    - Solo accesible para rol Gerencia
    - _Requerimientos: 2.3, 2.4_

  - [x] 9.4 Implementar cambio de estado de proyecto con historial
    - Crear selector de estado en la vista de detalle del proyecto (Planificación, En Progreso, Pausado, Completado)
    - El trigger `log_status_change` en la BD registra automáticamente el cambio en `activity_log`
    - Solo accesible para rol Gerencia
    - _Requerimientos: 2.5, 2.6_

- [x] 10. Implementar gestión de tareas y tablero Kanban
  - [x] 10.1 Crear página de detalle de proyecto con tablero Kanban
    - Crear `app/src/gestion/pages/ProyectoDetalle.tsx` con información del proyecto y tablero Kanban de tareas
    - Implementar `app/src/gestion/components/KanbanBoard.tsx` con 4 columnas (Pendiente, En Progreso, Completada, Bloqueada)
    - Implementar drag-and-drop para cambiar estado de tareas entre columnas
    - Validar transiciones de estado permitidas según el rol del usuario antes de aplicar el cambio
    - _Requerimientos: 3.3, 3.4, 3.5, 3.7_

  - [x] 10.2 Crear formulario de creación/edición de tarea
    - Crear `app/src/gestion/components/TaskForm.tsx` con campos: título, descripción, fecha límite, prioridad (Alta, Media, Baja), Personal de Ejecución asignado
    - Validar campos obligatorios con Zod
    - Al crear una tarea, insertar en `tasks` y generar notificación `task_assigned` para el Personal de Ejecución asignado
    - Accesible para Gerencia y Supervisores del proyecto
    - _Requerimientos: 3.1, 3.2, 3.6_

  - [x] 10.3 Implementar filtros de tareas
    - Agregar barra de filtros en la vista de proyecto para filtrar tareas por: prioridad, estado, Personal de Ejecución asignado y fecha límite
    - Los filtros se aplican sobre la vista Kanban y la lista de tareas
    - _Requerimientos: 3.8_

  - [x] 10.4 Implementar cambio de estado de tarea con validaciones condicionales
    - Al cambiar a "Completada": solicitar al menos una evidencia fotográfica antes de confirmar
    - Al cambiar a "Bloqueada": solicitar un comentario describiendo el motivo del bloqueo
    - Personal de Ejecución solo puede realizar transiciones: pendiente→en_progreso, en_progreso→completada, en_progreso→bloqueada
    - Registrar cambio en `activity_log` via trigger y generar notificación `task_status_changed`
    - _Requerimientos: 3.4, 3.5, 4.2, 4.6_

- [x] 11. Implementar carga y visualización de evidencia fotográfica
  - [x] 11.1 Crear componente de carga de evidencia
    - Crear `app/src/gestion/components/EvidenciaUploader.tsx` con zona de drop/selección de archivos, preview de imagen, barra de progreso de carga
    - Validar formato (JPEG/PNG) y tamaño (máx 10MB) antes de subir
    - Subir a Supabase Storage en la ruta `evidence/{task_id}/{timestamp}_{filename}`
    - Crear registro en tabla `task_evidence` con la ruta, nombre, tamaño y tipo MIME
    - _Requerimientos: 4.2, 4.3, 4.4_

  - [x] 11.2 Crear galería de evidencias por tarea
    - Crear `app/src/gestion/components/EvidenciaGallery.tsx` para visualizar todas las evidencias asociadas a una tarea
    - Generar URLs firmadas con `supabase.storage.createSignedUrl(path, 3600)` para mostrar las imágenes
    - Mostrar fecha y hora de carga de cada evidencia
    - Accesible para Supervisores y Gerencia
    - _Requerimientos: 4.3, 4.5_

- [x] 12. Punto de control — Verificar gestión de proyectos, tareas y evidencias
  - Asegurar que todos los tests pasan, preguntar al usuario si surgen dudas.

- [x] 13. Implementar dashboards por rol
  - [x] 13.1 Crear Dashboard de Gerencia
    - Crear `app/src/gestion/pages/DashboardGerencia.tsx` con:
      - Lista de todos los proyectos activos con porcentaje de avance y estado
      - Conteo de tareas por estado (Pendiente, En Progreso, Completada, Bloqueada) por proyecto
      - Indicador visual de proyectos con >20% de tareas bloqueadas
      - Gráficos de avance usando Recharts (barras de progreso, gráficos circulares)
      - Resaltado visual de tareas vencidas (fecha límite ≤ hoy y estado ≠ Completada)
    - _Requerimientos: 5.1, 5.2, 5.5, 5.6_

  - [x] 13.2 Crear Dashboard de Supervisor
    - Crear `app/src/gestion/pages/DashboardSupervisor.tsx` con:
      - Lista de proyectos asignados al supervisor con porcentaje de avance
      - Desglose de tareas por estado en cada proyecto
      - Resaltado visual de tareas vencidas
    - _Requerimientos: 5.3, 5.5_

  - [x] 13.3 Crear Dashboard de Personal de Ejecución
    - Crear `app/src/gestion/pages/DashboardEjecucion.tsx` con:
      - Lista de tareas asignadas al usuario, organizadas por proyecto y estado
      - Indicadores de prioridad y fecha límite
      - Resaltado visual de tareas vencidas
    - _Requerimientos: 4.1, 5.4, 5.5_

- [x] 14. Implementar sistema de notificaciones en tiempo real
  - [x] 14.1 Crear panel de notificaciones y contador
    - Crear `app/src/gestion/components/NotificacionesPanel.tsx` como dropdown en el header del GestionLayout
    - Mostrar contador de notificaciones no leídas como badge en el ícono de campana
    - Al abrir el panel, marcar las notificaciones visibles como leídas (UPDATE `is_read = true`)
    - Suscribirse a nuevas notificaciones via Supabase Realtime filtradas por `user_id`
    - Mostrar toast (sonner) al recibir una nueva notificación
    - _Requerimientos: 6.1, 6.5, 6.6_

  - [x] 14.2 Implementar generación de notificaciones
    - Crear `app/src/gestion/services/notificationService.ts` con funciones para generar notificaciones:
      - `notifyTaskAssigned(task)`: notificar al Personal de Ejecución asignado (Req. 3.6)
      - `notifyTaskStatusChanged(task, oldStatus, newStatus)`: notificar al Supervisor del proyecto y a Gerencia (Req. 6.2)
      - `notifyProjectCreated(project, supervisors)`: notificar a los Supervisores asignados (Req. 6.4)
      - `getNotificationRecipients(event, members, users)`: determinar destinatarios según tipo de evento
    - Insertar registros en tabla `notifications` con el tipo, título, mensaje y referencia correspondientes
    - _Requerimientos: 3.6, 6.2, 6.4_

  - [ ]* 14.3 Escribir test de propiedad para destinatarios de notificaciones
    - **Propiedad 13: Destinatarios de notificaciones por cambio de estado**
    - **Valida: Requerimientos 6.2, 3.6**

- [x] 15. Implementar perfiles de personal y asignaciones
  - [x] 15.1 Crear página de equipo
    - Crear `app/src/gestion/pages/EquipoList.tsx` con lista de Personal de Ejecución y Supervisores
    - Mostrar para cada miembro: nombre, rol, correo, teléfono, foto de perfil, número de tareas asignadas agrupadas por estado
    - Implementar filtros por rol, proyecto asignado y disponibilidad
    - Gerencia ve todo el personal; Supervisor ve solo el Personal de Ejecución de sus proyectos
    - _Requerimientos: 7.1, 7.2, 7.3, 7.4, 7.5_

  - [x] 15.2 Crear vista de perfil de usuario
    - Crear `app/src/gestion/pages/PerfilUsuario.tsx` con datos del perfil: nombre completo, rol, correo, teléfono, foto de perfil
    - Permitir al usuario editar su propio perfil (nombre, teléfono, foto)
    - _Requerimientos: 7.1_

- [x] 16. Implementar historial y reportes
  - [x] 16.1 Crear vista de historial de actividades
    - Crear `app/src/gestion/pages/HistorialActividades.tsx` con tabla de registros de `activity_log`
    - Mostrar: entidad (proyecto/tarea), acción, estado anterior, estado nuevo, usuario, fecha y hora
    - Implementar filtros por proyecto, usuario, rango de fechas y tipo de evento
    - Accesible para Gerencia (todo) y Supervisores (solo sus proyectos)
    - _Requerimientos: 8.1, 8.2, 8.5_

  - [x] 16.2 Crear reportes de avance y rendimiento
    - Crear `app/src/gestion/pages/ReportesView.tsx` con dos tipos de reporte:
      - **Reporte de avance por proyecto**: porcentaje de avance, tareas por estado, tareas vencidas, tareas bloqueadas
      - **Reporte de rendimiento por Personal de Ejecución**: tareas completadas, tareas vencidas, tiempo promedio de ejecución
    - Usar Recharts para gráficos visuales (barras, circulares, líneas de tendencia)
    - Solo accesible para Gerencia
    - _Requerimientos: 8.3, 8.4_

  - [ ]* 16.3 Escribir test de propiedad para completitud del registro de actividad
    - **Propiedad 16: Completitud del registro de actividad**
    - **Valida: Requerimientos 2.6, 8.1, 8.2**

- [x] 17. Punto de control — Verificar dashboards, notificaciones, perfiles y reportes
  - Asegurar que todos los tests pasan, preguntar al usuario si surgen dudas.

- [x] 18. Implementar manejo de errores y conexión
  - [x] 18.1 Crear manejador global de errores y indicador de conexión
    - Crear `app/src/gestion/lib/error-handler.ts` con la función `handleSupabaseError(error)` que mapea códigos de error de PostgreSQL a mensajes amigables para el usuario
    - Crear `app/src/gestion/components/ConnectionStatus.tsx` que muestre un banner de desconexión cuando se pierde la conexión con Supabase y reintente cada 5 segundos
    - Integrar toasts (sonner) para mostrar errores de validación y autorización al usuario
    - _Requerimientos: 9.5_

- [x] 19. Integración final y diseño responsive
  - [x] 19.1 Verificar consistencia visual y responsive
    - Revisar que todos los componentes del módulo de gestión usen la paleta de colores `brand` del sitio existente, tipografía Inter y componentes shadcn/ui
    - Verificar funcionalidad completa en escritorio (≥1024px) y móvil (≥375px)
    - Verificar que el sitio público (landing page) no se vea afectado en rendimiento por el lazy loading del módulo de gestión
    - _Requerimientos: 9.2, 9.3, 9.4_

  - [x] 19.2 Conectar todas las rutas y sub-rutas del módulo de gestión
    - Verificar que `GestionApp.tsx` tenga todas las sub-rutas configuradas: dashboard (por rol), proyectos (lista y detalle), equipo, reportes, historial, perfil
    - Verificar que la navegación lateral refleje correctamente las opciones según el rol del usuario
    - Verificar redirecciones: login → dashboard por rol, ruta protegida sin sesión → login
    - _Requerimientos: 1.3, 1.4, 9.1_

- [x] 20. Punto de control final — Verificar integración completa
  - Asegurar que todos los tests pasan, preguntar al usuario si surgen dudas.

## Notas

- Las tareas marcadas con `*` son opcionales y pueden omitirse para un MVP más rápido
- Cada tarea referencia los requerimientos específicos que implementa para trazabilidad
- Los puntos de control aseguran validación incremental del sistema
- Los tests de propiedades validan las propiedades universales de correctitud definidas en el diseño
- Los tests unitarios validan ejemplos específicos y casos borde
- El esquema SQL y las políticas RLS deben ejecutarse en el dashboard de Supabase antes de comenzar la implementación del frontend
