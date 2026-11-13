# Bitácora — Papoi

App de puntos en equipo: competís con amigos durante la semana y el domingo hay ganador.

**Última actualización:** 12/11/2026

---

## 1. Estado del proyecto

| | |
|---|---|
| Proyecto | `papoi` |
| Ruta | `/home/leo/Projects/papoi` |
| Ionic | 9.0.10 |
| Angular | 22.2.3 (standalone) |
| TypeScript | 6.0.3 |
| Node | 26.13.0 |
| Tests | Vitest 5.0.5 (`@angular/build:unit-test`) |
| Backend elegido | Supabase (todavía no conectado) |

**Qué funciona hoy:** el motor de puntos, con tests verdes. Nada visual todavía.

**Qué no existe todavía:** login, base de datos, pantallas, duelos.

---

## 2. La idea, aterrizada

Una liga semanal de entrenamiento entre amigos, donde cada serie registrada se convierte en puntos comparables entre ejercicios distintos, y al final de la semana hay un ganador.

**La rebanada mínima (MVP):** dos cuentas, un duelo de 7 días, tres ejercicios, y se ve quién ganó. Nada más que eso.

### Las 3 piezas que son el producto

1. **Motor de puntos** — TypeScript puro. Recibe series, devuelve puntos.
2. **Registro de entrenamiento** — elegir ejercicio, cargar series, guardar.
3. **Duelo** — crear con código, unirse, marcador.

---

## 3. Decisiones tomadas

- **Gym** (barra y mancuernas), no casa.
- **Peso corporal obligatorio** en el perfil: es lo que permite comparar personas de distinto tamaño.
- **Español fijo**, sin sistema de traducciones.
- **Sin librería de animaciones**: Ionic ya trae lo necesario y la prioridad es que sea veloz.
- **Tema oscuro fijo** (decisión visual pendiente de aplicar).
- **Backend Supabase** (Postgres + Auth + RLS). El leaderboard es una consulta SQL, no una tabla.

### Lo que NO se hace en la v1

Rutinas guardadas, logros, podio mensual, import de Apple Health / Google Fit, video de prueba, ejercicios personalizados, grupos de más de 2, notificaciones push, i18n, temas.

---

## 4. Sistema de puntos

### Fórmula (v2 — por esfuerzo)

```
puntos de una serie = unidades × coef del ejercicio × factor de esfuerzo

factor de esfuerzo: suave 0.8 · normal 1.0 · duro 1.25
```

- `unidades` = reps, segundos o metros, según el ejercicio.
- `coef` = cuánto vale una unidad de ese ejercicio.
- `esfuerzo` = 3 botones en pantalla, un solo toque.

**Por qué se cambió de la v1:** la v1 calculaba la carga relativa al peso corporal
(`1 + 0.5 × kg / peso`). Obligaba a conocer el peso de la barra y a tocar `+2.5`
dieciséis veces para cargar 40 kg. Además exigía una pantalla de perfil con peso
corporal antes de poder puntuar. La v2 reemplaza eso por un nivel de esfuerzo:
misma idea (más esfuerzo = más puntos), un toque, y desaparece un dato obligatorio.

### Coeficientes del catálogo

| Ejercicio | Unidad | Coef |
|---|---|---|
| Sentadilla | rep | 1.0 |
| Estocadas | rep | 0.9 |
| Peso muerto | rep | 1.4 |
| Flexiones | rep | 1.2 |
| Press banca | rep | 0.8 |
| Fondos | rep | 1.5 |
| Dominadas | rep | 2.5 |
| Remo | rep | 1.0 |
| Curl de bíceps | rep | 0.8 |
| Plancha | seg | 0.33 |
| Abdominales | rep | 0.8 |
| Correr | m | 0.08 |

### Topes (anti-abuso)

- **Por ejercicio:** los primeros 150 puntos valen 100%; el excedente vale 40%. Ejemplo: 300 sentadillas = 210 puntos, no 300.
- **Por día:** máximo 400 puntos.
- **Orden importa:** primero el tope por ejercicio, después el tope diario.

### Ejemplos

Mismas 10 sentadillas, distinto esfuerzo:

- suave → `10 × 1.0 × 0.8` = **8 puntos**
- normal → `10 × 1.0 × 1.0` = **10 puntos**
- duro → `10 × 1.0 × 1.25` = **12.5 → 13 puntos**

Ejercicios distintos, mismo esfuerzo:

