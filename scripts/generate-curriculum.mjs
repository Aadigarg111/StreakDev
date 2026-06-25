import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const tracksDir = path.join(root, "content", "tracks");
const exercisesDir = path.join(root, "content", "exercises");

const trackIds = [
  "html-css",
  "javascript",
  "typescript",
  "react",
  "node-backend",
  "git-github",
  "python",
  "c",
  "cpp",
  "java",
  "sql",
  "dsa",
  "big-o",
  "operating-systems",
  "networks",
  "dbms",
  "ood",
  "system-design",
];

const domains = {
  "html-css": ["structure and style web content", "choosing tags or CSS only by how they look", "`<main><h1>Title</h1></main>`", "`<div>Everything</div>`"],
  javascript: ["make programs respond to data and events", "not tracking what value an expression returns", "`const total = price * count`", "`value = maybe`"],
  typescript: ["model JavaScript values with safer types", "using `any` to hide every type error", "`type User = { id: string }`", "`let data: any`"],
  react: ["build UI from components, props, and state", "mutating state directly", "`<Profile name=\"Ada\" />`", "`state.count++`"],
  "node-backend": ["handle requests and send reliable responses", "mixing routing, validation, and database code", "`app.get('/users', handler)`", "`res.send()` before checks"],
  "git-github": ["track changes and collaborate safely", "running commands without checking status", "`git status`", "`git push --force` blindly"],
  python: ["write readable scripts and applications", "guessing flow instead of reading indentation", "`for item in items: print(item)`", "`except: pass`"],
  c: ["control memory and low-level data", "using memory after it is freed", "`int count = 0;`", "`free(ptr); *ptr = 1;`"],
  cpp: ["combine performance with abstractions", "manual ownership when RAII is safer", "`std::vector<int> nums;`", "`new` without ownership"],
  java: ["organize typed classes and methods", "confusing static code with object behavior", "`public class Main {}`", "`public static everything`"],
  sql: ["query and shape relational data", "writing clauses in the wrong order", "`SELECT name FROM users;`", "`SELECT *` everywhere"],
  dsa: ["choose efficient data shapes and steps", "coding before choosing the right structure", "`stack.push(value)`", "Nested loops by default"],
  "big-o": ["describe how work grows with input size", "timing one run and calling it complexity", "`O(n)`", "Time one tiny input"],
  "operating-systems": ["explain how programs share machine resources", "assuming one program owns the whole machine", "`process -> thread -> CPU`", "Ignore process limits"],
  networks: ["move data between machines using protocols", "debugging the app while ignoring network layers", "`GET / HTTP/1.1`", "Ignore DNS"],
  dbms: ["protect and optimize durable data", "skipping constraints and transactions", "`PRIMARY KEY (id)`", "No constraints"],
  ood: ["assign clear object responsibilities", "creating classes for every noun", "`Order.calculateTotal()`", "God object"],
  "system-design": ["combine services, data, and tradeoffs", "choosing tools before requirements", "`client -> API -> database`", "Start with tools"],
};

const examples = {
  "html-css": [["link", "`<a href=\"/about\">About</a>`"], ["image", "`<img src=\"cat.jpg\" alt=\"Cat\">`"], ["heading", "`<h1>Dashboard</h1>`"], ["flex", "`display: flex`"], ["grid", "`display: grid`"], ["media", "`@media (min-width: 768px)`"], ["form", "`<label for=\"email\">Email</label>`"], ["color", "`color: #1cb0f6`"], ["animation", "`transition: transform 150ms`"]],
  javascript: [["variable", "`let count = 0`"], ["function", "`function add(a, b) { return a + b }`"], ["array", "`items.map(item => item.name)`"], ["object", "`user.name`"], ["promise", "`fetch(url).then(...)`"], ["async", "`const data = await fetch(url)`"], ["event", "`button.addEventListener('click', fn)`"]],
  typescript: [["interface", "`interface User { id: string }`"], ["generic", "`function first<T>(items: T[]): T`"], ["union", "`type State = 'idle' | 'loading'`"], ["guard", "`typeof value === 'string'`"], ["readonly", "`readonly id: string`"]],
  react: [["state", "`const [open, setOpen] = useState(false)`"], ["props", "`<Card title=\"Profile\" />`"], ["effect", "`useEffect(() => {}, [])`"], ["context", "`const theme = useContext(ThemeContext)`"], ["form", "`value={email}`"], ["key", "`<li key={item.id}>`"]],
  sql: [["where", "`WHERE status = 'paid'`"], ["join", "`JOIN users ON users.id = orders.user_id`"], ["group", "`GROUP BY customer_id`"], ["order", "`ORDER BY created_at DESC`"], ["insert", "`INSERT INTO users (name) VALUES ('Ada')`"], ["index", "`CREATE INDEX idx_users_email ON users(email)`"]],
  python: [["function", "`def greet(name): return 'Hi ' + name`"], ["list", "`names[0]`"], ["dict", "`user['name']`"], ["class", "`class User:`"], ["file", "`with open(path) as f:`"], ["exception", "`try: ... except ValueError:`"]],
  "git-github": [["commit", "`git commit -m \"Add tests\"`"], ["branch", "`git switch -c feature/login`"], ["merge", "`git merge main`"], ["rebase", "`git rebase main`"], ["pull", "`git pull`"], ["push", "`git push origin feature`"]],
};

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function writeJson(filePath, value) {
  fs.writeFileSync(filePath, `${JSON.stringify(value, null, 2)}\n`);
}

