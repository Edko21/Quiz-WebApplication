const defaultQuizzes = [
  { name: "General Knowledge", api: "https://opentdb.com/api.php?amount=10&category=9" },
  { name: "Sports", api: "https://opentdb.com/api.php?amount=10&category=21&type=multiple" },
  { name: "Animals", api: "https://opentdb.com/api.php?amount=10&category=27&type=multiple" },
  { name: "Random Questions", api: "https://opentdb.com/api.php?amount=10&type=multiple" },
  { name: "Celebrities", api: "https://opentdb.com/api.php?amount=10&category=26&type=multiple" },
  { name: "Geography", api: "https://opentdb.com/api.php?amount=10&category=22&type=multiple" },
  { name: "Vehicles", api: "https://opentdb.com/api.php?amount=10&category=28&type=multiple" },
  { name: "Cartoons", api: "https://opentdb.com/api.php?amount=10&category=32&type=multiple" },
  { name: "Books", api: "https://opentdb.com/api.php?amount=10&category=10&type=multiple" }
];

let storedQuizzes = JSON.parse(localStorage.getItem("quizzes")) || [];
storedQuizzes = storedQuizzes.filter(quiz => quiz && typeof quiz.name === "string");

defaultQuizzes.forEach(defQuiz => { //za defaultnite
  const alreadyExists = storedQuizzes.some(q => q.name === defQuiz.name);
  if (!alreadyExists) {
    storedQuizzes.push(defQuiz);
  }
});
localStorage.setItem("quizzes", JSON.stringify(storedQuizzes));
let quizzes = storedQuizzes;

const form = document.getElementById("form");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const nameInput = document.getElementById("name");
const errorMessage = document.getElementById("errors");
const logoutButton = document.getElementById("logout");
const quizList = document.getElementById("quiz-list");
const quizContainer = document.getElementById("quiz-container");
const quizTitle = document.getElementById("quiz-title");
const returnButton = document.getElementById("return-to-quizzes");
const createQuizButtonRedirection = document.getElementById("create-quiz-btn-redirection"); 
const createQuizButton = document.getElementById("create-quiz-btn");
const userQuizzesList = document.getElementById("user-quizzes-list");
const questionList = document.getElementById("question-list");
const quizNameInput = document.getElementById("quiz-name");
const questionTextInput = document.getElementById("question-text");
const addQuestionButton = document.getElementById("add-question-button");
const createReturnButton = document.getElementById("return-to-avaliable");

let currentQuiz = null; 

function setError(msg) { //za error
  if (errorMessage) {
    errorMessage.innerText = msg;
    setTimeout(() => {
      errorMessage.innerText = "";
    }, 1500);
  }
}

if (form) {
  form.addEventListener("submit", function (e) { //za da ne prezarejda ako e prazna stranicata
    e.preventDefault();
    let errors = [];
    if (nameInput) { //znachi sme v sign up
      errors = validateSignUp(nameInput.value, emailInput.value, passwordInput.value);
      if (errors.length === 0) {
        if (localStorage.getItem(emailInput.value)) {
          setError("Email already registered.");
          return;
        }
        localStorage.setItem(
          emailInput.value,
          JSON.stringify({ name: nameInput.value, password: passwordInput.value })
        );
        window.location.href = "login.html";
        return;
      }
    } else { //togava sme v log in
      errors = validateLogin(emailInput.value, passwordInput.value);
      if (errors.length === 0) {
        let userData = localStorage.getItem(emailInput.value);
        if (!userData || JSON.parse(userData).password !== passwordInput.value) {
          setError("Invalid credentials.");
          return;
        }
        localStorage.setItem("loggedInUser", emailInput.value);
        window.location.href = "avaliableQuizzez.html";
        return;
      }
    }
    if (errors.length > 0) {
      setError(errors.join(". "));
    }
  });
}

