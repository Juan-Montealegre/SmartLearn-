// Datos de usuarios simulados en localStorage
let currentUser = null;

// Usuarios guardados: {username: {password, quizzesCompleted}}
if (!localStorage.getItem('users')) {
  localStorage.setItem('users', JSON.stringify({}));
}

const users = JSON.parse(localStorage.getItem('users'));

// Elementos DOM
const loginForm = document.getElementById('login-form');
const registerForm = document.getElementById('register-form');
const loginSection = document.getElementById('login-section');
const registerSection = document.getElementById('register-section');
const mainMenu = document.getElementById('main-menu');
const chooseLevel = document.getElementById('choose-level');
const quizContainer = document.getElementById('quiz-container');
const coursesContainer = document.getElementById('courses-container');
const profileContainer = document.getElementById('profile-container');

const loginError = document.getElementById('login-error');
const registerError = document.getElementById('register-error');

document.getElementById('show-register').addEventListener('click', () => {
  loginSection.classList.add('hidden');
  registerSection.classList.remove('hidden');
  loginError.innerText = '';
});

document.getElementById('show-login').addEventListener('click', () => {
  registerSection.classList.add('hidden');
  loginSection.classList.remove('hidden');
  registerError.innerText = '';
});

loginForm.addEventListener('submit', e => {
  e.preventDefault();
  const username = document.getElementById('login-username').value.trim();
  const password = document.getElementById('login-password').value;

  if(users[username] && users[username].password === password){
    currentUser = username;
    loginError.innerText = '';
    enterApp();
  } else {
    loginError.innerText = 'Usuario o contraseña incorrectos.';
  }
});

registerForm.addEventListener('submit', e => {
  e.preventDefault();
  const username = document.getElementById('reg-username').value.trim();
  const password = document.getElementById('reg-password').value;

  if(users[username]){
    registerError.innerText = 'El usuario ya existe.';
  } else {
    users[username] = {password, quizzesCompleted: 0};
    localStorage.setItem('users', JSON.stringify(users));
    currentUser = username;
    registerError.innerText = '';
    enterApp();
  }
});

function enterApp(){
  loginSection.classList.add('hidden');
  registerSection.classList.add('hidden');
  mainMenu.classList.remove('hidden');
  updateUserDisplay();
  showSection('main-menu');
}

function logout(){
  currentUser = null;
  mainMenu.classList.add('hidden');
  showSection('login-section');
}

// Navegación entre secciones
function showSection(id){
  [loginSection, registerSection, mainMenu, chooseLevel, quizContainer, coursesContainer, profileContainer].forEach(sec => sec.classList.add('hidden'));
  const el = document.getElementById(id);
  if(el) el.classList.remove('hidden');
  if(id === 'quiz-container'){
    nextButton.style.display = 'none';
  }
}

// Actualiza datos perfil y saludo
function updateUserDisplay(){
  document.getElementById('user-name').innerText = currentUser;
  document.getElementById('profile-user').innerText = currentUser;
  document.getElementById('profile-username').innerText = currentUser;
  document.getElementById('profile-avatar').innerText = currentUser.substring(0,2).toUpperCase();

  // Mostrar quizzes completados
  let completed = users[currentUser].quizzesCompleted || 0;
  document.getElementById('profile-quizzes').innerText = completed;
}

// --- Quiz ---

// Preguntas por nivel
const quizQuestions = {
  basico: [
    {
      question: "¿Cuál es la capital de Francia?",
      answers: [
        {text: "Madrid", correct: false},
        {text: "París", correct: true},
        {text: "Roma", correct: false},
        {text: "Berlín", correct: false},
      ]
    },
    {
      question: "¿Cuál es 2 + 2?",
      answers: [
        {text: "3", correct: false},
        {text: "4", correct: true},
        {text: "5", correct: false},
        {text: "22", correct: false},
      ]
    }
  ],
  intermedio: [
    {
      question: "¿Quién escribió 'Don Quijote'?",
      answers: [
        {text: "Gabriel García Márquez", correct: false},
        {text: "Miguel de Cervantes", correct: true},
        {text: "Pablo Neruda", correct: false},
        {text: "Octavio Paz", correct: false},
      ]
    },
    {
      question: "¿Cuál es la fórmula del agua?",
      answers: [
        {text: "CO2", correct: false},
        {text: "H2O", correct: true},
        {text: "O2", correct: false},
        {text: "NaCl", correct: false},
      ]
    }
  ],
  avanzado: [
    {
      question: "¿Cuál es la derivada de sin(x)?",
      answers: [
        {text: "cos(x)", correct: true},
        {text: "-cos(x)", correct: false},
        {text: "sin(x)", correct: false},
        {text: "-sin(x)", correct: false},
      ]
    },
    {
      question: "¿Quién propuso la teoría de la relatividad?",
      answers: [
        {text: "Isaac Newton", correct: false},
        {text: "Albert Einstein", correct: true},
        {text: "Nikola Tesla", correct: false},
        {text: "Marie Curie", correct: false},
      ]
    }
  ]
};

const questionElement = document.getElementById('question');
const answerButtons = document.getElementById('answer-buttons');
const nextButton = document.getElementById('next-btn');
let currentQuestions = [];
let currentQuestionIndex = 0;
let score = 0;
let currentQuizLevel = '';

function startQuiz(level){
  currentQuizLevel = level;
  currentQuestions = quizQuestions[level];
  currentQuestionIndex = 0;
  score = 0;
  document.getElementById('quiz-level').innerText = capitalize(level);
  showSection('quiz-container');
  nextButton.style.display = 'none';
  showQuestion();
}

function showQuestion(){
  resetState();
  let question = currentQuestions[currentQuestionIndex];
  questionElement.innerText = `Pregunta ${currentQuestionIndex+1}: ${question.question}`;
  question.answers.forEach(answer => {
    const button = document.createElement('button');
    button.innerText = answer.text;
    button.classList.add('answer-btn');
    if(answer.correct) button.dataset.correct = answer.correct;
    button.addEventListener('click', selectAnswer);
    answerButtons.appendChild(button);
  });
}

function resetState(){
  nextButton.style.display = 'none';
  while(answerButtons.firstChild){
    answerButtons.removeChild(answerButtons.firstChild);
  }
}

function selectAnswer(e){
  const selected = e.target;
  const correct = selected.dataset.correct === 'true';

  if(correct){
    selected.classList.add('correct');
    score++;
  } else {
    selected.classList.add('wrong');
  }

  Array.from(answerButtons.children).forEach(button => {
    button.disabled = true;
    if(button.dataset.correct === 'true') button.classList.add('correct');
  });

  nextButton.style.display = 'inline-block';
}

nextButton.addEventListener('click', () => {
  currentQuestionIndex++;
  if(currentQuestionIndex < currentQuestions.length){
    showQuestion();
  } else {
    showScore();
  }
});

function showScore(){
  resetState();
  questionElement.innerText = `Has completado el quiz. Puntuación: ${score} / ${currentQuestions.length}`;
  nextButton.innerText = 'Reiniciar Quiz';
  nextButton.style.display = 'inline-block';
  nextButton.onclick = () => {
    nextButton.innerText = 'Siguiente';
    startQuiz(currentQuizLevel);
  };
  // Guardar progreso
  users[currentUser].quizzesCompleted = (users[currentUser].quizzesCompleted || 0) + 1;
  localStorage.setItem('users', JSON.stringify(users));
  updateUserDisplay();
}

function capitalize(str){
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// Al iniciar
if(currentUser) {
  enterApp();
} else {
  showSection('login-section');
}

