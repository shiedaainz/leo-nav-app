# Leo - Plataforma Inteligente de Navegacion Universitaria

Leo es una aplicacion web para orientar a estudiantes y visitantes dentro de sedes de la Universidad de Pamplona. La app permite buscar destinos, calcular rutas sobre un grafo de nodos reales, mostrar instrucciones de navegacion, guardar horarios opcionales, marcar favoritos y usar una camara guiada basica tipo pseudo-AR con apoyo de voz de Leo.

El proyecto esta construido como una Progressive Web App (PWA), por lo que puede usarse desde el navegador o instalarse en el celular como una app cuando se despliega con HTTPS.

## Funcionalidades principales

- Splash screen con Leo como identidad visual de la app.
- Login, registro y acceso como visitante.
- Registro seguro para el MVP: despues de crear cuenta, el usuario vuelve al login.
- Perfil de usuario con datos y resumen de actividad.
- Mapa interactivo con Leaflet y OpenStreetMap.
- Busqueda de sedes y destinos principales.
- Botones rapidos para elegir destinos.
- Sistema de rutas basado en nodos, conexiones y Dijkstra.
- Ruta recomendada antes de iniciar navegacion.
- Navegacion activa con distancia, tiempo estimado e instrucciones.
- Leo como asistente visual con mensajes segun el estado de la ruta.
- Voz de Leo con lectura de mensajes y comandos basicos por microfono.
- Horarios manuales opcionales guardados por usuario con Supabase o en el navegador como respaldo.
- Edicion y eliminacion de horarios.
- Favoritos de destinos por usuario.
- Camara guiada basica con overlay visual, instrucciones y voz de Leo.
- Panel administrativo para revisar y renombrar nodos importantes del grafo.
- PWA basica con manifest, iconos y service worker.
- Responsive para uso en celular.

## Como funciona

### 1. Autenticacion

La autenticacion principal funciona con Supabase Auth cuando las variables de entorno estan configuradas.

Cuando un usuario se registra, la app crea su cuenta y lo redirige al login con un mensaje de confirmacion. Esto evita iniciar sesion automaticamente despues del registro.

Cuando inicia sesion, la app valida el correo y la contrasena con Supabase. Si Supabase no esta configurado, el proyecto conserva un respaldo local para pruebas.

Tambien existe el acceso como visitante. Este crea una sesion temporal con rol `visitor` para que la persona pueda usar el mapa sin registrarse.

Archivos principales:

- `src/utils/auth.ts`
- `src/app/login/page.tsx`
- `src/app/register/page.tsx`

### 2. Mapa interactivo

El mapa principal esta en `CampusMap`. Usa Leaflet mediante `react-leaflet`. Como Leaflet necesita `window`, los componentes del mapa se cargan con `dynamic(..., { ssr: false })` para evitar errores de renderizado en servidor.

El mapa muestra:

- Marcadores de sedes y puntos importantes.
- Marcador de ubicacion del usuario si el navegador permite geolocalizacion.
- Linea de ruta cuando hay navegacion activa.
- Boton para activar ubicacion.
- Editor de grafo solo en desarrollo con `?editor=true`.

Archivos principales:

- `src/app/components/map/CampusMap.tsx`
- `src/app/components/map/RecenterMap.tsx`
- `src/hooks/useGeolocation.ts`

### 3. Destinos y busqueda

Los destinos visibles de la app estan definidos en `campusLocations.ts`. Cada destino tiene:

- `id`
- `name`
- `type`
- `description`
- `lat`
- `lng`
- `color`
- `estimatedMinutes`

La busqueda filtra por nombre, descripcion y tipo. Tambien normaliza texto para tolerar acentos y coincidencias parciales.

Ademas de los destinos principales, algunos nodos importantes del grafo tambien pueden aparecer como destinos. Esto permite buscar edificios o puntos internos sin llenar el mapa con demasiados marcadores.

Ejemplo: buscar `virgen`, `rosario`, `biblioteca`, `ipt` o `casona` puede encontrar los destinos correspondientes.

Archivos principales:

- `src/data/campusLocations.ts`
- `src/app/components/ui/SearchBar.tsx`

### 4. Grafo de navegacion

La ruta no se calcula como una linea recta entre dos puntos. Se calcula sobre un grafo.

El grafo esta compuesto por:

- `campusNodes`: puntos de referencia con latitud y longitud.
- `campusEdges`: conexiones entre nodos con distancia en metros.
- `locationNodeById`: relacion entre un destino visible y el nodo del grafo que representa su acceso.
- `defaultStartNodeId`: nodo usado como origen cuando no hay GPS activo.

Esto permite que la ruta siga calles, accesos y caminos definidos, en vez de dibujar una linea falsa directa.

Archivo principal:

- `src/data/campusGraph.ts`

### 5. Calculo de rutas con Dijkstra

Cuando el usuario elige un destino, la app busca el nodo asociado a ese destino.

Despues define el origen:

- Si el usuario activo GPS, se busca el nodo mas cercano a su ubicacion actual.
- Si no hay GPS, se usa `defaultStartNodeId`, actualmente la Entrada principal.