function validateLogin(email, password) {
  let errors = [];
  if (!email) 
    errors.push("Email is required");
  if (!password) 
    errors.push("Password is required");
  if (password && password.length < 8) 
    errors.push("Password must have at least 8 characters");
  return errors;
}

function validateSignUp(name, email, password) {
  let errors = [];
  if (!name) 
    errors.push("Name is required");
  if (!email) 
    errors.push("Email is required");
  if (!password) 
    errors.push("Password is required");
  if (password && password.length < 8) 
    errors.push("Password must have at least 8 characters");
  return errors;
}

if (logoutButton) {
  logoutButton.addEventListener("click", function () {
    localStorage.removeItem("loggedInUser");
    window.location.href = "login.html";
  });
}

if (quizList) {
  loadAvailableQuizzes();
}

function loadAvailableQuizzes() {
  quizList.innerHTML = "";
  quizzes.forEach((quiz, index) => {
    let listItem = document.createElement("li");
    listItem.innerHTML = `
      ${quiz.name}
      <button onclick="startQuiz(${index})">Start</button>
    `;
    quizList.appendChild(listItem);
  });
}

window.startQuiz = function (index) {
  const selected = quizzes[index];
  localStorage.setItem("selectedQuizApi", selected.api || "");
  localStorage.setItem("selectedQuizName", selected.name);
  window.location.href = "manageQuizzez.html";
};


if (quizContainer && quizTitle) {
  const selectedQuizApi = localStorage.getItem("selectedQuizApi");
  const selectedQuizName = localStorage.getItem("selectedQuizName");

  if (!selectedQuizName) {
    quizTitle.innerText = "No quiz selected.";
  } else {
    quizTitle.innerText = `Quiz: ${selectedQuizName}`;
  }

  if (selectedQuizApi) { //ako e quiz ot apito
    fetch(selectedQuizApi)
      .then(response => response.json())
      .then(data => {
        if (!data.results || data.results.length === 0) {
          quizContainer.innerHTML = "<p>No questions found.</p>";
          return;
        }
        displayQuestion(0, data.results, 0, []);
      })
      .catch(err => {
        console.error(err);
        quizContainer.innerHTML = "<p>Error fetching quiz data.</p>";
      });
  } else if (selectedQuizName) { //ako e quiz ot usera
    const foundQuiz = quizzes.find(q => q.name === selectedQuizName);
    if (!foundQuiz || !foundQuiz.questions || foundQuiz.questions.length === 0) {
      quizContainer.innerHTML = "<p>No questions found.</p>";
    } else {
      displayLocalQuestion(0, foundQuiz.questions, 0, []);
    }
  }
}

function displayQuestion(index, questions, score, answers) {
  if (index >= questions.length) {
    showResults(score, questions.length, answers);
    return;
  }
  const questionObj = questions[index];
  const questionText = questionObj.question;
  const correctAnswer = questionObj.correct_answer;
  const options = [...questionObj.incorrect_answers, correctAnswer].sort(() => Math.random() - 0.5);

  let questionHTML = `<p><strong>${questionText}</strong></p>`;
  options.forEach(option => {
    questionHTML += `<label class="quiz-option">
        <input type="radio" name="quiz-answer" value="${option}" />
        ${option}
      </label>`;
  });

  questionHTML += `<button onclick="submitApiAnswer(${index}, ${score})">Next</button>`;
  quizContainer.innerHTML = questionHTML;
  window.currentApiQuestion = { index, questions, score, answers, correctAnswer };
}

window.submitApiAnswer = function (index, score) {
  const selectedAnswer = document.querySelector("input[name='quiz-answer']:checked");
  if (!selectedAnswer) 
    return;
  
  const { questions, answers, correctAnswer } = window.currentApiQuestion;
  const isCorrect = selectedAnswer.value === correctAnswer;
  const questionText = questions[index].question;
  answers.push({
    question: questionText,
    selectedAnswer: selectedAnswer.value,
    correctAnswer: correctAnswer,
    isCorrect: isCorrect
  });
  const newScore = score + (isCorrect ? 1 : 0);
  displayQuestion(index + 1, questions, newScore, answers);
};

