# Leo - Plataforma Inteligente de Navegacion Universitaria

Leo es una aplicacion web para orientar a estudiantes y visitantes dentro de sedes de la Universidad de Pamplona. La app permite buscar destinos, calcular rutas sobre un grafo de nodos reales, mostrar instrucciones de navegacion, guardar horarios opcionales y usar una camara guiada basica tipo pseudo-AR.

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
- Horarios manuales opcionales guardados en el navegador.
- Edicion y eliminacion de horarios.
- Favoritos de destinos por usuario.
- Camara guiada basica con overlay visual.
- PWA basica con manifest, iconos y service worker.
- Responsive para uso en celular.

## Como funciona

### 1. Autenticacion

La autenticacion del MVP funciona en el navegador usando `localStorage`.

Cuando un usuario se registra, la app guarda sus datos localmente bajo la clave `leo.users`. Luego lo redirige al login con un mensaje de confirmacion.

Cuando inicia sesion, la app valida el correo y la contrasena contra los usuarios guardados localmente. Si son correctos, crea una sesion en `localStorage` bajo la clave `leo.session`.

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

Los horarios se guardan en `localStorage` bajo la clave `leo.schedules`. Desde cada horario se puede abrir el mapa con el destino seleccionado.
Tambien se pueden editar o eliminar desde la misma pantalla.

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

- Flecha de direccion.
- Destino actual.
- Siguiente tramo aproximado.
- Mensaje de apoyo.
- Boton para cerrar.

En celular, la camara requiere HTTPS. Por eso puede no abrir si se entra por una IP local con `http://`. En deploy con HTTPS, el navegador debe pedir permiso correctamente.

Archivo principal:

- `src/app/components/navigation/CameraGuide.tsx`

### 12. PWA

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
9. El usuario puede abrir la camara guiada como apoyo visual.
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
- LocalStorage
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

Ese SQL crea la tabla `schedules` y activa reglas para que cada usuario solo vea sus propios horarios.
Tambien crea la tabla `favorites`, que permite guardar sedes favoritas por usuario.

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

- La autenticacion usa `localStorage`, no backend real.
- Los horarios se guardan localmente, no se sincronizan entre dispositivos.
- La camara guiada es pseudo-AR, no AR real.
- No hay IA avanzada en Leo; usa mensajes controlados.
- No hay posicionamiento indoor.
- El mapa usa Leaflet/OpenStreetMap en vez de Mapbox.
- El grafo depende de los nodos y conexiones definidos manualmente.

## Estado actual

El proyecto incluye las funcionalidades principales del MVP:

- Autenticacion basica.
- Mapa interactivo.
- Busqueda de destinos.
- Rutas con Dijkstra.
- Navegacion clasica.
- Leo 2D con mensajes.
- Horarios manuales.
- Camara guiada basica.
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
