# Quiz Web Application
---
## Project Snapshot

| | |
|---|---|
| **Project type** | University web project |
| **Core focus** | Browser-driven application logic and API integration |
| **What it showcases** | Quiz builder, trivia categories, per-question results |

---

## Highlights

- **Trivia Categories:** Load questions from OpenTDB across topics such as geography, sports, animals, and general knowledge.
- **Custom Quizzes:** Create quizzes, add questions and answer choices, and edit or remove quiz content.
- **Quiz Sessions:** Display questions one at a time, record selected answers, and calculate scores.
- **Detailed Results:** Show correct and incorrect answers with per-question feedback.
- **Browser Persistence:** Store custom quizzes, quiz results, and demo user data with `localStorage`.
- **Client-Side Forms:** Provide registration, login, and basic input validation for an educational browser-only workflow.

> All application state is handled in the browser; there is no server-side user authentication or database.

---

## Application Structure

| Page / Module | Responsibility |
|---|---|
| `signup.html` / `login.html` | Browser-only account forms and validation |
| `avaliableQuizzez.html` | Display available trivia categories and saved quizzes |
| `manageQuizzez.html` | Run a selected quiz and calculate the score |
| `createQuizz.html` | Create and edit custom quizzes and questions |
| `result.html` | Show answer-by-answer results |
| `script.js` | API requests, DOM updates, quiz logic, and localStorage operations |

---

## 🛠️ Tech Stack & Concepts

| Category | Details |
|---|---|
| **Frontend** | HTML5, CSS3, JavaScript |
| **Data Source** | [Open Trivia Database API](https://opentdb.com/api_config.php) |
| **Browser APIs** | Fetch API, DOM API, localStorage |
| **Concepts** | Asynchronous requests, event handling, validation, client-side state |

---

## Getting Started

1. Download or clone the repository.
2. Open the `QuizWebApp` directory.
3. Start `login.html` in a browser. A local development server (for example VS Code Live Server) is recommended.
4. Create a demo account and explore the quizzes.

```bash
git clone https://github.com/Edko21/Quiz-WebApplication.git
cd Quiz-WebApplication/QuizWebApp
```

Internet access is required to load trivia questions from OpenTDB.

---

##Important Note

**Authentication is a client-side demonstration only.** User information, including passwords, is stored in browser `localStorage` and must not be treated as a secure production authentication system.

---

## Next Steps

- Replace browser-only accounts with secure backend authentication.
- Add automated tests and clearer error/loading states for API requests.
- Refactor the large `script.js` into focused modules.

---

🔗 **Repository:** [Quiz Web Application](https://github.com/Edko21/Quiz-WebApplication)
