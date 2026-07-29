# Unidad 2 · Matrices y Determinantes

Proyecto web estático para **Álgebra y Geometría I – Ingeniería en Petróleo**. Reorganiza la teoría, el Trabajo Práctico 2, su resolución y las presentaciones de clase como una unidad interactiva pensada para GitHub Pages.

## Contenidos

- Lectura, orden e índices de una matriz.
- Matrices especiales, diagonal principal y traza.
- Suma, resta, producto por escalar y traspuesta.
- Producto de matrices con visualización fila por columna.
- Ecuaciones matriciales y análisis de órdenes.
- Aplicación a producción petrolera.
- Determinantes de orden 2 y 3, Regla de Sarrus y desarrollo de Laplace.
- Matriz inversa por operaciones elementales.
- Propiedades del determinante.
- Ejercicios guiados, detección de errores y autoevaluación aleatoria.

Las expresiones matemáticas se muestran con **MathJax**. El progreso se guarda en el navegador mediante `localStorage`.

## Estructura

```text
unidad-2-matrices-determinantes-github/
├── index.html
├── styles.css
├── app.js
├── README.md
├── .nojekyll
├── assets/
│   └── favicon.svg
├── materiales/
│   ├── teoria-matrices-determinantes.pdf
│   ├── tp-2-matrices-determinantes.pdf
│   ├── resolucion-tp-2.pdf
│   ├── resumen-y-ejemplos.pdf
│   ├── propiedades-determinantes.pdf
│   └── archivos fuente .tex
└── presentaciones/
    └── cinco presentaciones .ppsx
```

## Publicar en GitHub Pages

1. Crear un repositorio nuevo en GitHub.
2. Subir **el contenido de esta carpeta** a la raíz del repositorio.
3. Abrir `Settings` → `Pages`.
4. En `Build and deployment`, elegir `Deploy from a branch`.
5. Seleccionar la rama `main` y la carpeta `/ (root)`.
6. Guardar y esperar a que GitHub muestre la dirección publicada.

No se necesita `package.json`, Node.js ni servidor.

## Probar localmente

Desde la carpeta del proyecto:

```bash
python3 -m http.server 8000
```

Luego abrir `http://localhost:8000`.

## Revisión de los materiales

La página conserva el enfoque y la terminología de los documentos de la cátedra. En el ejercicio contextual de producción petrolera se señalan y corrigen estas inconsistencias numéricas de la resolución:

- La suma total de kerosene es `1560`, no `1119`.
- La matriz correcta para la meta del Campo 2 es
  `1,1 C1 = [[220,198,165],[209,187,176],[231,220,209]]`.
- La comparación correcta es
  `C2 - 1,1 C1 = [[0,12,25],[-9,3,4],[-1,0,1]]`.

También se evita reproducir como regla general cualquier igualdad del tipo `det(A+B)=det(A)+det(B)`, porque esa propiedad no existe en general.

## Edición rápida

- Colores y diseño: variables al comienzo de `styles.css`.
- Ejemplos guiados y preguntas: objetos al comienzo de `app.js`.
- Videos: atributo `data-video-id` de cada tarjeta en `index.html`.
- Textos y estructura de la unidad: `index.html`.