function displayLocalQuestion(index, questions, score, answers) {
  if (index >= questions.length) {
    showResults(score, questions.length, answers);
    return;
  }
  const q = questions[index];
  const questionText = q.question;
  const ansArr = q.answers;
  let questionHTML = `<p><strong>${questionText}</strong></p>`;
  ansArr.forEach((option, i) => {
    questionHTML += `<label class="quiz-option">
        <input type="radio" name="quiz-answer" value="${i}" />
        ${option}
      </label>`;
  });
  questionHTML += `<button onclick="submitLocalAnswer(${index}, ${score})">Next</button>`;
  quizContainer.innerHTML = questionHTML;
  window.currentLocalQuestion = { index, questions, score, answers };
}

window.submitLocalAnswer = function (index, score) {
  const selected = document.querySelector("input[name='quiz-answer']:checked");
  if (!selected) 
    return;

  const { index: currentIndex, questions, answers } = window.currentLocalQuestion;
  const chosenIdx = parseInt(selected.value, 10);
  const questionData = questions[currentIndex];
  const isCorrect = questionData.correctAnswers.includes(chosenIdx);
  answers.push({
    question: questionData.question,
    selectedAnswer: questionData.answers[chosenIdx],
    correctAnswer: questionData.correctAnswers.map(i => questionData.answers[i]).join(", "),
    isCorrect: isCorrect
  });
  const newScore = score + (isCorrect ? 1 : 0);
  displayLocalQuestion(currentIndex + 1, questions, newScore, answers);
};

function showResults(score, totalQuestions, answers) {
  let summaryHTML = `<h2>Your score: ${score} / ${totalQuestions}</h2>`;
  summaryHTML += `<p>Click 'View Detailed Results' to see the breakdown.</p>`;
  const finalData = { score, totalQuestions, answers };
  localStorage.setItem("quizResults", JSON.stringify(finalData));
  summaryHTML += `<button id="view-results-btn">View Detailed Results</button>`;
  summaryHTML += `<button id="return-quizzes-btn">Return to Quizzes</button>`;
  quizContainer.innerHTML = summaryHTML;
  quizContainer.classList.remove("container");
  quizContainer.classList.add("full-page-results");
  const viewResultsBtn = document.getElementById("view-results-btn");
  viewResultsBtn.addEventListener("click", () => {
    window.location.href = "result.html";
  });
  const returnQuizzesBtn = document.getElementById("return-quizzes-btn");
  returnQuizzesBtn.addEventListener("click", () => {
    window.location.href = "avaliableQuizzez.html";
  });
}

if (returnButton) {
  returnButton.addEventListener("click", function () {
    window.location.href = "avaliableQuizzez.html";
  });
}

function renderQuizzes() {
  if (!userQuizzesList) return;
  userQuizzesList.innerHTML = "";
  quizzes.forEach((quiz, index) => {
    const li = document.createElement("li");
    li.textContent = quiz.name;
    if (!quiz.api) {
      const editButton = document.createElement("button");
      editButton.textContent = "Edit";
      editButton.style.marginLeft = "10px";
      editButton.addEventListener("click", () => {
        currentQuiz = quiz;
        if (quizNameInput) quizNameInput.value = currentQuiz.name;
        const currentQuizNameSpan = document.getElementById("current-quiz-name");
        if (currentQuizNameSpan) currentQuizNameSpan.textContent = currentQuiz.name;
        renderQuizQuestions();
      });
      li.appendChild(editButton);
      const deleteButton = document.createElement("button");
      deleteButton.textContent = "Delete";
      deleteButton.style.marginLeft = "10px";
      deleteButton.addEventListener("click", () => {
        quizzes.splice(index, 1);
        saveQuizzes();
        renderQuizzes();
      });
      li.appendChild(deleteButton);
    }
    userQuizzesList.appendChild(li);
  });
}

