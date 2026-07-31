(() => {
  'use strict';

  const STORAGE_KEY = 'algebra-matrices-unit2-v1';
  const DEFAULT_STATE = { completed: {}, lastModule: 'inicio', quizBest: 0 };
  let state = loadState();
  let toastTimer;

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

  const guidedExamples = {
    buildMatrix: {
      title: 'Construcción de una matriz definida por índices',
      source: 'Basado en el ejercicio 1(a) del TP 2',
      statement: String.raw`\[A=(a_{ij})_{3\times3},\qquad a_{ij}=\begin{cases}|j-i|,& i\ge j,\\0,&i\lt j.\end{cases}\]`, 
      steps: [
        { label: 'Interpretar la condición', html: String.raw`Debemos recorrer todas las parejas \((i,j)\) con \(i,j\in\{1,2,3\}\). Sobre la diagonal, donde \(i<j\), la definición asigna directamente cero.` },
        { label: 'Completar la primera fila', html: String.raw`Para \(i=1\): \(a_{11}=|1-1|=0\), mientras que \(a_{12}=a_{13}=0\) porque \(1<2\) y \(1<3\).` },
        { label: 'Completar la segunda fila', html: String.raw`Para \(i=2\): \(a_{21}=|1-2|=1\), \(a_{22}=0\) y \(a_{23}=0\).` },
        { label: 'Completar la tercera fila', html: String.raw`Para \(i=3\): \(a_{31}=|1-3|=2\), \(a_{32}=|2-3|=1\) y \(a_{33}=0\).` },
        { label: 'Clasificar', html: String.raw`\[A=\begin{pmatrix}0&0&0\\1&0&0\\2&1&0\end{pmatrix}.\] Es triangular inferior porque todos los elementos por encima de la diagonal principal son nulos. No es simétrica ni escalar.` }
      ]
    },
    simpleEquation: {
      title: 'Despeje de una ecuación sin matrices inversas',
      source: 'Ejemplo central del apunte teórico',
      statement: String.raw`\[2X+A=B^t.\]`,
      steps: [
        { label: 'Analizar órdenes', html: String.raw`Si \(X\) es de orden \(m\times n\), entonces \(A\) y \(B^t\) deben tener ese mismo orden. Por lo tanto, \(B\) debe ser de orden \(n\times m\).` },
        { label: 'Usar el opuesto', html: String.raw`Sumamos \(-A\) a ambos miembros: \[2X=B^t-A.\]` },
        { label: 'Multiplicar por un escalar', html: String.raw`Multiplicamos ambos miembros por \(\tfrac12\): \[X=\frac12(B^t-A).\]` },
        { label: 'Control', html: 'El despeje no cambia el orden de los factores porque aquí solo intervienen suma de matrices y producto por un escalar.' }
      ]
    },
    inverseEquation: {
      title: 'Despeje de una ecuación con matriz inversa',
      source: 'Basado en el ejercicio 6 del TP 2',
      statement: String.raw`\[AX+B=X.\]`,
      steps: [
        { label: 'Reunir los términos con X', html: String.raw`\[AX-X=-B.\]` },
        { label: 'Escribir la identidad', html: String.raw`Como \(X=IX\), se obtiene \[AX-IX=-B.\]` },
        { label: 'Factorizar por la derecha', html: String.raw`Los dos términos tienen a \(X\) a la derecha: \[(A-I)X=-B.\]` },
        { label: 'Verificar inversibilidad', html: String.raw`Solo podemos continuar si \(A-I\) es inversible, es decir, si \(\det(A-I)\ne0\).` },
        { label: 'Multiplicar por la izquierda', html: String.raw`\[X=(A-I)^{-1}(-B).\] El inverso se coloca a la izquierda porque \(A-I\) multiplica a \(X\) desde la izquierda.` }
      ]
    },
    oilTotal: {
      title: 'Producción total de los tres campos',
      source: 'Ejercicio 5 del TP 2 · cálculo revisado',
      statement: String.raw`\[T=C_1+C_2+C_3.\]`,
      steps: [
        { label: 'Sumar entrada por entrada', html: String.raw`Las tres matrices tienen orden \(3\times3\), por lo que la suma está definida. Cada entrada conserva el mismo significado: mes y producto.` },
        { label: 'Obtener la matriz total mensual', html: String.raw`\[T=\begin{pmatrix}600&560&500\\560&520&490\\630&600&570\end{pmatrix}.\]` },
        { label: 'Totalizar por producto', html: String.raw`Multiplicamos por la matriz fila de unos: \[\begin{pmatrix}1&1&1\end{pmatrix}T=\begin{pmatrix}1790&1680&1560\end{pmatrix}.\]` },
        { label: 'Interpretar', html: 'En los tres campos y durante los tres meses se produjeron 1790 barriles de gasolina, 1680 de diesel y 1560 de kerosene.' },
        { label: 'Revisión de la resolución', html: String.raw`El valor 1119 que aparece en el documento de resolución para el kerosene es una errata: \(500+490+570=1560\).` }
      ]
    },
    operationPossible: {
      title: 'Antes de calcular: decidir si la operación existe',
      source: 'Basado en el ejercicio 3(b) del TP 2',
      statement: String.raw`\[D_{2\times3}\cdot\frac12\,C_{3\times3}.\]`,
      steps: [
        { label: 'El escalar no cambia el orden', html: String.raw`La matriz \(\tfrac12C\) sigue siendo de orden \(3\times3\).` },
        { label: 'Comparar dimensiones internas', html: String.raw`\[D_{2\times3}\left(\frac12C\right)_{3\times3}.\] Las dimensiones internas son \(3\) y \(3\), por lo tanto el producto existe.` },
        { label: 'Predecir el orden', html: String.raw`La matriz resultado toma las filas de \(D\) y las columnas de \(C\): será de orden \(2\times3\).` },
        { label: 'Calcular', html: String.raw`\[D\frac12C=\begin{pmatrix}\frac52&-\frac32&-\frac32\\0&-3&2\end{pmatrix}.\]` }
      ]
    },
    parameterDet: {
      title: 'Determinante con valor absoluto y parámetro',
      source: 'Basado en el ejercicio 10(c) del TP 2',
      statement: String.raw`\[A=\begin{pmatrix}2&1\\|k-2|&k\end{pmatrix},\qquad \det(A)=8.\]`,
      steps: [
        { label: 'Calcular el determinante', html: String.raw`\[\det(A)=2k-|k-2|.\]` },
        { label: 'Plantear la ecuación', html: String.raw`\[2k-|k-2|=8\iff |k-2|=2k-8.\] Además, el miembro derecho debe ser no negativo.` },
        { label: 'Caso k ≥ 2', html: String.raw`Si \(k\ge2\), entonces \(|k-2|=k-2\). Así, \(2k-(k-2)=8\), de donde \(k=6\), que satisface la condición del caso.` },
        { label: 'Caso k < 2', html: String.raw`Si \(k<2\), entonces \(|k-2|=2-k\). La ecuación da \(3k=10\), es decir \(k=\tfrac{10}{3}\), pero ese valor no cumple \(k<2\).` },
        { label: 'Solución', html: String.raw`\[\boxed{k=6}.\]` }
      ]
    },
    matrixSystem: {
      title: 'Sistema de ecuaciones con matrices',
      source: 'Ejercicio 7 del TP 2',
      statement: String.raw`\[\begin{cases}2X-3Y=\begin{pmatrix}-13&4\\12&-5\end{pmatrix},\\X+Y=\begin{pmatrix}6&2\\1&0\end{pmatrix}.\end{cases}\]`,
      steps: [
        { label: 'Despejar una incógnita', html: String.raw`De la segunda ecuación: \[X=\begin{pmatrix}6&2\\1&0\end{pmatrix}-Y.\]` },
        { label: 'Sustituir', html: String.raw`Al sustituir en la primera: \[-5Y=\begin{pmatrix}-25&0\\10&-5\end{pmatrix}.\]` },
        { label: 'Hallar Y', html: String.raw`\[Y=\begin{pmatrix}5&0\\-2&1\end{pmatrix}.\]` },
        { label: 'Hallar X', html: String.raw`\[X=\begin{pmatrix}6&2\\1&0\end{pmatrix}-Y=\begin{pmatrix}1&2\\3&-1\end{pmatrix}.\]` },
        { label: 'Verificar', html: 'Sustituí ambas matrices en las dos ecuaciones originales. La verificación debe hacerse entrada por entrada.' }
      ]
    },
    detPositive: {
      title: 'Determinante como función de un parámetro',
      source: 'Basado en el ejercicio 15 del TP 2',
      statement: String.raw`\[A(t)=\begin{pmatrix}2&t&0\\t&2&1\\3&0&1\end{pmatrix}.\] Estudiar cuándo \(\det A(t)>0\).`,
      steps: [
        { label: 'Calcular el determinante', html: String.raw`Desarrollando por la primera fila: \[\det A(t)=2\begin{vmatrix}2&1\\0&1\end{vmatrix}-t\begin{vmatrix}t&1\\3&1\end{vmatrix}=4-t^2+3t.\]` },
        { label: 'Resolver la inecuación', html: String.raw`\[4-t^2+3t>0\iff t^2-3t-4<0\iff(t-4)(t+1)<0.\]` },
        { label: 'Intervalo de positividad', html: String.raw`La parábola \(t^2-3t-4\) es negativa entre sus raíces: \[\boxed{-1<t<4}.\]` },
        { label: 'Máximo del determinante', html: String.raw`\(\det A(t)=-t^2+3t+4\) alcanza su máximo en \(t=-\frac{b}{2a}=\frac32\).` },
        { label: 'Valor máximo', html: String.raw`\[\det A\!\left(\frac32\right)=-\frac94+\frac92+4=\frac{25}{4}.\]` }
      ]
    }
  };

  const typeCases = [
    { matrix: [[3,0,0],[0,0,0],[0,0,8]], answers: ['diagonal','triangular superior','triangular inferior','simétrica'] },
    { matrix: [[9,0,0],[0,9,0],[0,0,9]], answers: ['diagonal','escalar','triangular superior','triangular inferior','simétrica'] },
    { matrix: [[1,0,0],[0,1,0],[0,0,1]], answers: ['diagonal','escalar','identidad','triangular superior','triangular inferior','simétrica'] },
    { matrix: [[2,-3,6],[0,5,6],[0,0,8]], answers: ['triangular superior'] },
    { matrix: [[4,0,0],[0,1,0],[0,5,9]], answers: ['triangular inferior'] },
    { matrix: [[0,-1,2],[1,0,1],[-2,-1,0]], answers: ['antisimétrica'] }
  ];
  const typeCategories = ['diagonal','escalar','identidad','triangular superior','triangular inferior','simétrica','antisimétrica'];

  const A_PRODUCT = [[2,-1,0],[3,1,4]];
  const B_PRODUCT = [[0,2],[3,4],[-1,0]];
  const C_PRODUCT = multiplyMatrices(A_PRODUCT, B_PRODUCT);

  const oilFields = {
    C1: [[200,180,150],[190,170,160],[210,200,190]],
    C2: [[220,210,190],[200,190,180],[230,220,210]],
    C3: [[180,170,160],[170,160,150],[190,180,170]]
  };
  const months = ['Enero','Febrero','Marzo'];
  const products = ['Gasolina','Diesel','Kerosene'];
  let activeOilField = 'C1';
  let oilQuestionIndex = 0;

  const oilQuestions = [
    { field: 'C1', row: 1, col: 1, prompt: '¿Qué representa la entrada 170 de C₁?', type: 'select', options: ['Gasolina de enero','Diesel de febrero','Kerosene de marzo','Diesel de enero'], answer: 'Diesel de febrero' },
    { field: 'C2', row: 2, col: 0, prompt: '¿Cuántos barriles de gasolina produjo el Campo 2 durante marzo?', type: 'number', answer: 230 },
    { field: 'C3', row: 0, col: 2, prompt: '¿Cuántos barriles de kerosene produjo el Campo 3 durante enero?', type: 'number', answer: 160 },
    { field: 'C1', row: 2, col: 1, prompt: '¿Qué entrada representa el diesel del Campo 1 durante marzo?', type: 'select', options: ['a₁₂','a₂₃','a₃₂','a₃₁'], answer: 'a₃₂' }
  ];

  const orderChallenges = [
    { expression: String.raw`A_{2\times5}C_{5\times4}`, possible: true, result: '2 × 4', explanation: 'Las dimensiones internas son 5 y 5.' },
    { expression: String.raw`A_{2\times5}D_{4\times1}`, possible: false, explanation: 'Las dimensiones internas 5 y 4 no coinciden.' },
    { expression: String.raw`C_{5\times4}I_4`, possible: true, result: '5 × 4', explanation: 'El producto existe y la identidad no modifica a C.' },
    { expression: String.raw`I_4C_{5\times4}`, possible: false, explanation: 'Las dimensiones internas 4 y 5 no coinciden.' },
    { expression: String.raw`B_{1\times3}+D_{2\times3}`, possible: false, explanation: 'La suma exige exactamente el mismo orden.' },
    { expression: String.raw`D_{2\times3}C_{3\times3}`, possible: true, result: '2 × 3', explanation: 'Las dimensiones internas son 3 y 3.' },
    { expression: String.raw`D_{2\times3}^{\,2}`, possible: false, explanation: 'Una potencia de matrices requiere una matriz cuadrada.' }
  ];
  let orderChallengeIndex = 0;

  const inverseSideCases = [
    { statement: String.raw`AX=B`, choices: [String.raw`X=A^{-1}B`, String.raw`X=BA^{-1}`], answer: 0, explanation: 'A multiplica a X desde la izquierda, por eso se multiplica por A⁻¹ desde la izquierda.' },
    { statement: String.raw`XA=B`, choices: [String.raw`X=A^{-1}B`, String.raw`X=BA^{-1}`], answer: 1, explanation: 'A está a la derecha de X, por eso se multiplica por A⁻¹ desde la derecha.' },
    { statement: String.raw`(A-I)X=-B`, choices: [String.raw`X=(A-I)^{-1}(-B)`, String.raw`X=(-B)(A-I)^{-1}`], answer: 0, explanation: 'El factor A−I aparece a la izquierda de X.' },
    { statement: String.raw`X(A+3I)=C`, choices: [String.raw`X=(A+3I)^{-1}C`, String.raw`X=C(A+3I)^{-1}`], answer: 1, explanation: 'El factor A+3I aparece a la derecha de X.' }
  ];

  const propertyQuestions = [
    { prompt: String.raw`Si \(A\) es triangular con diagonal \(2,-1,5\), ¿cómo conviene calcular \(\det(A)\)?`, options: ['Regla de Sarrus','Producto de la diagonal','Sumar todas las entradas'], answer: 1, explanation: String.raw`\(\det(A)=2(-1)5=-10\).` },
    { prompt: String.raw`Si \(\det(A)=3\) y \(A\in M_4(\mathbb R)\), ¿cuánto vale \(\det(2A)\)?`, options: ['6','24','48'], answer: 2, explanation: String.raw`\(\det(2A)=2^4\det(A)=16\cdot3=48\).` },
    { prompt: String.raw`Si dos filas de \(A\) son iguales, entonces:`, options: [String.raw`\(\det(A)=1\)`, String.raw`\(\det(A)=0\)`, 'No se puede saber'], answer: 1, explanation: 'Dos filas iguales hacen nulo el determinante.' },
    { prompt: String.raw`Si \(\det(A)=-2\), entonces \(\det(A^t)\) vale:`, options: ['2','−2','0'], answer: 1, explanation: String.raw`\(\det(A^t)=\det(A)\).` },
    { prompt: String.raw`Conociendo solo \(\det(A)\) y \(\det(B)\), ¿puede calcularse siempre \(\det(A+B)\)?`, options: ['Sí','No'], answer: 1, explanation: 'No hay una propiedad general que permita hacerlo.' }
  ];
  let propertyQuestionIndex = 0;

  const errorCases = [
    { statement: String.raw`De \(AX=B\), un estudiante concluye \(X=BA^{-1}\).`, options: ['El inverso está del lado incorrecto','Falta trasponer B','La conclusión es correcta'], answer: 0, explanation: String.raw`Debe ser \(X=A^{-1}B\).` },
    { statement: String.raw`Un estudiante escribe \(\det(A+B)=\det(A)+\det(B)\).`, options: ['Es una propiedad válida','No existe esa propiedad en general','Solo falta elevar al orden'], answer: 1, explanation: 'El determinante no distribuye sobre la suma.' },
    { statement: String.raw`Para calcular \(AB\), usa columnas de \(A\) por filas de \(B\).`, options: ['Es correcto','Debe usar fila de A por columna de B','Solo sirve para matrices 2×2'], answer: 1, explanation: 'Cada entrada del producto se obtiene con una fila de A y una columna de B.' },
    { statement: String.raw`Después de intercambiar dos filas, conserva el mismo valor del determinante.`, options: ['Correcto','Debe cambiar el signo','Debe multiplicar por el orden'], answer: 1, explanation: 'Un intercambio de dos filas cambia el signo del determinante.' },
    { statement: String.raw`Aplica la Regla de Sarrus a una matriz de orden 4.`, options: ['Es válido','Sarrus solo se aplica a 3×3','Sarrus solo se aplica a 2×2'], answer: 1, explanation: 'Para orden 4 puede usarse desarrollo por cofactores, entre otros métodos.' }
  ];
  let errorCaseIndex = 0;

  const quizBank = [
    { q: String.raw`El orden de una matriz con 3 filas y 5 columnas es:`, options: ['5 × 3','3 × 5','8'], a: 1, e: 'El orden se escribe filas por columnas.' },
    { q: String.raw`Si \(A\in M_{2\times3}\), entonces \(A^t\) tiene orden:`, options: ['2 × 3','3 × 2','2 × 2'], a: 1, e: 'La traspuesta intercambia filas y columnas.' },
    { q: String.raw`¿Cuándo está definida la suma \(A+B\)?`, options: ['Cuando tienen el mismo número de filas','Cuando tienen el mismo orden','Cuando ambas son cuadradas'], a: 1, e: 'La suma se realiza entre entradas correspondientes.' },
    { q: String.raw`El producto \(A_{2\times3}B_{3\times4}\) tiene orden:`, options: ['2 × 4','3 × 3','4 × 2'], a: 0, e: 'Conserva las filas de A y las columnas de B.' },
    { q: String.raw`En general, para matrices:`, options: [String.raw`\(AB=BA\)`, String.raw`\(AB\ne BA\)`, 'Nunca existen ambos productos'], a: 1, e: 'El producto de matrices no es conmutativo.' },
    { q: String.raw`La traza se define para:`, options: ['Toda matriz','Matrices cuadradas','Solo matrices diagonales'], a: 1, e: 'La traza suma los elementos de la diagonal principal.' },
    { q: String.raw`Si \(A=\begin{pmatrix}2&1\\-1&3\end{pmatrix}\), entonces \(\det(A)=\):`, options: ['5','7','−7'], a: 1, e: '2·3−1·(−1)=7.' },
    { q: String.raw`La Regla de Sarrus se aplica a matrices:`, options: ['2 × 2','3 × 3','De cualquier orden'], a: 1, e: 'Sarrus es específica para orden 3.' },
    { q: String.raw`Una matriz cuadrada \(A\) es inversible si y solo si:`, options: [String.raw`\(\det(A)=0\)`, String.raw`\(\det(A)\ne0\)`, String.raw`\(A=A^t\)`], a: 1, e: 'El determinante no nulo caracteriza la inversibilidad.' },
    { q: String.raw`Si \(\det(A)=4\), entonces \(\det(A^t)=\):`, options: ['−4','4','16'], a: 1, e: 'La traspuesta conserva el determinante.' },
    { q: String.raw`Si \(A\in M_3\) y \(\det(A)=2\), entonces \(\det(3A)=\):`, options: ['6','18','54'], a: 2, e: '3³·2=54.' },
    { q: String.raw`Si una matriz tiene una fila nula, su determinante es:`, options: ['0','1','No se puede calcular'], a: 0, e: 'Una fila o columna nula hace nulo el determinante.' },
    { q: String.raw`Si \(\det(A)=2\) y \(\det(B)=-3\), entonces \(\det(AB)=\):`, options: ['−6','−1','5'], a: 0, e: 'det(AB)=det(A)det(B).' },
    { q: String.raw`De \(XA=B\), con \(A\) inversible, se obtiene:`, options: [String.raw`\(X=A^{-1}B\)`, String.raw`\(X=BA^{-1}\)`, String.raw`\(X=AB^{-1}\)`], a: 1, e: 'Se multiplica por A⁻¹ desde la derecha.' },
    { q: String.raw`Una matriz diagonal es siempre:`, options: ['Triangular superior e inferior','Antisimétrica','De determinante cero'], a: 0, e: 'Todos los elementos fuera de la diagonal son cero.' },
    { q: String.raw`¿Cuál de estas expresiones no puede calcularse solo con \(\det(A)\) y \(\det(B)\)?`, options: [String.raw`\(\det(AB)\)`, String.raw`\(\det(A^2)\)`, String.raw`\(\det(A+B)\)`], a: 2, e: 'No existe una propiedad general para el determinante de una suma.' },
    { q: String.raw`Si \(\det(A)=-5\), entonces \(\det(A^{-1})\) es:`, options: ['5','−1/5','1/5'], a: 1, e: 'det(A⁻¹)=1/det(A).' },
    { q: String.raw`Al intercambiar dos filas de una matriz:`, options: ['El determinante no cambia','El determinante cambia de signo','El determinante se duplica'], a: 1, e: 'Un intercambio cambia el signo.' }
  ];
  let currentQuiz = [];

  document.addEventListener('DOMContentLoaded', init);

  function init() {
    setupNavigation();
    setupProgressButtons();
    renderGuidedExamples();
    setupLocator();
    setupTypeClassifier();
    setupMatrixOperations();
    setupOrderChallenge();
    setupProductLab();
    setupInverseSideActivity();
    setupOilLab();
    setupDeterminant2Lab();
    setupSarrusLab();
    setupLaplaceLab();
    setupInverseLab();
    setupPropertyLab();
    setupPropertyQuiz();
    setupErrorDetective();
    setupVideos();
    setupQuiz();
    setupGlobalActions();
    restoreCompletionButtons();
    updateProgress();
    const initial = location.hash.replace('#','') || state.lastModule || 'inicio';
    showModule(document.getElementById(initial) ? initial : 'inicio', false);
    typeset();
  }

  function loadState() {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
      return { ...DEFAULT_STATE, ...(saved || {}), completed: { ...(saved?.completed || {}) } };
    } catch {
      return { ...DEFAULT_STATE };
    }
  }
  function saveState() { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); }
  function typeset(elements) {
    if (!window.MathJax?.typesetPromise) return;
    const targets = elements ? (Array.isArray(elements) ? elements : [elements]) : undefined;
    window.MathJax.typesetPromise(targets).catch(() => {});
  }
  function showToast(message) {
    const toast = $('#toast');
    toast.textContent = message;
    toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('show'), 2600);
  }
  function markCompleted(key, silent = false) {
    if (!state.completed[key]) {
      state.completed[key] = true;
      saveState();
      updateProgress();
      if (!silent) showToast('Progreso guardado en este dispositivo.');
    }
  }

  function setupNavigation() {
    const sidebar = $('#sidebar');
    const menuButton = $('#menuButton');
    $('#moduleNav').addEventListener('click', (event) => {
      const button = event.target.closest('[data-target]');
      if (!button) return;
      showModule(button.dataset.target);
      sidebar.classList.remove('open');
      menuButton.setAttribute('aria-expanded','false');
    });
    $$('[data-go]').forEach(button => button.addEventListener('click', () => showModule(button.dataset.go)));
    menuButton.addEventListener('click', () => {
      const open = sidebar.classList.toggle('open');
      menuButton.setAttribute('aria-expanded', String(open));
    });
    document.addEventListener('click', event => {
      if (window.innerWidth > 820 || !sidebar.classList.contains('open')) return;
      if (sidebar.contains(event.target) || menuButton.contains(event.target)) return;
      sidebar.classList.remove('open');
      menuButton.setAttribute('aria-expanded','false');
    });
    window.addEventListener('hashchange', () => {
      const target = location.hash.replace('#','');
      if (target && document.getElementById(target)) showModule(target, false);
    });
  }
  function showModule(id, updateHash = true) {
    $$('.module').forEach(section => {
      const active = section.id === id;
      section.hidden = !active;
      section.classList.toggle('active', active);
    });
    $$('.nav-item').forEach(button => button.classList.toggle('active', button.dataset.target === id));
    state.lastModule = id;
    saveState();
    if (updateHash) history.pushState(null, '', `#${id}`);
    window.scrollTo({top:0, behavior:'smooth'});
    typeset(document.getElementById(id));
  }

  function setupProgressButtons() {
    $$('[data-complete]').forEach(button => {
      button.addEventListener('click', () => {
        const key = `module:${button.dataset.complete}`;
        const done = !state.completed[key];
        state.completed[key] = done;
        saveState();
        restoreCompletionButtons();
        updateProgress();
      });
    });
  }
  function restoreCompletionButtons() {
    $$('[data-complete]').forEach(button => {
      const done = Boolean(state.completed[`module:${button.dataset.complete}`]);
      button.classList.toggle('done', done);
      button.textContent = done ? '✓ Módulo revisado' : 'Marcar módulo como revisado';
    });
  }
  function updateProgress() {
    const keys = [
      'module:lectura','module:operaciones','module:producto','module:ecuaciones','module:aplicacion','module:determinantes','module:inversa','module:propiedades','module:practica','module:autoevaluacion',
      'activity:locator','activity:types','activity:matrix-ops','activity:order','activity:product','activity:inverse-side','activity:oil','activity:oil-comparison','activity:det2','activity:sarrus','activity:laplace','activity:inverse-lab','activity:inverse-verify','activity:property-lab','activity:property-quiz','activity:error','activity:quiz',
      ...Object.keys(guidedExamples).map(key => `stepper:${key}`)
    ];
    const done = keys.filter(key => state.completed[key]).length;
    const percent = Math.round(done / keys.length * 100);
    $('#progressText').textContent = `${percent}%`;
    $('#progressBar').style.width = `${percent}%`;
    $('#progressDetail').textContent = `${done} de ${keys.length} hitos completados.`;
    $('#bestScore').textContent = `${state.quizBest || 0}/10`;
  }

  function renderGuidedExamples() {
    $$('[data-stepper]').forEach(container => {
      const key = container.dataset.stepper;
      const data = guidedExamples[key];
      if (!data) return;
      container.innerHTML = `
        <div class="stepper-header">
          <div><p class="tag">Ejemplo guiado</p><h3>${data.title}</h3><p>${data.source}</p></div>
          <span class="step-count" aria-live="polite">0 / ${data.steps.length} pasos</span>
        </div>
        <div class="stepper-statement">${data.statement}</div>
        <div class="step-list">${data.steps.map((step,index) => `<div class="step-item" data-step-index="${index}"><h4>Paso ${index+1} · ${step.label}</h4><div>${step.html}</div></div>`).join('')}</div>
        <div class="step-controls">
          <button class="button ghost step-prev" type="button" disabled>Anterior</button>
          <button class="button primary step-next" type="button">Mostrar primer paso</button>
          <button class="button ghost step-reset" type="button">Reiniciar</button>
        </div>`;
      let visible = 0;
      const count = $('.step-count', container);
      const prev = $('.step-prev', container);
      const next = $('.step-next', container);
      const reset = $('.step-reset', container);
      const update = () => {
        $$('.step-item', container).forEach((item,index) => item.classList.toggle('visible', index < visible));
        count.textContent = `${visible} / ${data.steps.length} pasos`;
        prev.disabled = visible === 0;
        next.disabled = visible === data.steps.length;
        next.textContent = visible === 0 ? 'Mostrar primer paso' : visible === data.steps.length - 1 ? 'Mostrar resultado' : 'Mostrar siguiente paso';
        if (visible === data.steps.length) markCompleted(`stepper:${key}`);
        typeset(container);
      };
      next.addEventListener('click', () => { if (visible < data.steps.length) visible++; update(); });
      prev.addEventListener('click', () => { if (visible > 0) visible--; update(); });
      reset.addEventListener('click', () => { visible = 0; update(); });
    });
  }

  function setupLocator() {
    const matrix = $('#locatorMatrix');
    const values = [[2,-1,4,7],[0,3,5,-2],[8,1,6,9]];
    matrix.innerHTML = values.flatMap((row,i) => row.map((value,j) => `<button type="button" role="gridcell" data-row="${i}" data-col="${j}">${value}</button>`)).join('');
    const visited = new Set();
    matrix.addEventListener('click', event => {
      const cell = event.target.closest('button');
      if (!cell) return;
      const r = Number(cell.dataset.row), c = Number(cell.dataset.col);
      $$('button', matrix).forEach(button => {
        const br = Number(button.dataset.row), bc = Number(button.dataset.col);
        button.classList.toggle('row-highlight', br === r);
        button.classList.toggle('col-highlight', bc === c);
        button.classList.toggle('selected', br === r && bc === c);
      });
      visited.add(`${r}-${c}`);
      $('#locatorInfo').innerHTML = String.raw`<p>Seleccionaste la entrada <strong>\(a_{${r+1}${c+1}}=${values[r][c]}\)</strong>.</p><p>Está en la <strong>fila ${r+1}</strong> y la <strong>columna ${c+1}</strong>. La matriz tiene orden \(3\times4\).</p>`;
      if (visited.size >= 3) markCompleted('activity:locator');
      typeset($('#locatorInfo'));
    });
  }

  function setupTypeClassifier() {
    const root = $('#typeClassifier');
    root.innerHTML = typeCases.map((item,index) => `
      <div class="classification-item" data-case="${index}">
        <div class="matrix-grid" style="--cols:${item.matrix[0].length}">${item.matrix.flat().map(v => `<span class="cell">${v}</span>`).join('')}</div>
        <div class="category-options">${typeCategories.map(category => `<label class="check-chip"><input type="checkbox" value="${category}"><span>${capitalize(category)}</span></label>`).join('')}</div>
      </div>`).join('');
    $('#checkTypes').addEventListener('click', () => {
      let correct = 0;
      $$('.classification-item', root).forEach((item,index) => {
        const selected = $$('input:checked', item).map(input => input.value).sort();
        const expected = [...typeCases[index].answers].sort();
        const ok = JSON.stringify(selected) === JSON.stringify(expected);
        item.style.borderColor = ok ? '#8bc9a7' : '#e6a39d';
        item.style.background = ok ? 'var(--green-soft)' : 'var(--red-soft)';
        if (ok) correct++;
      });
      const feedback = $('#typeFeedback');
      feedback.className = `feedback ${correct === typeCases.length ? 'success' : 'info'}`;
      feedback.innerHTML = correct === typeCases.length ? '¡Excelente! Reconociste que una matriz puede pertenecer a varias clases.' : `Clasificaste correctamente ${correct} de ${typeCases.length}. Revisá especialmente las matrices diagonales: también son triangulares y simétricas.`;
      if (correct === typeCases.length) markCompleted('activity:types');
    });
    $('#resetTypes').addEventListener('click', () => {
      $$('input', root).forEach(input => input.checked = false);
      $$('.classification-item', root).forEach(item => { item.removeAttribute('style'); });
      $('#typeFeedback').className = 'feedback';
      $('#typeFeedback').textContent = '';
    });
  }

  function setupMatrixOperations() {
    const initialA = [[1,-2],[3,1]], initialB = [[2,4],[-1,0]];
    renderEditableMatrix($('#matrixAInputs'), initialA, 'a');
    renderEditableMatrix($('#matrixBInputs'), initialB, 'b');
    let operation = 'sum';
    const update = () => {
      const A = readEditableMatrix($('#matrixAInputs'), 2, 2);
      const B = readEditableMatrix($('#matrixBInputs'), 2, 2);
      const k = Number($('#scalarSlider').value);
      $('#scalarValue').textContent = k;
      $('#scalarControl').hidden = operation !== 'scalar';
      let result, explanation;
      if (operation === 'sum') {
        result = addMatrices(A,B);
        explanation = String.raw`Se suman los coeficientes correspondientes: \[A+B=${matrixLatex(result)}.\]`;
      } else if (operation === 'difference') {
        result = addMatrices(A, scaleMatrix(B,-1));
        explanation = String.raw`Se restan los coeficientes correspondientes: \[A-B=${matrixLatex(result)}.\]`;
      } else if (operation === 'scalar') {
        result = scaleMatrix(A,k);
        explanation = String.raw`El escalar multiplica todas los coeficiente de la matris A: \[${k}A=${matrixLatex(result)}.\]`;
      } else {
        result = transpose(A);
        explanation = String.raw`Las filas de \(A\) pasan a ser columnas: \[A^t=${matrixLatex(result)}.\]`;
      }
      $('#matrixOperationOutput').innerHTML = explanation;
      typeset($('#matrixOperationOutput'));
    };
    $$('[data-matrix-op]').forEach(button => button.addEventListener('click', () => {
      operation = button.dataset.matrixOp;
      $$('[data-matrix-op]').forEach(b => b.classList.toggle('active', b === button));
      update();
      markCompleted('activity:matrix-ops');
    }));
    $$('#matrixAInputs input, #matrixBInputs input').forEach(input => input.addEventListener('input', update));
    $('#scalarSlider').addEventListener('input', update);
    update();
  }

  function setupOrderChallenge() {
    orderChallengeIndex = Math.floor(Math.random()*orderChallenges.length);
    const render = () => {
      const q = orderChallenges[orderChallengeIndex];
      $('#orderChallenge').innerHTML = String.raw`<div class="choice-card"><p>¿Está definida la operación \(${q.expression}\)?</p><div class="choice-options"><button type="button" data-answer="true">Se puede</button><button type="button" data-answer="false">No se puede</button></div><div class="feedback"></div></div>`;
      typeset($('#orderChallenge'));
      $$('.choice-options button', $('#orderChallenge')).forEach(button => button.addEventListener('click', () => {
        const answer = button.dataset.answer === 'true';
        const ok = answer === q.possible;
        button.classList.add(ok ? 'correct' : 'wrong');
        const feedback = $('.feedback', $('#orderChallenge'));
        feedback.className = `feedback ${ok ? 'success' : 'error'}`;
        feedback.innerHTML = String.raw`${ok ? 'Correcto.' : 'Revisá los órdenes.'} ${q.explanation}${q.result ? String.raw` El resultado tiene orden \(${q.result}\).` : ''}`;
        if (ok) markCompleted('activity:order');
        typeset(feedback);
      }));
    };
    $('#newOrderChallenge').addEventListener('click', () => { orderChallengeIndex = (orderChallengeIndex+1)%orderChallenges.length; render(); });
    render();
  }

  function setupProductLab() {
    renderStaticMatrix($('#productMatrixA'), A_PRODUCT);
    renderStaticMatrix($('#productMatrixB'), B_PRODUCT);
    const result = $('#productMatrixC');
    result.innerHTML = C_PRODUCT.flatMap((row,i) => row.map((value,j) => String.raw`<button class="cell" type="button" data-row="${i}" data-col="${j}">\(c_{${i+1}${j+1}}\)</button>`)).join('');
    result.addEventListener('click', event => {
      const button = event.target.closest('button');
      if (!button) return;
      const r = Number(button.dataset.row), c = Number(button.dataset.col);
      $$('.cell', $('#productMatrixA')).forEach(cell => cell.classList.toggle('highlight-row', Number(cell.dataset.row) === r));
      $$('.cell', $('#productMatrixB')).forEach(cell => cell.classList.toggle('highlight-col', Number(cell.dataset.col) === c));
      $$('button', result).forEach(cell => cell.classList.toggle('active', cell === button));
      const terms = A_PRODUCT[r].map((value,k) => String.raw`${latexFactor(value)}\cdot${latexFactor(B_PRODUCT[k][c])}`);
      const products = A_PRODUCT[r].map((value,k) => value*B_PRODUCT[k][c]);
      $('#productExplanation').innerHTML = String.raw`\[c_{${r+1}${c+1}}=${terms.join('+')}=${joinSigned(products)}=${formatNumber(C_PRODUCT[r][c])}.\]`;
      markCompleted('activity:product');
      typeset($('#productExplanation'));
    });
    typeset(result);
    $('#checkProductComparison').addEventListener('click', () => {
      const feedback = $('#productComparisonFeedback');
      feedback.className = 'feedback success';
      feedback.innerHTML = 'Demuestra que el producto matricial no es conmutativo: incluso cuando existen ambos productos, pueden tener distinto orden y distintos elementos.';
      markCompleted('activity:product');
    });
  }

  function setupInverseSideActivity() {
    const root = $('#inverseSideActivity');
    root.innerHTML = inverseSideCases.map((item,index) => String.raw`
      <div class="choice-card" data-index="${index}"><p>De \(${item.statement}\), elegí el despeje correcto:</p><div class="choice-options">${item.choices.map((choice,i) => String.raw`<button type="button" data-choice="${i}">\(${choice}\)</button>`).join('')}</div><div class="feedback"></div></div>`).join('');
    let solved = 0;
    $$('.choice-card', root).forEach(card => {
      card.addEventListener('click', event => {
        const button = event.target.closest('button');
        if (!button || card.dataset.solved) return;
        const item = inverseSideCases[Number(card.dataset.index)];
        const ok = Number(button.dataset.choice) === item.answer;
        button.classList.add(ok ? 'correct' : 'wrong');
        const feedback = $('.feedback', card);
        feedback.className = `feedback ${ok ? 'success' : 'error'}`;
        feedback.textContent = item.explanation;
        if (ok) { card.dataset.solved = 'true'; solved++; }
        if (solved === inverseSideCases.length) markCompleted('activity:inverse-side');
      });
    });
    typeset(root);
  }

  function setupOilLab() {
    const tabs = $('#oilTabs');
    tabs.innerHTML = Object.keys(oilFields).map(key => `<button class="chip ${key===activeOilField?'active':''}" data-field="${key}" type="button">Campo ${key.slice(1)}</button>`).join('');
    tabs.addEventListener('click', event => {
      const button = event.target.closest('[data-field]');
      if (!button) return;
      activeOilField = button.dataset.field;
      $$('[data-field]', tabs).forEach(b => b.classList.toggle('active', b === button));
      renderOilTable();
    });
    $('#checkOilAnswer').addEventListener('click', checkOilAnswer);
    $('#nextOilQuestion').addEventListener('click', () => { oilQuestionIndex = (oilQuestionIndex+1)%oilQuestions.length; renderOilQuestion(); });
    $('#revealOilComparison').addEventListener('click', renderOilComparison);
    renderOilTable();
    renderOilQuestion();
  }
  function renderOilTable() {
    const data = oilFields[activeOilField];
    const current = oilQuestions[oilQuestionIndex];
    let html = '<table class="oil-table"><thead><tr><th>Mes</th>'+products.map(p => `<th>${p}</th>`).join('')+'</tr></thead><tbody>';
    data.forEach((row,i) => {
      html += `<tr><th>${months[i]}</th>${row.map((value,j) => `<td class="${current.field===activeOilField&&current.row===i&&current.col===j?'selected-cell':''}">${value}</td>`).join('')}</tr>`;
    });
    html += '</tbody></table>';
    $('#oilTableWrap').innerHTML = html;
  }
  function renderOilQuestion() {
    const q = oilQuestions[oilQuestionIndex];
    activeOilField = q.field;
    $$('[data-field]', $('#oilTabs')).forEach(b => b.classList.toggle('active', b.dataset.field === activeOilField));
    renderOilTable();
    const input = q.type === 'number' ? '<label>Respuesta en barriles<input id="oilAnswerInput" type="number" inputmode="numeric"></label>' : `<label>Elegí una opción<select id="oilAnswerInput"><option value="">Seleccionar…</option>${q.options.map(option => `<option>${option}</option>`).join('')}</select></label>`;
    $('#oilQuestion').innerHTML = `<p><strong>${q.prompt}</strong></p>${input}`;
    $('#oilFeedback').className = 'feedback';
    $('#oilFeedback').textContent = '';
  }
  function checkOilAnswer() {
    const q = oilQuestions[oilQuestionIndex];
    const input = $('#oilAnswerInput');
    const value = q.type === 'number' ? Number(input.value) : input.value;
    const ok = value === q.answer;
    const feedback = $('#oilFeedback');
    feedback.className = `feedback ${ok ? 'success' : 'error'}`;
    feedback.textContent = ok ? 'Correcto. Leíste la fila y la columna adecuadas.' : 'Revisá qué representa la fila y qué representa la columna.';
    if (ok) markCompleted('activity:oil');
  }
  function renderOilComparison() {
    const desired = scaleMatrix(oilFields.C1, 1.1).map(row => row.map(value => Math.round(value*10)/10));
    const diff = addMatrices(oilFields.C2, scaleMatrix(desired,-1));
    const status = value => value > 1e-9 ? ['above','Superó'] : value < -1e-9 ? ['below','No alcanzó'] : ['equal','Alcanzó'];
    let table = '<table class="comparison-table"><thead><tr><th>Mes</th>'+products.map(p => `<th>${p}</th>`).join('')+'</tr></thead><tbody>';
    diff.forEach((row,i) => {
      table += `<tr><th>${months[i]}</th>${row.map(value => { const [cls,label]=status(value); return `<td class="${cls}"><strong>${formatNumber(value)}</strong><br><small>${label}</small></td>`; }).join('')}</tr>`;
    });
    table += '</tbody></table>';
    $('#oilComparison').hidden = false;
    $('#oilComparison').innerHTML = String.raw`
      <div class="formula-panel">\[D_2=1{,}1C_1=${matrixLatex(desired)},\qquad C_2-D_2=${matrixLatex(diff)}.\]</div>
      ${table}
      <p><strong>Conclusión corregida:</strong> en gasolina se alcanzó exactamente la meta en enero y no se alcanzó en febrero ni marzo; en diesel se superó en enero y febrero y se alcanzó exactamente en marzo; en kerosene se superó durante los tres meses.</p>`;
    markCompleted('activity:oil-comparison');
    typeset($('#oilComparison'));
  }

  function setupDeterminant2Lab() {
    renderEditableMatrix($('#det2Inputs'), [[2,1],[-1,3]], 'd');
    const update = () => {
      const M = readEditableMatrix($('#det2Inputs'),2,2);
      const [a,b,c,d] = M.flat();
      const det = a*d-b*c;
      $('#det2Diagram').innerHTML = `<div><p>Diagonal principal: <strong>${a}·${d}=${formatNumber(a*d)}</strong></p><p>Diagonal secundaria: <strong>${b}·${c}=${formatNumber(b*c)}</strong></p></div>`;
      $('#det2Output').innerHTML = String.raw`\[\det(A)=${latexFactor(a)}\cdot${latexFactor(d)}-${latexFactor(b)}\cdot${latexFactor(c)}=${formatNumber(det)}.\]`;
      typeset($('#det2Output'));
    };
    $$('#det2Inputs input').forEach(input => input.addEventListener('input', () => { update(); markCompleted('activity:det2'); }));
    update();
  }

  let sarrusStep = 0;
  const sarrusMatrix = [[1,2,-2],[3,0,1],[-1,1,3]];
  const sarrusPaths = [
    {type:'positive', coords:[[0,0],[1,1],[2,2]], product:0, text:String.raw`1\cdot0\cdot3=0`},
    {type:'positive', coords:[[0,1],[1,2],[2,3]], product:-2, text:String.raw`2\cdot1\cdot(-1)=-2`},
    {type:'positive', coords:[[0,2],[1,3],[2,4]], product:-6, text:String.raw`(-2)\cdot3\cdot1=-6`},
    {type:'negative', coords:[[2,0],[1,1],[0,2]], product:0, text:String.raw`(-1)\cdot0\cdot(-2)=0`},
    {type:'negative', coords:[[2,1],[1,2],[0,3]], product:1, text:String.raw`1\cdot1\cdot1=1`},
    {type:'negative', coords:[[2,2],[1,3],[0,4]], product:18, text:String.raw`3\cdot3\cdot2=18`}
  ];
  function setupSarrusLab() {
    $('#nextSarrusStep').addEventListener('click', () => { if (sarrusStep < sarrusPaths.length) sarrusStep++; renderSarrus(); });
    $('#resetSarrus').addEventListener('click', () => { sarrusStep=0; renderSarrus(); });
    renderSarrus();
  }
  function renderSarrus() {
    const expanded = sarrusMatrix.map(row => [...row,row[0],row[1]]);
    const active = sarrusStep > 0 ? sarrusPaths[sarrusStep-1] : null;
    $('#sarrusBoard').innerHTML = `<div class="sarrus-grid">${expanded.flatMap((row,i) => row.map((value,j) => {
      const cls = [j>=3?'copy':''];
      if (active?.coords.some(([r,c]) => r===i&&c===j)) cls.push(active.type==='positive'?'active-positive':'active-negative');
      return `<span class="cell ${cls.join(' ')}">${value}</span>`;
    })).join('')}</div>`;
    const shown = sarrusPaths.slice(0,sarrusStep);
    const positives = shown.filter(x=>x.type==='positive').map(x=>`(${x.text})`);
    const negatives = shown.filter(x=>x.type==='negative').map(x=>`(${x.text})`);
    let formula = shown.length ? String.raw`\[${positives.join('+') || '0'}${negatives.length ? String.raw`-\left[${negatives.join('+')}\right]` : ''}` : '';
    if (sarrusStep === sarrusPaths.length) formula += String.raw`=-8-19=-27.\]`;
    else if (shown.length) formula += String.raw`.\]`;
    $('#sarrusCalculation').innerHTML = shown.length ? formula : 'Las tres diagonales descendentes se suman y las tres ascendentes se restan.';
    $('#nextSarrusStep').disabled = sarrusStep === sarrusPaths.length;
    $('#nextSarrusStep').textContent = sarrusStep === sarrusPaths.length ? 'Determinante completo' : 'Mostrar siguiente diagonal';
    if (sarrusStep === sarrusPaths.length) markCompleted('activity:sarrus');
    typeset($('#sarrusCalculation'));
  }

  function setupLaplaceLab() {
    const M = [[1,1,2,1],[0,-2,2,1],[0,5,2,-3],[0,2,-2,3]];
    const root = $('#laplaceMatrix');
    root.innerHTML = M.flatMap((row,i) => row.map((value,j) => `<button class="cell" data-row="${i}" data-col="${j}" type="button">${value}</button>`)).join('');
    const controls = $('#laplaceControls');
    controls.innerHTML = `<p><strong>Elegí una línea:</strong></p><div class="choice-options">${[0,1,2,3].map(i => `<button type="button" data-line-type="row" data-line="${i}">Fila ${i+1}</button>`).join('')}</div><div class="choice-options">${[0,1,2,3].map(i => `<button type="button" data-line-type="col" data-line="${i}">Columna ${i+1}</button>`).join('')}</div>`;
    controls.addEventListener('click', event => {
      const button = event.target.closest('[data-line-type]');
      if (!button) return;
      const type = button.dataset.lineType, line = Number(button.dataset.line);
      $$('button.cell', root).forEach(cell => cell.classList.toggle('line-selected', type==='row' ? Number(cell.dataset.row)===line : Number(cell.dataset.col)===line));
      const entries = type==='row' ? M[line].map((value,j)=>({value,i:line,j})) : M.map((row,i)=>({value:row[line],i,j:line}));
      const terms = entries.filter(item=>item.value!==0).map(item => {
        const minor = minorMatrix(M,item.i,item.j);
        const cof = ((item.i+item.j)%2===0?1:-1)*determinant(minor);
        return String.raw`${formatNumber(item.value)}\cdot(${formatNumber(cof)})`;
      });
      const zeros = entries.filter(item=>item.value===0).length;
      const det = determinant(M);
      const recommendation = type==='col'&&line===0 ? 'Elección óptima: hay tres ceros y queda un solo término.' : `Se puede desarrollar por esta línea, pero contiene ${zeros} cero(s). La primera columna es más breve.`;
      $('#laplaceResult').innerHTML = String.raw`<p><strong>${recommendation}</strong></p><div class="formula-panel">\[\det(A)=${terms.join('+').replace(/\+\-/g,'-')}=${formatNumber(det)}.\]</div>${type==='col'&&line===0 ? String.raw`<p>Al eliminar la fila 1 y la columna 1 aparece la submatriz \(${matrixLatex(minorMatrix(M,0,0))}\), cuyo determinante es \(-56\).</p>` : ''}`;
      if (type==='col'&&line===0) markCompleted('activity:laplace');
      typeset($('#laplaceResult'));
    });
  }

  


  const inverseStates = [
  [
    [1, 1, 1, 0],
    [-1, 2, 0, 1]
  ],
  [
    [1, 1, 1, 0],
    [0, 3, 1, 1]
  ],
  [
    [1, 1, 1, 0],
    [0, 1, 1 / 3, 1 / 3]
  ],
  [
    [1, 0, 2 / 3, -1 / 3],
    [0, 1, 1 / 3, 1 / 3]
  ]
];