Con origen y destino definidos, se ejecuta Dijkstra para encontrar la ruta mas corta.

El resultado incluye:

- Lista de nodos recorridos.
- Coordenadas para dibujar la linea en el mapa.
- Distancia total.
- Tiempo estimado.
- Pasos de navegacion.

Los pasos se agrupan para evitar mostrar demasiadas instrucciones tipo `Nodo 1`, `Nodo 2`. La interfaz muestra instrucciones mas limpias como avanzar hacia un acceso o destino importante.

Archivo principal:

- `src/utils/dijkstra.ts`

### 6. Panel de navegacion

El panel inferior muestra el estado actual de la ruta.

Antes de iniciar navegacion muestra:

- Destino seleccionado.
- Origen usado.
- Tiempo estimado.
- Ruta recomendada.
- Distancia aproximada.

Cuando la ruta esta activa muestra:

- Destino.
- Distancia.
- Instrucciones.
- Boton para actualizar.
- Boton para abrir camara.
- Boton para cancelar.

Archivo principal:

- `src/app/components/navigation/NavigationPanel.tsx`

### 7. Leo como asistente

Leo no es solo un logo. En Home aparece con una burbuja de mensajes controlados.

Los mensajes cambian segun el estado:

- Bienvenida inicial.
- Destino seleccionado.
- Recomendacion de activar ubicacion.
- Busqueda de GPS.
- Error de geolocalizacion.
- Ruta activa.
- Llegada al destino cuando el usuario esta cerca.

Esto cumple la idea del asistente del MVP sin usar IA avanzada.

Leo tambien puede leer su mensaje en voz alta usando la sintesis de voz del navegador. Ademas puede escuchar comandos simples cuando el navegador soporta reconocimiento de voz.

En el modo camara, Leo participa de forma automatica: al abrir la camara guiada anuncia el destino, lee la primera instruccion de la ruta y recuerda al usuario que use la vista como apoyo visual.

Comandos de ejemplo:

- `biblioteca`
- `sede casona`
- `virgen del rosario`
- `horarios`
- `perfil`
- `iniciar ruta`
- `ubicacion`

Archivo principal:

- `src/app/components/leo/LeoAvatar.tsx`

### 8. Horarios opcionales

La pantalla de horarios permite guardar clases o actividades manualmente.

Cada horario tiene:

- Materia.
- Sede o destino.
- Aula o referencia.
- Dia.
- Hora de inicio.
- Hora de fin.

Los horarios se guardan por usuario en Supabase cuando la base de datos esta configurada. Si Supabase no esta disponible, la app puede guardarlos localmente en el navegador.

Desde cada horario se puede abrir el mapa con el destino seleccionado. Tambien se pueden editar o eliminar desde la misma pantalla.

Archivos principales:

- `src/app/schedule/page.tsx`
- `src/utils/schedules.ts`

### 9. Favoritos

Leo permite marcar destinos como favoritos. Los favoritos aparecen primero en los botones rapidos y se identifican con una estrella.

Si Supabase esta configurado, los favoritos se guardan por usuario en la tabla `favorites`. Si no esta configurado, se guardan localmente en el navegador.

Archivos principales:

- `src/utils/favorites.ts`
- `src/app/home/page.tsx`
- `src/app/components/ui/SearchBar.tsx`
- `src/app/components/navigation/NavigationPanel.tsx`

### 10. Perfil

La pantalla de perfil muestra el nombre, correo, tipo de cuenta, cantidad de favoritos y cantidad de horarios guardados.

Desde el perfil el usuario puede volver al mapa, abrir horarios o cerrar sesion.

Archivo principal:

- `src/app/profile/page.tsx`

### 11. Camara guiada basica

La camara guiada es una pseudo-AR. No hace reconocimiento visual ni AR real. Abre la camara del dispositivo y pone encima un overlay con:

- Flecha de direccion segun el primer tramo.
- Destino actual.
- Distancia total y tiempo aproximado.
- Siguiente referencia.
- Proximos pasos de la ruta.
- Voz de Leo al activar y cerrar el modo camara.
- Boton para cerrar.

En celular, la camara requiere HTTPS. Por eso puede no abrir si se entra por una IP local con `http://`. En deploy con HTTPS, el navegador debe pedir permiso correctamente.

Archivo principal:

- `src/app/components/navigation/CameraGuide.tsx`

### 12. Panel administrativo de grafo

El proyecto incluye una pantalla de administracion para revisar el grafo de rutas.

Desde esta pantalla se pueden ver los nodos sobre el mapa y renombrar puntos importantes. Esto ayuda a mejorar instrucciones como "gira hacia Biblioteca" o "continua hasta Entrada a la cancha" en vez de mostrar solo nombres genericos como "Nodo 1".

Archivo principal:

- `src/app/admin/graph/page.tsx`
- `src/app/admin/graph/GraphAdminMap.tsx`

### 13. PWA

Leo incluye configuracion PWA basica:

- Manifest de aplicacion.
- Iconos 192x192 y 512x512.
- Apple touch icon.
- Theme color institucional.
- Service worker basico.