function sectionName(section) {
  return section.title.replace(/^Section\s+\d+:\s*/i, "");
}

function compact(value, max = 48) {
  return value.length <= max ? value : `${value.slice(0, max - 1).trim()}…`;
}

function exampleFor(trackId, unitTitle) {
  const lower = unitTitle.toLowerCase();
  for (const [needle, example] of examples[trackId] ?? []) {
    if (lower.includes(needle)) {
      return example;
    }
  }
  return domains[trackId][2];
}

function rotate(options, index) {
  const orders = [[0, 1, 2, 3], [1, 0, 2, 3], [1, 2, 0, 3], [1, 2, 3, 0]];
  return orders[index % orders.length].map((item) => compact(options[item]));
}

function questionsFor(track, section, unit) {
  const [purpose, mistake, , badExample] = domains[track.id];
  const example = exampleFor(track.id, unit.title);
  return [
    [`What should ${unit.title} help you do?`, purpose, ["Pick random syntax", "Rename files only", "Change UI color only"]],
    [`Best example of ${unit.title}?`, example, [badExample, "`TODO`", "No example needed"]],
    [`Why learn it in ${sectionName(section)}?`, "It supports later skills", ["It skips basics", "It hides errors", "It replaces practice"]],
    ["What should you check first?", "The purpose", ["The longest syntax", "The prettiest option", "The final project"]],
    ["Which habit is safest?", "Use one clear example", ["Copy blindly", "Ignore feedback", "Guess the answer"]],
    ["Common beginner mistake?", mistake, ["Reading docs", "Testing examples", "Naming clearly"]],
    ["What makes it useful?", "Clearer decisions", ["More confusion", "Less structure", "Random memorization"]],
    ["How should you practice?", "Apply it once", ["Only read it", "Skip examples", "Avoid mistakes"]],
    ["What should an answer explain?", "Why it works", ["Only the letter", "Only the color", "Only the order"]],
    ["Ready to continue when you can...", "Explain the idea", ["Guess quickly", "Ignore examples", "Skip review"]],
  ];
}

function makeExercises(track, section, unit) {
  const [purpose] = domains[track.id];
  return questionsFor(track, section, unit).map(([prompt, correct, wrong], index) => {
    const correctAnswer = compact(correct);
    return {
      id: `${track.id}-s${section.order}-u${unit.order}-q${index + 1}`,
      type: "multiple_choice",
      prompt,
      options: rotate([correct, ...wrong], index),
      correctAnswer,
      explanation: `${correctAnswer}. ${unit.title} helps you ${purpose}.`,
      difficulty: index < 4 ? "easy" : index < 7 ? "medium" : "hard",
    };
  });
}

fs.mkdirSync(exercisesDir, { recursive: true });

let totalExercises = 0;
for (const trackId of trackIds) {
  const track = readJson(path.join(tracksDir, `${trackId}.json`));
  const exercises = [];
  const [purpose, mistake] = domains[trackId];

  for (const section of track.sections) {
    for (const unit of section.units) {
      const unitExercises = makeExercises(track, section, unit);
      unit.learn = `${unit.title} helps you ${purpose}. Example: ${exampleFor(trackId, unit.title)}. Avoid: ${mistake}.`;
      unit.lessons[0].exerciseIds = unitExercises.map((exercise) => exercise.id);
      exercises.push(...unitExercises);
    }
  }

  writeJson(path.join(tracksDir, `${trackId}.json`), track);
  writeJson(path.join(exercisesDir, `${trackId}.json`), exercises);
  totalExercises += exercises.length;
}

console.log(`Generated ${totalExercises} real learning questions for ${trackIds.length} tracks.`);