const inverseOperations = [
  {
    correct: String.raw`F_2\leftarrow F_1+F_2`,
    choices: [
      String.raw`F_2\leftarrow F_1+F_2`,
      String.raw`F_1\leftrightarrow F_2`,
      String.raw`F_2\leftarrow2F_2`
    ]
  },
  {
    correct: String.raw`F_2\leftarrow\frac13F_2`,
    choices: [
      String.raw`F_2\leftarrow\frac13F_2`,
      String.raw`F_1\leftarrow F_1-F_2`,
      String.raw`F_2\leftarrow3F_2`
    ]
  },
  {
    correct: String.raw`F_1\leftarrow F_1-F_2`,
    choices: [
      String.raw`F_1\leftarrow F_1-F_2`,
      String.raw`F_2\leftarrow F_2-F_1`,
      String.raw`F_1\leftarrow F_1+F_2`
    ]
  }
];

let inverseStep = 0;

function setupInverseLab() {
  $('#resetInverseLab').addEventListener('click', () => {
    inverseStep = 0;
    renderInverseLab();
  });

  $('#verifyInverse').addEventListener('click', () => {
    const A = [
      [1, 1],
      [-1, 2]
    ];

    const inv = [
      [2 / 3, -1 / 3],
      [1 / 3, 1 / 3]
    ];

    const product = multiplyMatrices(A, inv);

    $('#inverseVerification').innerHTML = String.raw`
      \[
        ${matrixLatex(A)}
        ${matrixLatex(inv)}
        =
        ${matrixLatex(product)}
        =
        I_2.
      \]
    `;

    markCompleted('activity:inverse-verify');
    typeset($('#inverseVerification'));
  });

  renderInverseLab();
}