Esto permite instalar la app en dispositivos compatibles despues de desplegarla con HTTPS.

Archivos principales:

- `src/app/manifest.ts`
- `src/app/layout.tsx`
- `src/app/components/PwaRegistration.tsx`
- `public/sw.js`
- `public/icon-192.png`
- `public/icon-512.png`

## Flujo de uso

1. El usuario entra a la app.
2. Ve el splash de Leo.
3. Inicia sesion, se registra o entra como visitante.
4. En Home busca una sede o usa un boton rapido.
5. La app muestra una ruta recomendada.
6. El usuario inicia la ruta.
7. El mapa dibuja el recorrido.
8. Leo da recomendaciones durante la navegacion.
9. El usuario puede abrir la camara guiada como apoyo visual y escuchar la primera indicacion.
10. Opcionalmente, puede guardar horarios y acceder rapido a sus destinos.

## Tecnologias usadas

- Next.js App Router
- React
- TypeScript
- TailwindCSS
- Leaflet
- React Leaflet
- Framer Motion
- Lucide React
- Supabase
- LocalStorage como respaldo
- PWA con manifest y service worker

## Instalacion y ejecucion

Instalar dependencias:

```bash
npm install
```

Ejecutar en desarrollo:

```bash
npm run dev
```

Abrir en navegador:

```text
http://localhost:3000
```

Validar TypeScript:

```bash
npm.cmd exec tsc -- --noEmit
```

Ejecutar lint:

```bash
npm run lint
```

Generar build de produccion:

```bash
npm run build
```

Ejecutar build localmente:

```bash
npm run start
```

## Configuracion de Supabase

Leo puede funcionar de dos formas:

- Sin Supabase: usa `localStorage`, como el MVP inicial.
- Con Supabase: usa usuarios reales y guarda horarios en base de datos.

Para activar Supabase:

1. Crear un proyecto gratuito en Supabase.
2. Ir a Project Settings > API.
3. Copiar:
   - Project URL
   - anon public key
4. Crear un archivo `.env.local` basado en `.env.example`:

```bash
NEXT_PUBLIC_SUPABASE_URL=tu_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_anon_key
```

5. Ejecutar el SQL de:

```text
supabase/schema.sql
```

Ese SQL crea las tablas necesarias para horarios y favoritos, y activa reglas para que cada usuario solo vea sus propios datos.

En Supabase Auth se recomienda desactivar temporalmente la confirmacion obligatoria por correo durante pruebas academicas, para que el usuario pueda registrarse e iniciar sesion inmediatamente.

## Uso en celular durante desarrollo

Para abrir la app desde el celular en la misma red:

```text
http://IP-DE-TU-PC:3000
```

Ejemplo:

```text
http://192.168.1.9:3000
```

El mapa y la navegacion pueden funcionar desde esa direccion. La camara puede no funcionar porque el navegador exige HTTPS para permisos de camara.

## Deploy recomendado

Se recomienda desplegar en Vercel.

Configuracion esperada:

- Framework: Next.js
- Build command: `npm run build`
- Output: automatico

Despues del deploy, la app tendra HTTPS, lo cual mejora:

- Permisos de camara.
- Instalacion como PWA.
- Uso en celular.

## Limitaciones del MVP

Este proyecto es un MVP funcional. Algunas funciones estan simplificadas:

- Algunas funciones tienen respaldo local cuando Supabase no esta configurado.
- La camara guiada es pseudo-AR, no AR real.
- No hay IA avanzada en Leo; usa mensajes controlados.
- No hay posicionamiento indoor.
- El mapa usa Leaflet/OpenStreetMap en vez de Mapbox.
- El grafo depende de los nodos y conexiones definidos manualmente.

## Estado actual

El proyecto incluye las funcionalidades principales del MVP:

- Autenticacion con Supabase y acceso visitante.
- Mapa interactivo.
- Busqueda de destinos.
- Rutas con Dijkstra.
- Navegacion clasica.
- Leo 2D con mensajes, voz y comandos simples.
- Horarios manuales opcionales.
- Favoritos por usuario.
- Camara guiada basica con voz de Leo.
- Panel administrativo de grafo.
- PWA basica.

## Estructura principal

```text
src/
  app/
    page.tsx                 Splash
    login/page.tsx           Login
    register/page.tsx        Registro
    home/page.tsx            Pantalla principal
    schedule/page.tsx        Horarios
    profile/page.tsx         Perfil
    admin/graph/page.tsx     Administracion del grafo
    manifest.ts              Manifest PWA
    components/
      leo/LeoAvatar.tsx
      map/CampusMap.tsx
      navigation/NavigationPanel.tsx
      navigation/CameraGuide.tsx
      ui/SearchBar.tsx
      ui/Header.tsx
  data/
    campusLocations.ts       Destinos visibles
    campusGraph.ts           Nodos y conexiones
  hooks/
    useGeolocation.ts
  utils/
    auth.ts
    dijkstra.ts
    geo.ts
    schedules.ts
public/
  leo-logo.png
  leo-avatar-cutout.png
  icon-192.png
  icon-512.png
  sw.js
```