- 30 segundos de plancha normal → `30 × 0.33 × 1` = **10 puntos**
- 24 dominadas normales → `24 × 2.5 × 1` = **60 puntos**
- 5 km corriendo normal → `5000 × 0.08 × 1` = **400 → 250 puntos** (por el tope por ejercicio)

Comparables entre sí, sin cargar el peso de la barra. Ese es el trabajo real del producto.

---

## 5. Archivos creados

```
src/app/domain/
├── points.ts        el motor: tipos, catálogo y fórmulas
└── points.spec.ts   6 tests que verifican la fórmula
```

### Qué hace cada función de `points.ts`

| Función | Para qué sirve |
|---|---|
| `unitsOf` | Traduce la serie a un número (reps, segundos o metros). |
| `loadFactor` | Cuánto suma la barra, relativo a tu peso corporal. |
| `scoreSet` | Puntos de una sola serie. |
| `scoreDay` | Puntos del día aplicando los dos topes. |

Las cuatro son funciones puras: reciben datos, devuelven un número, no tocan nada externo. Se pueden testear en 2 segundos y reutilizar después en una función de Supabase.

---

## 6. Comandos usados

| Comando | Para qué |
|---|---|
| `npm start` | Levanta la app en `http://localhost:4200` con recarga automática. |
| `npm run test:unit` | Corre todos los tests una vez y sale. |
| `ng g @ionic/angular-toolkit:page nombre` | Genera una página standalone nueva. |
| `npx tsc -p tsconfig.json --noEmit` | Chequea tipos sin compilar (lo que hace el editor por debajo). |

**Regla:** `npm start` ocupa una terminal. Los tests van en otra (`Ctrl+Shift+Ñ`).

---

## 7. Errores encontrados

### 7.1 `points.ts` vacío → `TS2306: File 'points.ts' is not a module`

**Causa:** el archivo estaba en 0 bytes. Los tests intentaban importar de un archivo sin contenido.
**Arreglo:** pegar el contenido y guardar. Verificar que no quede el punto de "sin guardar" en la pestaña.

### 7.2 18 errores rojos en el editor: `Cannot find name 'describe'`

**Causa:** el `tsconfig.json` de la raíz no declara `types`, así que el editor compila los `.spec.ts` sin conocer las funciones del runner (`describe`, `it`, `expect`). Ya venía roto desde el starter.
**Arreglo:** agregar en `tsconfig.json`:

```json
"types": ["vitest/globals", "node"],
```

Después: `Ctrl+Shift+P` → `Restart TS Server`. Bajó a 0 errores.

### 7.3 `ionic serve` → `Invalid project type: angular-standalone`

**Causa:** el CLI global de Ionic es 7.2.1 (la última publicada) y no conoce el tipo de proyecto `angular-standalone` que usa el starter de Ionic 9.
**Arreglo:** usar `npm start` (hace lo mismo), o cambiar una palabra en `ionic.config.json`:

```json
"type": "angular"
```

No cambia el funcionamiento: el generador de páginas sigue creando standalone porque está configurado en `angular.json`.

### 7.4 `app.component.spec.ts` → esperaba 12 items, encontró 15

**Causa:** el test del menú del starter quedó viejo. Se le agregaron las páginas Rutinas, Ejercicios y Progreso: 9 páginas + 6 títulos de sección = 15.
**Arreglo:** actualizar tres números en el spec (15 labels, 15 items, 9 links). Ese archivo desaparece cuando se reemplace el menú lateral por tabs.

---

## 8. Conceptos aprendidos

- **Standalone components:** en Ionic 9 los componentes se importan de `@ionic/angular` directamente. Ya no existe `@ionic/angular/standalone`.
- **Zoneless:** Angular 22 corre sin Zone.js. No detecta cambios "solo". Si actualizás un valor desde un `await`, un `setTimeout` o un evento de Ionic, la pantalla no se redibuja.
- **Signals:** la solución a lo anterior. Todo el estado de vista va en `signal()`, no en campos sueltos.
- **OnPush:** Angular 22 lo pone por defecto. Refuerza lo mismo: avisale vos cuándo cambió el estado.
- **Función pura:** no toca nada de afuera. Fácil de testear, fácil de reutilizar.
- **Archivo `.spec.ts`:** solo lo usa el runner de tests. No se incluye en la app final.
- **`??` vs `||`:** `||` atrapa `undefined`, `null`, `0` y `""`. `??` solo `undefined` y `null`. Con números, `||` alcanza.