if (createQuizButtonRedirection) {
  createQuizButtonRedirection.addEventListener("click", () => {
    window.location.href = "createQuizz.html";
  });
}

if (createReturnButton) {
  createReturnButton.addEventListener("click", () => {
    window.location.href = "avaliableQuizzez.html";
  });
}

if (createQuizButton) {
  createQuizButton.addEventListener("click", () => {
    if (!quizNameInput) 
      return;
    const nameVal = quizNameInput.value.trim();
    if (!nameVal) 
      return;

    const newQuiz = {
      name: nameVal,
      questions: []
    };
    quizzes.push(newQuiz);
    saveQuizzes();
    quizNameInput.value = "";
    renderQuizzes();
  });
}

if (addQuestionButton) {
  addQuestionButton.addEventListener("click", () => {
    if (!currentQuiz) 
      return;
    
    if (!questionTextInput) 
      return;
    const questionText = questionTextInput.value.trim();
    const options = Array.from(document.querySelectorAll(".answer"))
      .map(a => a.value.trim())
      .filter(Boolean);
    const correctAnswers = Array.from(document.querySelectorAll(".correct-answer"))
      .filter(c => c.checked)
      .map(c => parseInt(c.value, 10) - 1);
    if (!questionText || options.length < 2 || correctAnswers.length === 0)
      return;

    currentQuiz.questions.push({
      question: questionText,
      answers: options,
      correctAnswers: correctAnswers
    });
    saveQuizzes();
    questionTextInput.value = "";
    document.querySelectorAll(".answer").forEach(a => (a.value = ""));
    document.querySelectorAll(".correct-answer").forEach(c => (c.checked = false));
    renderQuizQuestions();
  });
}

function renderQuizQuestions() {
  if (!questionList || !currentQuiz) return;
  questionList.innerHTML = "";
  currentQuiz.questions.forEach((q, i) => {
    const li = document.createElement("li");
    li.textContent = q.question;
    const removeButton = document.createElement("button");
    removeButton.textContent = "Remove";
    removeButton.style.marginLeft = "10px";
    removeButton.addEventListener("click", () => {
      currentQuiz.questions.splice(i, 1);
      saveQuizzes();
      renderQuizQuestions();
    });
    li.appendChild(removeButton);
    questionList.appendChild(li);
  });
}

function saveQuizzes() {
  localStorage.setItem("quizzes", JSON.stringify(quizzes));
}

renderQuizzes();

const resultsDetailsDiv = document.getElementById("results-details");
if (resultsDetailsDiv) {
  const resultsData = JSON.parse(localStorage.getItem("quizResults"));
  if (resultsData) {
    let detailsHTML = `<h2>Your Score: ${resultsData.score} / ${resultsData.totalQuestions}</h2>`;
    detailsHTML += `<ul>`;
    resultsData.answers.forEach((answer, idx) => {
      detailsHTML += `<li>
            <p><strong>Question ${idx + 1}:</strong> ${answer.question}</p>
            <p><strong>Your Answer:</strong> ${answer.selectedAnswer}</p>
            <p><strong>Correct Answer:</strong> ${answer.correctAnswer}</p>
            <p>${answer.isCorrect ? '<span class="correct">Correct</span>' : '<span class="incorrect">Incorrect</span>'}</p>
        </li>`;
    });
    detailsHTML += `</ul>`;
    resultsDetailsDiv.innerHTML = detailsHTML;
  } else {
    resultsDetailsDiv.innerHTML = "<p>No results available.</p>";
  }
}

const returnHomeBtn = document.getElementById("return-home");
if (returnHomeBtn) {
  returnHomeBtn.addEventListener("click", () => {
    window.location.href = "avaliableQuizzez.html";
  });
}
