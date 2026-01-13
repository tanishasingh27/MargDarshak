// ---------------- Firebase Setup ----------------
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { getFirestore, doc, setDoc, getDoc } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

// Your Firebase config
const firebaseConfig = {
      apiKey: "AIzaSyCgb7JhR9ko1YH2gyrPPtFb2ZGqq8IXg6g",
      authDomain: "margdarshak-58c9c.firebaseapp.com",
      projectId: "margdarshak-58c9c",
      storageBucket: "margdarshak-58c9c.appspot.com",
      messagingSenderId: "912493540489",
      appId: "1:912493540489:web:88e299d732a7ad7c6f0258",
      measurementId: "G-BYPBLGPZTY"
    };
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// ---------------- Quiz Logic ----------------
const questions = [
  { q: "What is 2+2?", options: ["3","4","5"], correct: 1 },
  { q: "Capital of India?", options: ["Delhi","Mumbai","Kolkata"], correct: 0 },
];

let currentQ = 0;
let selectedAnswers = [];

const questionEl = document.getElementById("question");
const optionsEl = document.getElementById("options");
const quizBox = document.getElementById("quiz-box");
const resultBox = document.getElementById("result-box");
const resultContent = document.getElementById("result-content");

function loadQuestion() {
  let q = questions[currentQ];
  questionEl.textContent = q.q;
  optionsEl.innerHTML = "";
  q.options.forEach((opt, idx) => {
    let btn = document.createElement("button");
    btn.textContent = opt;
    btn.onclick = () => {
      selectedAnswers[currentQ] = idx;
    };
    optionsEl.appendChild(btn);
  });
}
document.getElementById("nextBtn").onclick = () => {
  if (currentQ < questions.length - 1) {
    currentQ++;
    loadQuestion();
  }
};
document.getElementById("prevBtn").onclick = () => {
  if (currentQ > 0) {
    currentQ--;
    loadQuestion();
  }
};
document.getElementById("finishBtn").onclick = async () => {
  const user = auth.currentUser;
  if (!user) {
    alert("Please login again.");
    return;
  }

  // save result in Firestore
  await setDoc(doc(db, "quizResults", user.uid), {
    answers: selectedAnswers,
    completedAt: new Date().toISOString()
  });

  // switch to result screen
  quizBox.style.display = "none";
  resultBox.style.display = "block";
};

// ---------------- View Results ----------------
document.getElementById("viewResultBtn").onclick = async () => {
  const user = auth.currentUser;
  if (!user) return;

  const docRef = doc(db, "quizResults", user.uid);
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    const data = docSnap.data();
    let score = 0;
    data.answers.forEach((ans, i) => {
      if (ans === questions[i].correct) score++;
    });

    resultContent.innerHTML = `
      <p>You completed at: ${new Date(data.completedAt).toLocaleString()}</p>
      <p>Your Score: ${score} / ${questions.length}</p>
    `;
  } else {
    resultContent.innerHTML = `<p>No result found.</p>`;
  }
};

document.getElementById("dashboardBtn").onclick = () => {
  window.location.href = "dashboard.html"; // or wherever your dashboard is
};

// load first question
loadQuestion();