function renderInverseLab() {
  const history = $('#inverseAugmented');
  const choices = $('#inverseChoices');
  const feedback = $('#inverseFeedback');

  /*
   * Construye todas las matrices alcanzadas hasta el paso actual.
   */
  history.innerHTML = inverseStates
    .slice(0, inverseStep + 1)
    .map((matrix, index) => {
      const cells = matrix
        .flatMap(row =>
          row.map((value, columnIndex) => `
            <span
              class="augmented-cell ${
                columnIndex === 2 ? 'augmented-divider' : ''
              }"
            >
              ${fractionHtml(value)}
            </span>
          `)
        )
        .join('');

      let transition = '';

      if (index === 0) {
        transition = `
          <p class="inverse-state-label">
            Matriz aumentada inicial
          </p>
        `;
      } else {
        transition = String.raw`
          <div class="inverse-transition">
            <span class="inverse-arrow">↓</span>

            <span class="inverse-operation">
              \(${inverseOperations[index - 1].correct}\)
            </span>

            <span class="inverse-arrow">↓</span>
          </div>
        `;
      }

      return `
        <div class="inverse-state ${index === inverseStep ? 'inverse-state-current' : ''}">
          ${transition}

          <div class="augmented-matrix">
            ${cells}
          </div>
        </div>
      `;
    })
    .join('');

  typeset(history);

  /*
   * Si ya se hicieron las tres operaciones, termina.
   */
  if (inverseStep >= inverseOperations.length) {
    choices.innerHTML = String.raw`
      <div class="callout info">
        <strong>Procedimiento terminado.</strong>

        <p>
          La mitad derecha es
          \[
            A^{-1}
            =
            \begin{pmatrix}
              \frac23 & -\frac13\\
              \frac13 & \frac13
            \end{pmatrix}.
          \]
        </p>
      </div>
    `;

    feedback.className = 'feedback success';
    feedback.textContent =
      'Llegaste a la identidad en el lado izquierdo.';

    markCompleted('activity:inverse-lab');
    typeset(choices);

    return;
  }

  const operation = inverseOperations[inverseStep];

  choices.innerHTML = operation.choices
    .map(choice => String.raw`
      <button
        type="button"
        data-op="${escapeHtml(choice)}"
      >
        \(${choice}\)
      </button>
    `)
    .join('');

  feedback.className = 'feedback';
  feedback.textContent = '';

  choices.onclick = event => {
    const button = event.target.closest('button');

    if (!button) return;

    const isCorrect =
      button.dataset.op === operation.correct;

    feedback.className = `feedback ${
      isCorrect ? 'success' : 'error'
    }`;

    feedback.textContent = isCorrect
      ? 'Operación correcta. Se aplica simultáneamente a ambos lados.'
      : 'Esa operación no acerca la parte izquierda a la identidad. Probá otra.';

    if (!isCorrect) return;

    $$('button', choices).forEach(choiceButton => {
      choiceButton.disabled = true;
    });

    inverseStep++;

    setTimeout(() => {
      renderInverseLab();
    }, 350);
  };

  typeset(choices);
}





  let propertyMatrix = [[1,2,3],[0,2,1],[0,0,4]];
  function setupPropertyLab() {
    $$('[data-property-action]').forEach(button => button.addEventListener('click', () => {
      const base = [[1,2,3],[0,2,1],[0,0,4]];
      const action = button.dataset.propertyAction;
      let message;
      if (action === 'swap') { propertyMatrix = [base[1],base[0],base[2]]; message = 'Al intercambiar dos filas, el determinante cambia de signo: 8 pasa a −8.'; }
      else if (action === 'scale') { propertyMatrix = [base[0].map(v=>2*v),base[1],base[2]]; message = 'Al multiplicar una fila por 2, el determinante también se multiplica por 2: 8 pasa a 16.'; }
      else if (action === 'duplicate') { propertyMatrix = [base[0],[...base[0]],base[2]]; message = 'Dos filas iguales hacen que el determinante sea cero.'; }
      else if (action === 'zero') { propertyMatrix = [base[0],base[1],[0,0,0]]; message = 'Una fila nula hace que el determinante sea cero.'; }
      else { propertyMatrix = base; message = 'Matriz triangular original: el determinante es 1·2·4=8.'; }
      renderPropertyMatrix();
      $('#propertyFeedback').className = 'feedback info';
      $('#propertyFeedback').textContent = message;
      if (action !== 'reset') markCompleted('activity:property-lab');
    }));
    renderPropertyMatrix();
  }
  function renderPropertyMatrix() {
    renderStaticMatrix($('#propertyMatrix'), propertyMatrix);
    $('#propertyDet').textContent = formatNumber(determinant(propertyMatrix));
  }

  function setupPropertyQuiz() {
    propertyQuestionIndex = Math.floor(Math.random()*propertyQuestions.length);
    $('#newPropertyQuestion').addEventListener('click', () => { propertyQuestionIndex=(propertyQuestionIndex+1)%propertyQuestions.length; renderPropertyQuestion(); });
    renderPropertyQuestion();
  }
  function renderPropertyQuestion() {
    const item = propertyQuestions[propertyQuestionIndex];
    $('#propertyQuiz').innerHTML = `<div class="choice-card"><p>${item.prompt}</p><div class="choice-options">${item.options.map((option,i)=>`<button type="button" data-choice="${i}">${option}</button>`).join('')}</div><div class="feedback"></div></div>`;
    const card = $('.choice-card', $('#propertyQuiz'));
    card.addEventListener('click', event => {
      const button = event.target.closest('button');
      if (!button) return;
      const ok = Number(button.dataset.choice) === item.answer;
      button.classList.add(ok?'correct':'wrong');
      const feedback = $('.feedback',card);
      feedback.className = `feedback ${ok?'success':'error'}`;
      feedback.innerHTML = item.explanation;
      if (ok) markCompleted('activity:property-quiz');
      typeset(feedback);
    });
    typeset($('#propertyQuiz'));
  }

  function setupErrorDetective() {
    errorCaseIndex = Math.floor(Math.random()*errorCases.length);
    $('#newErrorCase').addEventListener('click', () => { errorCaseIndex=(errorCaseIndex+1)%errorCases.length; renderErrorCase(); });
    renderErrorCase();
  }
  function renderErrorCase() {
    const item = errorCases[errorCaseIndex];
    $('#errorDetective').innerHTML = `<div class="error-case"><p>${item.statement}</p><div class="error-options">${item.options.map((option,i)=>`<button type="button" data-choice="${i}">${option}</button>`).join('')}</div><div class="feedback"></div></div>`;
    const root = $('#errorDetective');
    root.addEventListener('click', event => {
      const button = event.target.closest('button');
      if (!button) return;
      const ok = Number(button.dataset.choice) === item.answer;
      const feedback = $('.feedback',root);
      feedback.className = `feedback ${ok?'success':'error'}`;
      feedback.innerHTML = `${ok?'Correcto.':'Revisá la propiedad involucrada.'} ${item.explanation}`;
      if (ok) markCompleted('activity:error');
      typeset(feedback);
    }, {once:true});
    typeset(root);
  }

  function setupVideos() {
    $$('.video-card').forEach(card => {
      const button = $('.load-video', card);
      if (!button) return;
      button.addEventListener('click', () => {
        const id = card.dataset.videoId;
        const target = $('.video-placeholder', card);
        target.outerHTML = `<div class="video-frame"><iframe src="https://www.youtube-nocookie.com/embed/${id}?rel=0" title="Video de apoyo" loading="lazy" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe></div>`;
        button.disabled = true;
        button.textContent = 'Video cargado';
      });
    });
  }

  function setupQuiz() {
    $('#gradeQuiz').addEventListener('click', gradeQuiz);
    $('#newQuiz').addEventListener('click', generateQuiz);
    generateQuiz();
  }
  function generateQuiz() {
    currentQuiz = shuffle([...quizBank]).slice(0,10);
    $('#quizQuestions').innerHTML = currentQuiz.map((item,index) => `
      <div class="quiz-question" data-index="${index}"><h4>${index+1}. ${item.q}</h4>${item.options.map((option,i)=>`<label class="quiz-option"><input type="radio" name="quiz-${index}" value="${i}"><span>${option}</span></label>`).join('')}<p class="quiz-explanation" hidden></p></div>`).join('');
    $('#quizResult').innerHTML = '';
    typeset($('#quizQuestions'));
  }
  function gradeQuiz() {
    let score = 0;
    $$('.quiz-question').forEach((question,index) => {
      const selected = $('input:checked',question);
      const item = currentQuiz[index];
      const ok = selected && Number(selected.value) === item.a;
      question.classList.toggle('correct', Boolean(ok));
      question.classList.toggle('incorrect', !ok);
      const explanation = $('.quiz-explanation',question);
      explanation.hidden = false;
      explanation.innerHTML = `${ok?'✓ Correcto.':'✗ Respuesta correcta: '+item.options[item.a]+'.'} ${item.e}`;
      if (ok) score++;
    });
    if (score > (state.quizBest||0)) state.quizBest = score;
    saveState();
    updateProgress();
    const result = $('#quizResult');
    result.className = `quiz-result feedback ${score>=7?'success':'info'}`;
    result.innerHTML = `<strong>Resultado: ${score}/10.</strong> ${score>=8?'Muy buen dominio de la unidad.':score>=6?'Hay una base sólida, pero conviene revisar los errores.':'Volvé a los módulos señalados en cada explicación y generá otra evaluación.'}`;
    if (score>=7) markCompleted('activity:quiz');
    typeset($('#quizQuestions'));
  }

  function setupGlobalActions() {
    $('#printButton').addEventListener('click', () => window.print());
    $('#resetProgressButton').addEventListener('click', () => {
      if (!confirm('¿Querés borrar todo el progreso guardado de esta unidad?')) return;
      localStorage.removeItem(STORAGE_KEY);
      state = {...DEFAULT_STATE, completed:{}};
      restoreCompletionButtons();
      updateProgress();
      showToast('Progreso reiniciado.');
    });
  }

  function renderEditableMatrix(root, matrix, prefix) {
    root.innerHTML = matrix.flatMap((row,i) => row.map((value,j) => `<input type="number" step="any" value="${value}" aria-label="${prefix}${i+1}${j+1}" data-row="${i}" data-col="${j}">`)).join('');
  }
  function readEditableMatrix(root, rows, cols) {
    const result = Array.from({length:rows},()=>Array(cols).fill(0));
    $$('input',root).forEach(input => result[Number(input.dataset.row)][Number(input.dataset.col)] = Number(input.value)||0);
    return result;
  }
  function renderStaticMatrix(root, matrix) {
    root.innerHTML = matrix.flatMap((row,i) => row.map((value,j) => `<span class="cell" data-row="${i}" data-col="${j}">${fractionHtml(value)}</span>`)).join('');
  }
  function addMatrices(A,B) { return A.map((row,i)=>row.map((value,j)=>value+B[i][j])); }
  function scaleMatrix(A,k) { return A.map(row=>row.map(value=>value*k)); }
  function transpose(A) { return A[0].map((_,j)=>A.map(row=>row[j])); }
  function multiplyMatrices(A,B) {
    return A.map(row => B[0].map((_,j) => row.reduce((sum,value,k)=>sum+value*B[k][j],0)));
  }
  function minorMatrix(M,row,col) { return M.filter((_,i)=>i!==row).map(r=>r.filter((_,j)=>j!==col)); }
  function determinant(M) {
    const n=M.length;
    if (n===1) return M[0][0];
    if (n===2) return M[0][0]*M[1][1]-M[0][1]*M[1][0];
    return M[0].reduce((sum,value,j)=>sum+(j%2===0?1:-1)*value*determinant(minorMatrix(M,0,j)),0);
  }
  function matrixLatex(matrix) {
    return String.raw`\begin{pmatrix}${matrix.map(row=>row.map(formatNumber).join('&')).join(String.raw`\\`)}\end{pmatrix}`;
  }
  function formatNumber(value) {
    if (Math.abs(value-Math.round(value))<1e-10) return String(Math.round(value));
    const common = [[1/3,'\\frac13'],[-1/3,'-\\frac13'],[2/3,'\\frac23'],[-2/3,'-\\frac23'],[1/2,'\\frac12'],[-1/2,'-\\frac12'],[3/2,'\\frac32'],[-3/2,'-\\frac32']];
    const hit=common.find(([n])=>Math.abs(value-n)<1e-10);
    return hit?hit[1]:String(Math.round(value*100)/100).replace('.',',');
  }
  function fractionHtml(value) {
    const map = new Map([[1/3,'⅓'],[-1/3,'−⅓'],[2/3,'⅔'],[-2/3,'−⅔'],[1/2,'½'],[-1/2,'−½']]);
    for (const [num,text] of map) if (Math.abs(value-num)<1e-10) return text;
    return String(Math.round(value*100)/100).replace('.',',');
  }
  function latexFactor(value) { return value < 0 ? `(${formatNumber(value)})` : formatNumber(value); }
  function joinSigned(values) { return values.map((value,index) => `${index > 0 && value >= 0 ? '+' : ''}${formatNumber(value)}`).join(''); }
  function capitalize(text) { return text.charAt(0).toUpperCase()+text.slice(1); }
  function shuffle(array) { for(let i=array.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[array[i],array[j]]=[array[j],array[i]];} return array; }
  function escapeHtml(text) { return text.replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }
})();