---

## 9. Roadmap

1. ✅ Motor de puntos + tests
2. ✅ Tema visual (violeta pastel, Inter, oscuro fijo)
3. ✅ Pantalla de registro (local, por esfuerzo, sin base de datos)
4. ⬜ Supabase: schema, auth, perfiles
5. ✅ Guardar en la nube y ver el historial en Progreso
6. ⬜ Duelos: crear con código, unirse, marcador
7. ✅ Tabs (Entrenar y Progreso)
8. ✅ Progreso: historial y puntos de la semana
9. 🔶 GPS para correr (funciona en navegador), falta build nativo
10. ⬜ Build Android con Capacitor

---

## 10. Pendientes técnicos

- [ ] Limpiar `.browserslistrc` (el build tira un aviso de navegadores no soportados).
- [ ] 4 errores de tipos en `playwright.config.ts` (`process.env.CI` con `noPropertyAccessFromIndexSignature`).
- [ ] Borrar la página `folder` y el menú lateral cuando entren las tabs.

---

## 11. Base de datos (Supabase)

Proyecto: `dcfgygstljkdyfhlbkiu` · PostgreSQL 17.11

### 11.1 · Tablas

| Tabla | Qué guarda | Clave |
|---|---|---|
| `profiles` | Perfil del jugador: username, avatar | `id` → `auth.users` |
| `exercises` | Catálogo: nombre, unidad, coeficiente | `id` text (`squat`, `plank`…) |
| `sesiones` | Un entrenamiento: quién, qué día, puntos | `id` uuid |
| `series` | Cada serie de ese entrenamiento | `sesion_id` + `ejercicio_id` |

**Detalle importante:** `series` guarda `coef_aplicado` además de `puntos`. Si mañana
cambiás el coeficiente de dominadas de 2.5 a 2.2, los entrenamientos viejos **no se
recalculan**: la historia queda congelada con las reglas del día que se jugó.

### 11.2 · Automatismos

- **Trigger `on_auth_user_created`**: cuando alguien se registra (aunque sea anónimo),
  se crea su fila en `profiles` con username `atleta_` + 8 caracteres.
- **`user_id` con `default auth.uid()`**: la base completa el dueño sola; el cliente no
  puede mentir sobre quién es.
- **Trigger `profiles_updated_at`**: actualiza la fecha de modificación sola.
- **Constraints**: `esfuerzo` solo acepta `suave|normal|duro`, `cantidad > 0`,
  `puntos >= 0`, `coef > 0`. La base rechaza datos basura sin depender del cliente.

### 11.3 · Seguridad (RLS)

Row Level Security activo en las 4 tablas. Cada usuario:

- ve y borra **solo sus** sesiones,
- ve e inserta series **solo de sus** sesiones (con `exists`),
- ve el catálogo completo (es público, no tiene datos personales),
- ve los perfiles de todos (necesario para el marcador) y edita el suyo.

La `anon key` es pública y **no** importa: sin políticas, esa clave no lee nada.

### 11.4 · Vista para Progreso

```sql
create view public.v_puntos_por_dia as
select user_id, fecha, sum(puntos) as puntos, count(*) as sesiones
from public.sesiones group by user_id, fecha;
```

Con `security_invoker = true`, así respeta el RLS de quien consulta.

### 11.5 · Verificación hecha (no es teoría)

Se probó de punta a punta con la API real:

- Login anónimo → **200** (se habilitó `external_anonymous_users_enabled` por API).
- Insertar sesión → **201**; insertar serie → **201**.
- Leer `v_puntos_por_dia` → devolvió la fila correcta.
- Insertar una serie en una sesión ajena → **403** (RLS funciona).
- Insertar `esfuerzo: "brutal"` → **400** (constraint funciona).
- Datos de prueba borrados; la base quedó con 0 usuarios y 0 sesiones.

## 12. Código explicado (referencia)

**Convención del proyecto:** el código del chat va **limpio, sin comentarios**. Las
explicaciones línea por línea viven acá, en el reporte.

### 12.1 · La pantalla Entrenar, de arriba hacia abajo

Se lee en 3 zonas: `ion-header` (barra fija de arriba), `ion-content` (lo que scrollea)
y `ion-footer` (panel que aparece abajo al elegir un ejercicio).

