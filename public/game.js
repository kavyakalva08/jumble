let words = [];
let round = 0, attempt = 0, points = 0, current = "";

const $ = id => document.getElementById(id);

function jumble(word) {
  const letters = word.split("");
  let result;
  do {
    for (let i = letters.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [letters[i], letters[j]] = [letters[j], letters[i]];
    }
    result = letters.join("");
  } while (result === word);
  return result;
}

function nextWord() {
  const k = Math.floor(Math.random() * words.length);
  current = words.splice(k, 1)[0]; // pick and remove, like words.remove()
  attempt = 0;
  $("jumbled").textContent = jumble(current);
  $("status").textContent = `Round ${round + 1} of 5 · Points: ${points}`;
}

function submitGuess() {
  const guess = $("guess").value.trim().toLowerCase();
  $("guess").value = "";

  if (guess === current) {
    points += attempt === 0 ? 10 : 5;
    $("message").textContent = "Right guess!";
    advance();
  } else if (attempt === 0) {
    attempt = 1;
    $("message").textContent = "Wrong guess, try again";
  } else {
    $("message").textContent = `Wrong. The word was ${current}.`;
    advance();
  }
}

function advance() {
  round++;
  if (round === 5) {
    $("status").textContent = `Game over! You scored ${points}/50`;
    $("jumbled").textContent = points === 50 ? "🎉 Perfect!" : "Thanks for playing";
    $("submit").disabled = true;
    $("end").hidden = false;
  } else {
    nextWord();
  }
}

async function loadBoard() {
  const res = await fetch("/api/leaderboard");
  const rows = await res.json();
  $("board").replaceChildren(...rows.map(r => {
    const li = document.createElement("li");
    li.textContent = `${r.name} — ${r.points}`;  // textContent, not innerHTML, so names can't inject HTML
    return li;
  }));
}

$("save").addEventListener("click", async () => {
  const name = $("name").value.trim();
  if (!name) return;
  await fetch("/api/scores", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, points })
  });
  $("end").hidden = true;
  loadBoard();
});

$("submit").addEventListener("click", submitGuess);
$("guess").addEventListener("keydown", e => { if (e.key === "Enter") submitGuess(); });

async function start() {
  const res = await fetch("/api/words");
  words = await res.json();
  loadBoard();
  nextWord();
}
start();