```html
<ion-header [translucent]="true">
  <!-- Los corchetes [ ] significan "esto es una propiedad booleana, no texto".
       translucent = el header se vuelve semitransparente y el contenido pasa por debajo. -->
  <ion-toolbar>
    <ion-title>Entrenar</ion-title>
  </ion-toolbar>
</ion-header>

<ion-content [fullscreen]="true">
  <!-- fullscreen = el contenido se extiende detrás del header y de la barra de estado. -->

  <div class="total-card">
    <p class="total-label">Puntos de hoy</p>
    <h1 class="total-numero puntos">{{ entreno.total() }}</h1>
    <!-- {{ }} imprime un valor.
         total es un computed: una cuenta que se rehace sola cuando cambian las series.
         Los paréntesis son obligatorios; sin ellos se muestra la función, no el número. -->
  </div>

  @if (entreno.series().length > 0) {
    <!-- @if = si se cumple la condición, dibujá el bloque; si no, no existe. -->
    <h2 class="seccion">Series de hoy</h2>

    <ion-list>
      @for (serie of entreno.series(); track $index) {
        <!-- @for repite por cada elemento. track $index usa la posición como identidad.
             @for EXIGE track; si falta, Angular tira error. -->
        <ion-item>
          <ion-label>
            <h2>{{ serie.exercise.name }}</h2>
            <!-- exercise es el objeto completo del catálogo, no solo el id. -->
            <p>{{ entreno.resumen(serie) }}</p>
          </ion-label>

          <ion-button slot="end" fill="clear" color="danger" (click)="entreno.borrar($index)">
            <!-- slot="end" = al final de la fila. fill="clear" = sin fondo.
                 (click) = evento: ejecuta al tocar (no ahora).
                 $index = posición de la fila, para saber cuál borrar. -->
            Borrar
          </ion-button>
        </ion-item>
      }
    </ion-list>
  }

  <h2 class="seccion">Elegí un ejercicio</h2>

  <ion-list>
    @for (ejercicio of ejercicios; track ejercicio.id) {
      <!-- Igual que el @for de arriba, pero "ejercicios" es una propiedad común
           (sin paréntesis) y el track usa el id, que es más estable que el índice. -->
      <ion-item button (click)="entreno.elegir(ejercicio)">
        <!-- button = fila tappable con efecto al presionar. -->
        <ion-label>
          <h2>{{ ejercicio.name }}</h2>
          <p>{{ ejercicio.coef }} punto por {{ entreno.unidad(ejercicio.unit) }}</p>
        </ion-label>
      </ion-item>
    }
  </ion-list>
</ion-content>

@if (entreno.seleccionado(); as ejercicio) {
  <!-- "as ejercicio" guarda el valor en una variable para usarla adentro,
       sin repetir la llamada cinco veces. Si es null, el bloque no existe. -->
  <ion-footer>
    <!-- Se pega al fondo, arriba de la tab bar. No scrollea. -->
    <div class="panel">
      <div class="panel-top">
        <strong>{{ ejercicio.name }}</strong>
        <ion-button fill="clear" size="small" (click)="entreno.cerrar()">✕</ion-button>
      </div>

      <div class="stepper">
        <ion-button fill="outline" (click)="entreno.ajustar(-entreno.paso())">−</ion-button>
        <!-- -entreno.paso() = restar el paso. paso() vale 5, 15 o 100 según el ejercicio. -->
        <span class="stepper-valor puntos">{{ entreno.cantidad() }}</span>
        <ion-button fill="outline" (click)="entreno.ajustar(entreno.paso())">+</ion-button>
      </div>

      <div class="esfuerzos">
        @for (nivel of entreno.niveles; track nivel) {
          <ion-button
            [fill]="entreno.esfuerzo() === nivel ? 'solid' : 'outline'"
            (click)="entreno.esforzar(nivel)"
          >
            <!-- [fill] es una propiedad DINÁMICA: se recalcula y cambia sola.
                 El nivel elegido queda relleno y los otros con borde. -->
            {{ entreno.etiquetas[nivel] }}
          </ion-button>
        }
      </div>

      <ion-button expand="block" (click)="entreno.agregar()">
        Agregar · {{ entreno.puntosDeLaSerie() }} pts
      </ion-button>
    </div>
  </ion-footer>
}
```

### 12.2 · Tabla de símbolos

| Símbolo | Significado |
|---|---|
| `{{ x }}` | Mostrá el valor de `x` |
| `[prop]="x"` | Pasale el valor de `x` a una propiedad |
| `(evento)="f()"` | Cuando ocurra el evento, ejecutá `f()` |
| `@if (cond) { }` | Si se cumple, dibujá |
| `@if (x; as y) { }` | Si hay valor, guardalo en `y` y dibujá |
| `@for (a of b; track c) { }` | Repetí por cada elemento |
| `$index` | El número de vuelta dentro de `@for` |
| `slot="end"` | Ubicá este elemento al final de la fila |
| `x()` | Abrí el signal y dame el valor |
| `x` (sin paréntesis) | Es el signal en sí, o una propiedad común |

**Regla que evita el 80% de los bugs:** si es `signal` o `computed`, va con paréntesis.
Si es una propiedad común (`ejercicios`) o el nombre de un `@for` (`serie`, `ejercicio`),
va sin paréntesis.

### 12.3 · Los cuatro conceptos

- **`signal`** — una caja con un valor que avisa cuando cambia. `cantidad()` lo lee,
  `cantidad.set(20)` lo cambia.
- **`computed`** — una cuenta que se rehace sola. No guarda nada, por eso nunca queda
  desactualizada.
- **servicio (`@Injectable`)** — la clase que guarda las cajas y las acciones. Una sola
  instancia para toda la app, por eso las series sobreviven al cambio de tab.
- **componente** — solo muestra. No calcula nada.

### 12.4 · Por qué zoneless obliga a usar signals

Angular 22 corre sin Zone.js: si cambiás un campo común desde un callback asíncrono,
la pantalla **no se redibuja**. El signal es lo que le avisa a Angular que actualice.
No es una preferencia de estilo, es un requisito técnico de esta versión.

### 12.5 · Modo carrera (GPS)

Correr no usa la barra: usa dos botones y tres datos en vivo.

```html
@if (ejercicio.unit === 'm') {
  <div class="carrera">
    <p class="carrera-metros">{{ entreno.metrosRedondos() }} m</p>
    <p class="carrera-linea">{{ entreno.tiempo() }} · {{ entreno.ritmoTexto() }}</p>

    @if (entreno.grabando()) {
      <ion-button expand="block" color="danger" (click)="entreno.terminarCarrera()">
        Terminar
      </ion-button>
    } @else {
      <ion-button expand="block" (click)="entreno.empezarCarrera()">
        Empezar a correr
      </ion-button>
    }
  </div>
}
```

**Cómo funciona por dentro:**

1. `empezarCarrera()` pide permiso de ubicación y abre un *watch* de GPS.
2. Cada posición se compara con la anterior y `distanciaMetros()` (fórmula de haversine)
   suma la diferencia.
3. Un `setInterval` de un segundo actualiza el cronómetro.
4. Al terminar, el ritmo (`segundos / km`) decide el esfuerzo solo:
   menos de 5:30 min/km → duro · de 5:30 a 7:00 → normal · más de 7:00 → suave.
5. La serie se agrega automáticamente. No existe botón "Agregar" en correr.

**Filtros anti-ruido:** se descartan posiciones con precisión peor a 35 m y saltos
menores a 3 m. Quieto, el GPS "tiembla" y sumaría metros falsos.

**Por qué GPS y no podómetro:** el motor ya mide correr en metros y el GPS entrega
metros. Con pasos habría que inventar una conversión paso→metro, y no existe plugin
oficial de podómetro en Capacitor.

**Estado:** funciona en el navegador (geolocalización web). En el celular necesita
permisos en el `AndroidManifest`, que se agregan al crear el proyecto Android.

### 12.6 · Flujo guardar → Progreso

```ts
async guardar(): Promise<void> {
  const guardado = await this.entreno.guardar();

  if (guardado) {
    await this.router.navigate(['/tabs/progreso']);
  }
}
```

El servicio devuelve `true` o `false`, nunca navega: guardar y navegar son
responsabilidades distintas. La pantalla decide qué hacer con el resultado.

**Progreso** consulta `sesiones` ordenadas por fecha y calcula los puntos de la semana
con un `computed` (últimos 7 días). Se recarga en `ionViewWillEnter`, el hook de Ionic
que corre cada vez que se entra a la pestaña, no solo la primera vez.

## 13. Cómo mantener esta bitácora

Se actualiza al cerrar cada bloque de trabajo. En Notion: **Import → Markdown**, y queda armado con títulos, tablas y bloques de código.
