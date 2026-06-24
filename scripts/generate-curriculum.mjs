import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const tracksDir = path.join(root, "content", "tracks");
const exercisesDir = path.join(root, "content", "exercises");

const categoryLabels = {
  "web-dev": "Web Dev",
  languages: "Languages",
  "core-cs": "Core CS",
};

const tracks = [
  {
    id: "html-css",
    title: "HTML & CSS",
    category: "web-dev",
    icon: "code-xml",
    color: "#58CC02",
    description: "Build semantic, responsive, accessible interfaces from first principles.",
    sections: [
      ["HTML Foundations", ["Document anatomy", "Headings and text", "Links and anchors", "Images and alt text", "Lists and tables", "Semantic page layout", "Metadata and SEO basics", "Audio and video", "Forms introduction", "HTML validation"]],
      ["CSS Foundations", ["Selectors", "Specificity", "Cascade order", "Inheritance", "Units and values", "Colors and opacity", "Typography basics", "Custom properties", "Reset and normalize CSS", "Debugging styles"]],
      ["Box Model & Layout", ["Display modes", "Box sizing", "Margin and padding", "Border and outline", "Margin collapse", "Positioning basics", "Z-index stacking", "Overflow control", "Intrinsic sizing", "Layout debugging"]],
      ["Flexbox", ["Flex containers", "Main and cross axes", "Justify content", "Align items", "Flex wrapping", "Flex grow", "Flex shrink", "Flex basis", "Ordering flex items", "Common flex patterns"]],
      ["Grid", ["Grid containers", "Rows and columns", "Grid gaps", "Named grid areas", "Manual placement", "Implicit grids", "Auto-fit and minmax", "Grid alignment", "Responsive grids", "Dashboard layouts"]],
      ["Responsive Design", ["Mobile-first CSS", "Media query syntax", "Fluid widths", "Responsive images", "Fluid typography", "Viewport units", "Container query basics", "Touch targets", "Preference media queries", "Responsive QA"]],
      ["Animations & Motion", ["Transitions", "Transforms", "Keyframes", "Timing functions", "Delay and iteration", "Performance-friendly motion", "Hover and active states", "Loading skeletons", "Reduced motion", "Motion polish"]],
      ["Forms & Accessibility", ["Labels and inputs", "Buttons and controls", "Form grouping", "Validation messages", "Keyboard navigation", "Focus states", "ARIA basics", "Color contrast", "Screen reader text", "Accessible form flow"]],
      ["CSS Architecture", ["Class naming", "Component CSS", "Utility CSS", "CSS modules", "Cascade layers", "Design tokens", "Theming", "Dark mode", "Print styles", "Style quality checks"]],
      ["Interface Capstones", ["Landing page", "Responsive navigation", "Pricing section", "Profile card", "Settings form", "Accessible modal", "Animated feedback", "Browser testing", "Performance pass", "Final interface project"]],
    ],
  },
  {
    id: "javascript",
    title: "JavaScript",
    category: "web-dev",
    icon: "braces",
    color: "#FFC800",
    description: "Master the language of the web, from syntax to async and browser APIs.",
    sections: [
      ["Fundamentals", ["Variables", "Data types", "Operators", "Type coercion", "Comments", "Console basics", "Strict mode", "Template literals", "var vs let vs const", "Basic input and output"]],
      ["Control Flow", ["if and else", "switch statements", "Ternary expressions", "for loops", "while loops", "break and continue", "Nested conditionals", "Truthy and falsy values", "Logical operators", "Guard clauses"]],
      ["Functions", ["Function declarations", "Function expressions", "Arrow functions", "Parameters and arguments", "Default parameters", "Rest parameters", "Return values", "Scope", "Hoisting", "Recursion"]],
      ["Arrays", ["Array creation", "Indexing", "Mutation methods", "Iteration methods", "map", "filter", "reduce", "find and some", "Sorting arrays", "Nested arrays"]],
      ["Objects", ["Object literals", "Property access", "Methods", "this basics", "Destructuring", "Spread and clone", "Object.keys", "Optional chaining", "JSON basics", "Object patterns"]],
      ["DOM & Events", ["Selecting elements", "Changing text", "Changing styles", "Creating elements", "Event listeners", "Event object", "Event bubbling", "Forms and input", "Local storage", "DOM project"]],
      ["Async JavaScript", ["Callbacks", "Timers", "Promises", "Promise chains", "async and await", "try and catch", "fetch", "Parallel requests", "Race conditions", "Async project"]],
      ["Closures & Functional JS", ["Lexical scope", "Closures", "Factory functions", "Higher-order functions", "Callback patterns", "Pure functions", "Immutability", "Composition", "Currying basics", "Functional refactor"]],
      ["Modern JavaScript", ["Modules", "Import and export", "Classes", "Private fields", "Sets", "Maps", "Symbols", "Iterators", "Generators basics", "Tooling basics"]],
      ["Advanced Practice", ["Error handling", "Debugging", "Performance basics", "Memory basics", "Testing basics", "Browser APIs", "Date and Intl", "Regular expressions", "Security basics", "Final JS app"]],
    ],
  },
  {
    id: "typescript",
    title: "TypeScript",
    category: "web-dev",
    icon: "file-code-2",
    color: "#1CB0F6",
    description: "Add strong types to JavaScript and model safer application code.",
    sections: [
      ["Type Foundations", ["Why TypeScript", "Primitive types", "Arrays and tuples", "Object types", "Optional properties", "Literal types", "Type inference", "Type annotations", "Any and unknown", "Compiler errors"]],
      ["Interfaces & Aliases", ["Type aliases", "Interfaces", "Extending interfaces", "Readonly fields", "Index signatures", "Interface merging", "Structural typing", "Nested shapes", "API response types", "Modeling UI props"]],
      ["Functions", ["Function parameters", "Return types", "Optional parameters", "Default parameters", "Rest parameters", "Function overloads", "Callback types", "Void and never", "Typing events", "Function refactors"]],
      ["Unions & Narrowing", ["Union types", "Discriminated unions", "Type guards", "typeof checks", "in checks", "instanceof checks", "Exhaustive checks", "Nullable values", "Control-flow narrowing", "State modeling"]],
      ["Generics", ["Generic functions", "Generic arrays", "Generic constraints", "Generic interfaces", "Generic components", "Keyof", "Indexed access", "Mapped types intro", "Generic defaults", "Reusable helpers"]],
      ["Utility Types", ["Partial", "Required", "Pick", "Omit", "Record", "ReturnType", "Parameters", "Awaited", "Readonly", "Composing utilities"]],
      ["Enums & Constants", ["String enums", "Numeric enums", "Const objects", "Union alternatives", "Enum pitfalls", "Configuration types", "Status modeling", "Feature flags", "Constants modules", "Migration choices"]],
      ["React with TypeScript", ["Component props", "Children types", "Event types", "useState types", "useRef types", "Custom hooks", "Context types", "Generic components", "Form types", "React TS patterns"]],
      ["API & Runtime Boundaries", ["JSON parsing", "Runtime validation", "Type predicates", "DTO types", "Error response types", "Environment variables", "Third-party packages", "Declaration files", "Module augmentation", "Boundary audits"]],
      ["TypeScript Capstones", ["Strict mode cleanup", "Domain modeling", "Refactor to unions", "Typed API client", "Reusable form types", "State machine types", "Test helper types", "Library typing", "Build troubleshooting", "Final TS project"]],
    ],
  },
  {
    id: "react",
    title: "React",
    category: "web-dev",
    icon: "atom",
    color: "#CE82FF",
    description: "Build interactive component systems with hooks, forms, and performance patterns.",
    sections: [
      ["Components & JSX", ["React mental model", "JSX syntax", "Component functions", "Composition", "Fragments", "Rendering variables", "Inline expressions", "Styling basics", "File organization", "Component practice"]],
      ["Props & State", ["Passing props", "Default props patterns", "State basics", "Updating state", "State immutability", "Derived values", "Lifting state", "Controlled inputs", "State debugging", "Small app state"]],
      ["Hooks Basics", ["useState", "useEffect", "Effect dependencies", "Cleanup functions", "useRef", "useMemo", "useCallback", "Rules of hooks", "Custom hook intro", "Hook troubleshooting"]],
      ["Rendering Patterns", ["Conditional rendering", "Lists and keys", "Empty states", "Loading states", "Error states", "Slot patterns", "Children composition", "Render helpers", "Reusable cards", "Rendering polish"]],
      ["Forms", ["Controlled forms", "Textarea and select", "Checkboxes", "Validation", "Form errors", "Submission state", "Reset flows", "Accessible labels", "Multi-step forms", "Form project"]],
      ["Context & State", ["Context basics", "Provider setup", "useContext", "Reducer basics", "useReducer", "Action modeling", "Avoiding over-render", "Global UI state", "Persisted state", "State architecture"]],
      ["Data Fetching", ["Client fetching", "Effect fetching", "Abort controller", "Loading skeletons", "Error retries", "Pagination", "Optimistic UI", "Caching concepts", "Server data boundaries", "Data project"]],
      ["Performance", ["Render costs", "React memo", "Stable props", "useMemo patterns", "useCallback patterns", "Virtual lists", "Code splitting", "Profiler basics", "Avoiding work", "Performance audit"]],
      ["Advanced Patterns", ["Compound components", "Controlled vs uncontrolled", "Portals", "Error boundaries", "Suspense basics", "Animations", "Accessibility patterns", "Testing components", "Design systems", "Advanced refactor"]],
      ["React Capstones", ["Todo app", "Quiz app", "Dashboard", "Settings page", "Search UI", "Modal flow", "Theme switcher", "Data table", "Performance pass", "Final React project"]],
    ],
  },
  {
    id: "node-backend",
    title: "Node.js & Backend Basics",
    category: "web-dev",
    icon: "server",
    color: "#4CAA00",
    description: "Create APIs, middleware, auth flows, and database-backed services.",
    sections: [
      ["Node Fundamentals", ["Runtime model", "npm basics", "Modules", "File system", "Path utilities", "Environment variables", "Process basics", "Streams intro", "Error handling", "Node project setup"]],
      ["HTTP Servers", ["HTTP basics", "Request and response", "Status codes", "Headers", "Routing by URL", "Body parsing", "JSON responses", "Static files", "CORS basics", "Server debugging"]],
      ["Express Routing", ["Express setup", "Route handlers", "Route params", "Query strings", "Controllers", "Router modules", "404 handlers", "Route organization", "Validation hooks", "Routing project"]],
      ["Middleware", ["Middleware chain", "Logging middleware", "Auth middleware", "Error middleware", "Request context", "Rate limit basics", "CORS middleware", "Compression", "Security headers", "Middleware audit"]],
      ["REST API Design", ["Resource naming", "CRUD routes", "HTTP verbs", "Pagination", "Filtering", "Sorting", "Validation errors", "Versioning", "OpenAPI basics", "REST project"]],
      ["Databases", ["Database choices", "Connection config", "SQL queries", "ORM basics", "Migrations", "Seeding", "Relationships", "Transactions", "Query errors", "Database project"]],
      ["Authentication", ["Passwords", "Hashing", "Sessions", "Cookies", "JWT basics", "Login routes", "Logout routes", "Protected routes", "Role checks", "Auth project"]],
      ["Testing APIs", ["Unit tests", "Integration tests", "Mocking", "Test databases", "Request tests", "Auth tests", "Error tests", "CI basics", "Coverage", "API test suite"]],
      ["Production Basics", ["Config management", "Logging", "Monitoring", "Health checks", "Graceful shutdown", "Deployment basics", "Secrets", "Performance", "Security review", "Production checklist"]],
      ["Backend Capstones", ["Notes API", "Auth API", "File upload API", "Leaderboard API", "Search API", "Webhook receiver", "Admin API", "Caching layer", "Observability pass", "Final backend project"]],
    ],
  },
  {
    id: "git-github",
    title: "Git & GitHub",
    category: "web-dev",
    icon: "git-branch",
    color: "#FF4B4B",
    description: "Track changes, collaborate through pull requests, and manage real workflows.",
    sections: [
      ["Git Foundations", ["Repositories", "git init", "Working tree", "Staging area", "Commits", "Commit messages", "git status", "git diff", "git log", "Undo basics"]],
      ["Branching", ["Branch mental model", "Create branches", "Switch branches", "Merge branches", "Fast-forward merges", "Delete branches", "Branch naming", "Remote branches", "Tracking branches", "Branch practice"]],
      ["Remote Repos", ["GitHub repo setup", "Remotes", "git clone", "git push", "git pull", "Fetch vs pull", "Origin main", "SSH basics", "PAT basics", "Remote troubleshooting"]],
      ["Collaboration", ["Pull requests", "PR descriptions", "Code review", "Requested changes", "Review comments", "Draft PRs", "Merge strategies", "Squash merges", "PR hygiene", "Collaboration project"]],
      ["Conflicts", ["Conflict causes", "Reading conflict markers", "Resolving text conflicts", "Resolving rename conflicts", "Conflict tools", "Abort merge", "Continue merge", "Conflict prevention", "Team conflict flow", "Conflict drills"]],
      ["Rebase", ["Rebase mental model", "Rebase branch", "Interactive rebase", "Squash commits", "Edit commits", "Reword commits", "Drop commits", "Rebase conflicts", "Force push safety", "Clean history"]],
      ["Stashing & Cherry Pick", ["git stash", "Apply stash", "Pop stash", "Stash conflicts", "Cherry-pick", "Cherry-pick conflicts", "Patch files", "Selective restore", "Worktree basics", "Recovery practice"]],
      ["GitHub Workflows", ["Issues", "Labels", "Milestones", "Projects", "Actions basics", "Branch protection", "CODEOWNERS", "Release tags", "Changelogs", "Workflow project"]],
      ["Release & Versioning", ["Semantic versioning", "Tags", "GitHub releases", "Hotfix branches", "Backports", "Release notes", "Rollback strategy", "Audit history", "Archive branches", "Release practice"]],
      ["Git Capstones", ["Solo repo cleanup", "Feature branch flow", "PR review flow", "Conflict simulation", "Rebase cleanup", "Release flow", "Hotfix flow", "Open source contribution", "Team workflow audit", "Final Git workflow"]],
    ],
  },
  {
    id: "python",
    title: "Python",
    category: "languages",
    icon: "file-code",
    color: "#1CB0F6",
    description: "Learn Python syntax, data structures, functions, files, and practical scripting.",
    sections: [
      ["Syntax & Variables", ["Running Python", "Variables", "Numbers", "Strings", "Booleans", "Operators", "Comments", "Input and print", "Type conversion", "Style basics"]],
      ["Control Flow", ["if statements", "else and elif", "Comparison operators", "Logical operators", "for loops", "while loops", "range", "break and continue", "Nested loops", "Control flow project"]],
      ["Data Structures", ["Lists", "List indexing", "List methods", "Tuples", "Dictionaries", "Dictionary methods", "Sets", "Membership tests", "Nested data", "Data structure project"]],
      ["Functions", ["Defining functions", "Parameters", "Return values", "Default args", "Keyword args", "args and kwargs", "Scope", "Docstrings", "Lambda basics", "Function project"]],
      ["OOP Basics", ["Classes", "Instances", "Attributes", "Methods", "Constructors", "Class variables", "Inheritance", "Method override", "Dunder methods", "OOP project"]],
      ["Files & Errors", ["Reading files", "Writing files", "Paths", "CSV basics", "JSON basics", "Exceptions", "try and except", "finally", "Custom errors", "File project"]],
      ["Comprehensions", ["List comprehensions", "Filtering comprehensions", "Nested comprehensions", "Dictionary comprehensions", "Set comprehensions", "Generator expressions", "zip", "enumerate", "Comprehension refactors", "Comprehension project"]],
      ["Modules & Packages", ["Imports", "Standard library", "Virtual environments", "pip basics", "Package structure", "Main guard", "Datetime", "Random", "Collections", "Module project"]],
      ["Testing & Tooling", ["Assertions", "pytest basics", "Test files", "Fixtures basics", "Debugging", "Formatting", "Linting", "Type hints", "CLI scripts", "Tooling project"]],
      ["Python Capstones", ["Text analyzer", "File organizer", "API client", "Data cleaner", "CLI quiz", "CSV report", "Automation script", "OOP mini app", "Tested package", "Final Python project"]],
    ],
  },
  {
    id: "c",
    title: "C",
    category: "languages",
    icon: "terminal",
    color: "#4B4B4B",
    description: "Build a low-level foundation with memory, pointers, arrays, and files.",
    sections: [
      ["Syntax & Types", ["Hello C", "Compilation", "Variables", "Primitive types", "printf", "scanf", "Operators", "Conditionals", "Loops", "Style basics"]],
      ["Functions", ["Function declarations", "Function definitions", "Parameters", "Return values", "Header files", "Scope", "Storage classes", "Recursion", "Function pointers intro", "Function project"]],
      ["Pointers Basics", ["Addresses", "Pointer variables", "Dereferencing", "Null pointers", "Pointer arithmetic", "Pointers and arrays", "Pointers and functions", "Const pointers", "Pointer pitfalls", "Pointer drills"]],
      ["Arrays & Strings", ["Arrays", "Array traversal", "Multidimensional arrays", "Char arrays", "String literals", "String functions", "Buffer sizes", "Input strings", "Array decay", "String project"]],
      ["Structs", ["Struct definitions", "Struct instances", "Nested structs", "Pointers to structs", "typedef", "Arrays of structs", "Struct functions", "Memory layout", "Unions intro", "Struct project"]],
      ["Dynamic Memory", ["malloc", "calloc", "realloc", "free", "Memory leaks", "Dangling pointers", "Ownership habits", "Dynamic arrays", "Valgrind basics", "Memory project"]],
      ["File I/O", ["fopen", "fclose", "Reading chars", "Reading lines", "Writing files", "Binary files", "File errors", "CSV parsing", "File positions", "File project"]],
      ["Preprocessor & Build", ["Macros", "Include guards", "Conditional compilation", "Make basics", "Make targets", "Object files", "Libraries intro", "Compiler flags", "Warnings", "Build project"]],
      ["Data Structures in C", ["Linked lists", "Stacks", "Queues", "Hash tables intro", "Trees intro", "Sorting arrays", "Searching arrays", "Generic void pointers", "Data ownership", "C data project"]],
      ["C Capstones", ["Text utilities", "Contact manager", "Mini shell intro", "Memory-safe parser", "Binary file tool", "Linked list library", "CSV report", "Makefile project", "Debugging pass", "Final C project"]],
    ],
  },
  {
    id: "cpp",
    title: "C++",
    category: "languages",
    icon: "binary",
    color: "#1899D6",
    description: "Move from C-style basics to OOP, STL, templates, and modern C++ practice.",
    sections: [
      ["C++ Foundations", ["Hello C++", "iostream", "Namespaces", "Variables", "References", "const", "auto", "Strings", "Control flow", "C vs C++ differences"]],
      ["Functions & References", ["Function overloads", "Default arguments", "Pass by value", "Pass by reference", "Const references", "Inline functions", "Lambda intro", "Recursion", "Header files", "Function practice"]],
      ["OOP", ["Classes", "Objects", "Constructors", "Destructors", "Access control", "Member functions", "Static members", "Inheritance", "Polymorphism", "OOP project"]],
      ["Memory & Ownership", ["Pointers", "References review", "new and delete", "RAII", "Smart pointers", "unique_ptr", "shared_ptr", "Move semantics intro", "Rule of three", "Ownership project"]],
      ["STL Containers", ["vector", "array", "deque", "list", "stack", "queue", "set", "map", "unordered_map", "Container choice"]],
      ["STL Algorithms", ["Iterators", "sort", "find", "count", "transform", "accumulate", "binary_search", "Custom comparators", "Algorithm complexity", "Algorithm project"]],
      ["Templates", ["Function templates", "Class templates", "Template parameters", "Specialization intro", "Type deduction", "Concepts intro", "Generic containers", "Template errors", "Template utilities", "Template project"]],
      ["Operator Overloading", ["Why overload", "Arithmetic operators", "Comparison operators", "Stream operators", "Assignment operator", "Index operator", "Call operator", "Conversion operators", "Overload pitfalls", "Overload project"]],
      ["Modern C++", ["Range-based loops", "Structured bindings", "optional", "variant", "string_view", "constexpr", "Modules concept", "Exceptions", "Testing basics", "Modern refactor"]],
      ["C++ Capstones", ["CLI calculator", "Vector library", "Inventory app", "STL challenge set", "Template matrix", "Smart pointer refactor", "File parser", "OOP game model", "Performance pass", "Final C++ project"]],
    ],
  },
  {
    id: "java",
    title: "Java",
    category: "languages",
    icon: "coffee",
    color: "#EA2B2B",
    description: "Learn Java syntax, OOP, collections, exceptions, and concurrency basics.",
    sections: [
      ["Java Foundations", ["JDK setup", "Hello Java", "Classes and files", "Variables", "Primitive types", "Strings", "Operators", "Input", "Conditionals", "Loops"]],
      ["Methods", ["Method syntax", "Parameters", "Return values", "Overloading", "Static methods", "Scope", "Recursion", "Math library", "String methods", "Method project"]],
      ["OOP Fundamentals", ["Classes", "Objects", "Constructors", "Fields", "Methods", "Encapsulation", "this keyword", "Packages", "Access modifiers", "OOP project"]],
      ["Inheritance & Polymorphism", ["Inheritance", "super", "Overriding", "Polymorphism", "Abstract classes", "Interfaces", "Composition", "Final keyword", "Object class", "Design practice"]],
      ["Collections", ["Arrays", "ArrayList", "LinkedList", "HashMap", "HashSet", "Iterator", "Collections utility", "Generics intro", "Comparable", "Collection project"]],
      ["Exceptions", ["Exception types", "try and catch", "finally", "throw", "throws", "Custom exceptions", "Resource handling", "Validation errors", "Error design", "Exception project"]],
      ["Files & Streams", ["File class", "Reading files", "Writing files", "Buffered IO", "Serialization intro", "Streams intro", "map and filter", "Collectors", "Lambda expressions", "File project"]],
      ["Testing & Tooling", ["Maven basics", "Gradle basics", "JUnit basics", "Assertions", "Test fixtures", "Debugging", "Formatting", "Packages", "JAR basics", "Tooling project"]],
      ["Multithreading Basics", ["Threads", "Runnable", "Synchronization", "Locks intro", "Executors", "Futures", "Race conditions", "Thread safety", "Concurrent collections", "Concurrency project"]],
      ["Java Capstones", ["Bank account model", "Library app", "Collections challenge", "File report tool", "REST client intro", "JUnit suite", "Concurrent counter", "OOP refactor", "Packaging pass", "Final Java project"]],
    ],
  },
  {
    id: "sql",
    title: "SQL",
    category: "languages",
    icon: "database",
    color: "#CE82FF",
    description: "Query, model, and reason about relational data with practical SQL.",
    sections: [
      ["SELECT Basics", ["Tables and rows", "SELECT columns", "WHERE filters", "Comparison operators", "Logical filters", "ORDER BY", "LIMIT", "DISTINCT", "Aliases", "Basic query drills"]],
      ["Joins", ["Primary keys", "Foreign keys", "INNER JOIN", "LEFT JOIN", "RIGHT JOIN concept", "FULL JOIN concept", "Self joins", "Multiple joins", "Join filters", "Join project"]],
      ["Aggregation", ["COUNT", "SUM", "AVG", "MIN and MAX", "GROUP BY", "HAVING", "Aggregate filters", "Grouped joins", "Rollup concept", "Report query project"]],
      ["Subqueries", ["Scalar subqueries", "IN subqueries", "EXISTS", "Correlated subqueries", "Subquery joins", "CTEs", "Recursive CTE intro", "Derived tables", "Subquery performance", "Subquery project"]],
      ["Data Modeling", ["Entities", "Relationships", "Keys", "Constraints", "One-to-many", "Many-to-many", "Junction tables", "Schema diagrams", "Naming conventions", "Modeling project"]],
      ["Normalization", ["Redundancy", "1NF", "2NF", "3NF", "BCNF concept", "Denormalization", "Integrity rules", "Anomaly detection", "Schema refactors", "Normalization project"]],
      ["Indexes", ["Index basics", "B-tree concept", "Composite indexes", "Index selectivity", "EXPLAIN basics", "Covering indexes", "Index tradeoffs", "Slow query analysis", "Index maintenance", "Index project"]],
      ["Transactions", ["ACID", "BEGIN and COMMIT", "ROLLBACK", "Isolation levels", "Locks", "Deadlocks", "Consistency checks", "Concurrent updates", "Transaction design", "Transaction project"]],
      ["Writing Data", ["INSERT", "UPDATE", "DELETE", "UPSERT concept", "RETURNING", "Bulk inserts", "Migrations basics", "Seed data", "Data cleanup", "Write query project"]],
      ["SQL Capstones", ["Analytics dashboard", "Inventory schema", "Leaderboard queries", "Reporting CTEs", "Search filters", "Optimization pass", "Transaction flow", "Data quality audit", "Schema migration", "Final SQL project"]],
    ],
  },
  {
    id: "dsa",
    title: "Data Structures & Algorithms",
    category: "core-cs",
    icon: "network",
    color: "#58CC02",
    description: "Practice the data structures and problem patterns behind technical interviews.",
    sections: [
      ["Arrays & Strings", ["Array traversal", "Two pointers", "Sliding window", "Prefix sums", "String traversal", "String frequency", "In-place updates", "Matrix basics", "Array edge cases", "Array challenge set"]],
      ["Linked Lists", ["Node structure", "Traversal", "Insertion", "Deletion", "Dummy nodes", "Fast and slow pointers", "Reverse list", "Cycle detection", "Merge lists", "Linked list challenges"]],
      ["Stacks & Queues", ["Stack basics", "Queue basics", "Deque", "Monotonic stack", "Valid parentheses", "Next greater element", "Queue simulation", "BFS queue usage", "Stack recursion", "Stack queue challenges"]],
      ["Hashing", ["Hash maps", "Hash sets", "Frequency maps", "Two-sum pattern", "Grouping", "Deduplication", "Prefix hash", "Collision concept", "Hash tradeoffs", "Hashing challenges"]],
      ["Trees", ["Tree nodes", "DFS traversal", "BFS traversal", "Binary search trees", "Tree height", "Balanced trees", "Lowest common ancestor", "Path sums", "Serialization concept", "Tree challenges"]],
      ["Heaps", ["Heap concept", "Priority queues", "Top K", "K-way merge", "Median stream", "Heap operations", "Min vs max heap", "Custom comparators", "Heap complexity", "Heap challenges"]],
      ["Graphs", ["Graph representation", "DFS", "BFS", "Visited sets", "Connected components", "Cycle detection", "Topological sort", "Shortest path basics", "Grid graphs", "Graph challenges"]],
      ["Sorting & Searching", ["Bubble and selection sort", "Insertion sort", "Merge sort", "Quick sort", "Counting sort", "Binary search", "Search boundaries", "Rotated arrays", "Sort stability", "Sort search challenges"]],
      ["Dynamic Programming", ["DP mindset", "Memoization", "Tabulation", "1D DP", "2D DP", "Knapsack basics", "Subsequence DP", "Grid DP", "State compression", "DP challenges"]],
      ["Greedy & Backtracking", ["Greedy choice", "Interval scheduling", "Heap greedy", "Sorting greedy", "Backtracking basics", "Permutations", "Combinations", "Subsets", "Pruning", "Capstone challenge set"]],
    ],
  },
  {
    id: "big-o",
    title: "Big-O & Complexity Analysis",
    category: "core-cs",
    icon: "sigma",
    color: "#FFC800",
    description: "Estimate runtime and memory with confidence across common code patterns.",
    sections: [
      ["Complexity Foundations", ["Why complexity matters", "Counting operations", "Input size", "Constants", "Dominant terms", "Big-O notation", "Big Omega", "Big Theta", "Comparing growth", "Complexity drills"]],
      ["Common Time Classes", ["O(1)", "O(log n)", "O(n)", "O(n log n)", "O(n^2)", "O(n^3)", "O(2^n)", "O(n!)", "Mixed terms", "Growth ordering"]],
      ["Loop Analysis", ["Single loops", "Nested loops", "Sequential loops", "Dependent loops", "Halving loops", "Early exits", "Amortized loops", "Loop invariants", "Loop pitfalls", "Loop analysis project"]],
      ["Recursion Analysis", ["Recursive calls", "Recurrence basics", "Call trees", "Divide and conquer", "Master theorem intro", "Tail recursion", "Branching recursion", "Memoized recursion", "Stack depth", "Recursion drills"]],
      ["Space Complexity", ["Auxiliary space", "Input space", "Stack space", "Arrays and copies", "Hash map space", "Recursion space", "In-place algorithms", "Output space", "Memory tradeoffs", "Space drills"]],
      ["Data Structure Costs", ["Array costs", "Linked list costs", "Hash table costs", "Tree costs", "Heap costs", "Graph costs", "String costs", "Queue costs", "Set costs", "Cost comparison"]],
      ["Best Worst Average", ["Case definitions", "Best case", "Worst case", "Average case", "Probabilistic inputs", "Sorting cases", "Search cases", "Hash cases", "Communicating cases", "Case drills"]],
      ["Pattern Recognition", ["Two pointers", "Sliding window", "Binary search", "DFS", "BFS", "Sorting first", "Heap top K", "DP states", "Backtracking branching", "Pattern drills"]],
      ["Tradeoffs", ["Time vs space", "Precomputation", "Caching", "Indexing", "Approximation", "Batch processing", "Parallelism concept", "Readability tradeoffs", "Optimization timing", "Tradeoff project"]],
      ["Complexity Capstones", ["Analyze snippets", "Compare solutions", "Refactor nested loops", "Optimize searches", "Memory audit", "Recurrence challenge", "Interview explanations", "Benchmark sanity check", "Complexity report", "Final complexity project"]],
    ],
  },
  {
    id: "operating-systems",
    title: "Operating Systems",
    category: "core-cs",
    icon: "cpu",
    color: "#1CB0F6",
    description: "Understand processes, threads, memory, scheduling, files, and concurrency.",
    sections: [
      ["OS Foundations", ["What an OS does", "Kernel vs user space", "System calls", "Boot process concept", "Processes", "Threads", "Context switching", "Interrupts", "Privilege levels", "OS vocabulary"]],
      ["Processes", ["Process states", "PCB concept", "Process creation", "fork concept", "exec concept", "IPC basics", "Pipes", "Signals", "Process termination", "Process drills"]],
      ["Threads", ["Thread model", "User vs kernel threads", "Shared memory", "Race conditions", "Critical sections", "Mutexes", "Semaphores", "Condition variables", "Thread pools", "Thread drills"]],
      ["Scheduling", ["Scheduling goals", "FCFS", "SJF", "Round robin", "Priority scheduling", "Multilevel queues", "Starvation", "Aging", "Realtime scheduling", "Scheduling comparison"]],
      ["Memory Management", ["Address spaces", "Stack and heap", "Paging", "Page tables", "TLB concept", "Segmentation concept", "Virtual memory", "Page faults", "Replacement policies", "Memory drills"]],
      ["Deadlocks", ["Deadlock definition", "Necessary conditions", "Resource allocation graph", "Deadlock prevention", "Deadlock avoidance", "Banker's algorithm concept", "Deadlock detection", "Recovery", "Livelock", "Deadlock drills"]],
      ["File Systems", ["Files and directories", "Inodes concept", "Blocks", "Permissions", "Links", "Mounting", "Journaling", "Caching", "Path resolution", "File system drills"]],
      ["I/O & Devices", ["Device drivers", "Polling vs interrupts", "DMA concept", "Disk scheduling", "Buffering", "Spooling", "Terminal IO", "Network IO", "Device files", "I/O project"]],
      ["Security & Protection", ["Access control", "Users and groups", "Permissions model", "Capabilities concept", "Sandboxing", "Process isolation", "Memory protection", "Audit logs", "Common attacks", "Security drills"]],
      ["OS Capstones", ["Scheduling simulator", "Memory trace analysis", "Deadlock detection", "File permission audit", "Thread race demo", "IPC design", "Virtual memory quiz", "OS debugging lab", "Concept map", "Final OS project"]],
    ],
  },
  {
    id: "networks",
    title: "Computer Networks",
    category: "core-cs",
    icon: "router",
    color: "#CE82FF",
    description: "Learn how data moves through HTTP, DNS, TCP/IP, sockets, and secure networks.",
    sections: [
      ["Network Foundations", ["Why networks", "Hosts and links", "Packets", "Latency", "Bandwidth", "Throughput", "Clients and servers", "Protocols", "Encapsulation", "Network vocabulary"]],
      ["Models", ["OSI overview", "TCP/IP overview", "Application layer", "Transport layer", "Network layer", "Link layer", "Physical layer concept", "Layer responsibilities", "Encapsulation drills", "Model comparison"]],
      ["HTTP & HTTPS", ["HTTP requests", "HTTP responses", "Methods", "Status codes", "Headers", "Cookies", "Caching", "TLS basics", "HTTP/2 concept", "HTTP debugging"]],
      ["DNS", ["Domain names", "Resolvers", "Root servers", "TLD servers", "Authoritative servers", "Record types", "TTL", "Caching", "DNS lookup flow", "DNS troubleshooting"]],
      ["TCP", ["TCP goals", "Three-way handshake", "Sequence numbers", "Acknowledgements", "Flow control", "Congestion control", "Retransmission", "Connection teardown", "TCP costs", "TCP drills"]],
      ["UDP", ["UDP goals", "Datagrams", "UDP vs TCP", "Loss tolerance", "Realtime apps", "DNS over UDP", "QUIC concept", "Reliability on UDP", "UDP tradeoffs", "UDP drills"]],
      ["IP & Routing", ["IP addresses", "Subnets", "CIDR", "Gateways", "Routing tables", "NAT", "IPv4 vs IPv6", "ICMP", "Traceroute concept", "Routing drills"]],
      ["Sockets", ["Socket concept", "Client sockets", "Server sockets", "Ports", "Binding", "Listening", "Accepting", "Blocking IO", "Socket errors", "Socket project"]],
      ["Security", ["TLS certificates", "Certificate chains", "Firewalls", "VPN concept", "DDoS basics", "CORS", "CSRF concept", "Secure headers", "Network monitoring", "Security drills"]],
      ["Network Capstones", ["HTTP inspector", "DNS trace", "Subnet planner", "Socket chat intro", "Packet flow diagram", "Latency analysis", "Cache behavior", "TLS walkthrough", "Troubleshooting lab", "Final networks project"]],
    ],
  },
  {
    id: "dbms",
    title: "Database Management",
    category: "core-cs",
    icon: "database-zap",
    color: "#4CAA00",
    description: "Design schemas, transactions, indexes, and query plans for dependable data systems.",
    sections: [
      ["DBMS Foundations", ["Why databases", "DBMS roles", "Relational model", "Tables and rows", "Schemas", "Keys", "Constraints", "Catalogs", "Users and roles", "DBMS vocabulary"]],
      ["ER Modeling", ["Entities", "Attributes", "Relationships", "Cardinality", "Weak entities", "Junction entities", "ER diagrams", "Mapping ER to tables", "Model validation", "ER project"]],
      ["Relational Design", ["Primary keys", "Foreign keys", "Unique constraints", "Check constraints", "Referential integrity", "Schema evolution", "Naming", "Domain modeling", "Tradeoffs", "Design drills"]],
      ["Normalization", ["Functional dependencies", "1NF", "2NF", "3NF", "BCNF", "4NF concept", "Decomposition", "Lossless joins", "Dependency preservation", "Normalization project"]],
      ["Transactions & ACID", ["Atomicity", "Consistency", "Isolation", "Durability", "Transaction logs", "Commit protocol", "Rollback", "Savepoints", "Consistency design", "ACID drills"]],
      ["Concurrency Control", ["Schedules", "Serializability", "Locks", "Two-phase locking", "Deadlocks", "Optimistic control", "MVCC", "Isolation anomalies", "Conflict detection", "Concurrency project"]],
      ["Indexing", ["Index purpose", "B-tree", "Hash index concept", "Composite index", "Clustered index concept", "Selectivity", "Covering index", "Index maintenance", "Index tradeoffs", "Index project"]],
      ["Query Optimization", ["Query plans", "EXPLAIN", "Join algorithms", "Predicate pushdown", "Statistics", "Cost estimates", "Slow queries", "Rewrite strategies", "Plan regression", "Optimization lab"]],
      ["NoSQL Basics", ["Document stores", "Key-value stores", "Wide-column stores", "Graph databases", "Consistency models", "Schema flexibility", "Replication concept", "Partitioning concept", "NoSQL tradeoffs", "NoSQL comparison"]],
      ["DBMS Capstones", ["ER to schema", "Normalize a design", "Transaction design", "Index a workload", "Optimize report query", "Isolation anomaly lab", "NoSQL choice memo", "Migration plan", "Data integrity audit", "Final DBMS project"]],
    ],
  },
  {
    id: "ood",
    title: "Object-Oriented Design",
    category: "core-cs",
    icon: "boxes",
    color: "#FF4B4B",
    description: "Model maintainable systems with objects, SOLID principles, and design patterns.",
    sections: [
      ["OOP Foundations", ["Objects", "Classes", "State and behavior", "Encapsulation", "Abstraction", "Inheritance", "Polymorphism", "Composition", "Coupling", "Cohesion"]],
      ["Class Design", ["Responsibilities", "Public APIs", "Private state", "Constructors", "Invariants", "Value objects", "Entities", "Services", "Naming", "Class design drills"]],
      ["Relationships", ["Association", "Aggregation", "Composition", "Inheritance tradeoffs", "Interfaces", "Abstract classes", "Dependency direction", "Object lifetimes", "Relationship diagrams", "Relationship project"]],
      ["SOLID Principles", ["Single responsibility", "Open closed", "Liskov substitution", "Interface segregation", "Dependency inversion", "SOLID smells", "Refactoring to SOLID", "Testing SOLID code", "SOLID tradeoffs", "SOLID project"]],
      ["Creational Patterns", ["Factory method", "Abstract factory", "Builder", "Prototype", "Singleton", "Dependency injection", "Object pools concept", "Pattern selection", "Pattern pitfalls", "Creational project"]],
      ["Structural Patterns", ["Adapter", "Facade", "Decorator", "Composite", "Proxy", "Bridge", "Flyweight concept", "Wrapper patterns", "Structural tradeoffs", "Structural project"]],
      ["Behavioral Patterns", ["Observer", "Strategy", "Command", "State", "Template method", "Iterator", "Mediator", "Chain of responsibility", "Visitor concept", "Behavioral project"]],
      ["UML & Communication", ["Class diagrams", "Sequence diagrams", "State diagrams", "Use cases", "CRC cards", "Architecture sketches", "Design docs", "Tradeoff notes", "Reviewing designs", "Diagram project"]],
      ["Refactoring", ["Code smells", "Extract class", "Extract method", "Replace inheritance", "Introduce interface", "Dependency cleanup", "Testing refactors", "Legacy seams", "Refactor plan", "Refactor project"]],
      ["OOD Capstones", ["Parking lot", "Library system", "Elevator model", "Notification system", "Game inventory", "Payment flow", "Ride sharing model", "Design review", "Refactor pass", "Final OOD project"]],
    ],
  },
  {
    id: "system-design",
    title: "System Design Basics",
    category: "core-cs",
    icon: "workflow",
    color: "#1CB0F6",
    description: "Learn the building blocks behind scalable, reliable product architecture.",
    sections: [
      ["Foundations", ["Requirements", "Functional vs nonfunctional", "Capacity estimates", "Latency goals", "Availability", "Reliability", "Consistency", "Tradeoff language", "Architecture diagrams", "Design interview flow"]],
      ["Networking for Systems", ["Clients and servers", "APIs", "HTTP basics", "DNS in systems", "CDNs", "WebSockets concept", "Rate limits", "Timeouts", "Retries", "Network tradeoffs"]],
      ["Load Balancing", ["Why load balance", "Layer 4 vs layer 7", "Round robin", "Least connections", "Health checks", "Sticky sessions", "Global balancing", "Failover", "Load balancer limits", "LB design drills"]],
      ["Caching", ["Cache purpose", "Client cache", "CDN cache", "Application cache", "Database cache", "Cache keys", "Invalidation", "TTL", "Cache stampede", "Caching project"]],
      ["Databases at Scale", ["Read replicas", "Sharding", "Partition keys", "Hot partitions", "Replication lag", "SQL vs NoSQL", "Indexes", "Transactions tradeoffs", "Data retention", "Data design drills"]],
      ["Queues & Async", ["Message queues", "Pub sub", "Background jobs", "Retries", "Dead letter queues", "Idempotency", "Ordering", "Backpressure", "Eventual consistency", "Queue project"]],
      ["Microservices", ["Monoliths", "Service boundaries", "API gateways", "Service discovery", "Distributed tracing", "Configuration", "Deployments", "Versioning", "Failure isolation", "Service tradeoffs"]],
      ["Reliability", ["SLOs", "SLIs", "Error budgets", "Circuit breakers", "Bulkheads", "Graceful degradation", "Incident response", "Monitoring", "Alerting", "Reliability drills"]],
      ["Security & Privacy", ["Authentication", "Authorization", "Secrets", "Encryption", "Audit logs", "Input validation", "Abuse prevention", "Data privacy", "Threat modeling", "Security review"]],
      ["System Design Capstones", ["URL shortener", "News feed", "Chat system", "Leaderboard", "File storage", "Notification system", "Ride matching", "Analytics pipeline", "Design critique", "Final system design project"]],
    ],
  },
];

const placementQuestions = [
  {
    id: "placement-javascript-1",
    trackId: "javascript",
    sectionOrder: 1,
    type: "multiple_choice",
    prompt: "Which declaration can be reassigned but is block-scoped?",
    options: ["var", "let", "const", "function"],
    correctAnswer: "let",
    explanation: "let is block-scoped and allows reassignment. const is block-scoped but cannot be reassigned.",
    difficulty: "easy",
  },
  {
    id: "placement-javascript-2",
    trackId: "javascript",
    sectionOrder: 2,
    type: "predict_output",
    prompt: "What does this log?",
    codeSnippet: "const score = 0;\nconsole.log(score || 10);",
    options: ["0", "10", "undefined", "false"],
    correctAnswer: "10",
    explanation: "0 is falsy, so the || expression returns the fallback value 10.",
    difficulty: "easy",
  },
  {
    id: "placement-javascript-3",
    trackId: "javascript",
    sectionOrder: 3,
    type: "fill_blank",
    prompt: "Fill the blank to return a value from the function.",
    codeSnippet: "function double(n) {\n  ____ n * 2;\n}",
    correctAnswer: "return",
    explanation: "A function sends a value back to its caller with return.",
    difficulty: "easy",
  },
  {
    id: "placement-javascript-4",
    trackId: "javascript",
    sectionOrder: 4,
    type: "multiple_choice",
    prompt: "Which array method creates a new array by transforming every item?",
    options: ["forEach", "map", "push", "find"],
    correctAnswer: "map",
    explanation: "map returns a new array with one transformed value for each source item.",
    difficulty: "medium",
  },
  {
    id: "placement-javascript-5",
    trackId: "javascript",
    sectionOrder: 5,
    type: "predict_output",
    prompt: "What does this log?",
    codeSnippet: "const user = { name: 'Ada' };\nconst copy = { ...user, role: 'dev' };\nconsole.log(copy.name);",
    options: ["Ada", "dev", "undefined", "user"],
    correctAnswer: "Ada",
    explanation: "The spread copies name into the new object, then role is added.",
    difficulty: "medium",
  },
  {
    id: "placement-javascript-6",
    trackId: "javascript",
    sectionOrder: 6,
    type: "multiple_choice",
    prompt: "Which event behavior lets a click on a child element also reach its parent?",
    options: ["Debouncing", "Bubbling", "Hoisting", "Serialization"],
    correctAnswer: "Bubbling",
    explanation: "Event bubbling moves an event from the target element up through its ancestors.",
    difficulty: "medium",
  },
  {
    id: "placement-javascript-7",
    trackId: "javascript",
    sectionOrder: 7,
    type: "predict_output",
    prompt: "What does this async function resolve to?",
    codeSnippet: "async function load() {\n  return 42;\n}\nload().then(console.log);",
    options: ["42", "Promise", "undefined", "Error"],
    correctAnswer: "42",
    explanation: "async functions wrap returned values in a resolved Promise.",
    difficulty: "medium",
  },
  {
    id: "placement-javascript-8",
    trackId: "javascript",
    sectionOrder: 8,
    type: "multiple_choice",
    prompt: "What does a closure let a function keep access to?",
    options: ["Only global variables", "Variables from its lexical scope", "Only DOM nodes", "The latest HTTP response"],
    correctAnswer: "Variables from its lexical scope",
    explanation: "Closures preserve access to variables from the scope where a function was created.",
    difficulty: "hard",
  },
  {
    id: "placement-javascript-9",
    trackId: "javascript",
    sectionOrder: 9,
    type: "fill_blank",
    prompt: "Fill the blank to export a function from an ES module.",
    codeSnippet: "____ function sum(a, b) {\n  return a + b;\n}",
    correctAnswer: "export",
    explanation: "The export keyword makes a binding available to other modules.",
    difficulty: "hard",
  },
  {
    id: "placement-javascript-10",
    trackId: "javascript",
    sectionOrder: 10,
    type: "multiple_choice",
    prompt: "Which practice helps prevent a fetch request from updating state after a component unmounts?",
    options: ["AbortController", "parseInt", "Object.freeze", "setInterval"],
    correctAnswer: "AbortController",
    explanation: "AbortController can cancel in-flight requests during cleanup.",
    difficulty: "hard",
  },
  {
    id: "placement-python-1",
    trackId: "python",
    sectionOrder: 1,
    type: "predict_output",
    prompt: "What does this print?",
    codeSnippet: "name = 'Ada'\nprint(f'Hi {name}')",
    options: ["Hi Ada", "Hi {name}", "Ada Hi", "Error"],
    correctAnswer: "Hi Ada",
    explanation: "An f-string evaluates expressions inside braces.",
    difficulty: "easy",
  },
  {
    id: "placement-python-2",
    trackId: "python",
    sectionOrder: 2,
    type: "multiple_choice",
    prompt: "Which loop is best when you know you want to visit every item in a list?",
    options: ["for item in list", "while True only", "try loop", "class loop"],
    correctAnswer: "for item in list",
    explanation: "Python for loops iterate directly over iterable values like lists.",
    difficulty: "easy",
  },
  {
    id: "placement-python-3",
    trackId: "python",
    sectionOrder: 3,
    type: "multiple_choice",
    prompt: "Which data structure stores key-value pairs?",
    options: ["list", "tuple", "dict", "set"],
    correctAnswer: "dict",
    explanation: "A dictionary maps keys to values.",
    difficulty: "easy",
  },
  {
    id: "placement-python-4",
    trackId: "python",
    sectionOrder: 4,
    type: "fill_blank",
    prompt: "Fill the blank to define a function.",
    codeSnippet: "____ greet(name):\n    return 'Hi ' + name",
    correctAnswer: "def",
    explanation: "Python function definitions start with def.",
    difficulty: "medium",
  },
  {
    id: "placement-dsa-1",
    trackId: "dsa",
    sectionOrder: 1,
    type: "multiple_choice",
    prompt: "Which pattern often solves 'longest substring without repeating characters'?",
    options: ["Sliding window", "Binary heap", "Topological sort", "Union find"],
    correctAnswer: "Sliding window",
    explanation: "A sliding window tracks a moving range while maintaining constraints.",
    difficulty: "medium",
  },
  {
    id: "placement-dsa-2",
    trackId: "dsa",
    sectionOrder: 4,
    type: "multiple_choice",
    prompt: "Which data structure gives average O(1) lookup by key?",
    options: ["Array", "Hash map", "Linked list", "Stack"],
    correctAnswer: "Hash map",
    explanation: "Hash maps use a hash function to find keys in average constant time.",
    difficulty: "easy",
  },
  {
    id: "placement-html-css-1",
    trackId: "html-css",
    sectionOrder: 1,
    type: "multiple_choice",
    prompt: "Which element best represents page navigation links?",
    options: ["div", "nav", "span", "b"],
    correctAnswer: "nav",
    explanation: "nav communicates that a region contains navigation links.",
    difficulty: "easy",
  },
  {
    id: "placement-html-css-2",
    trackId: "html-css",
    sectionOrder: 4,
    type: "multiple_choice",
    prompt: "Which flexbox property distributes items along the main axis?",
    options: ["align-items", "justify-content", "font-weight", "z-index"],
    correctAnswer: "justify-content",
    explanation: "justify-content controls spacing along the main axis in a flex container.",
    difficulty: "medium",
  },
];

const fallbackQuestions = [
  {
    id: "placement-generic-1",
    trackId: "generic",
    sectionOrder: 1,
    type: "multiple_choice",
    prompt: "What should you do first when learning a new technical topic?",
    options: ["Memorize random facts", "Understand the core vocabulary", "Skip examples", "Ignore errors"],
    correctAnswer: "Understand the core vocabulary",
    explanation: "Vocabulary gives you handles for the ideas you will practice in later units.",
    difficulty: "easy",
  },
  {
    id: "placement-generic-2",
    trackId: "generic",
    sectionOrder: 2,
    type: "multiple_choice",
    prompt: "What is the best sign that a concept is ready for harder practice?",
    options: ["You can explain and apply it", "You saw it once", "It has a short name", "It appears in a table"],
    correctAnswer: "You can explain and apply it",
    explanation: "Placement should reward applied understanding, not just recognition.",
    difficulty: "medium",
  },
];

function slugify(value) {
  return value
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function makeLessons(trackId, sectionOrder, unitOrder, unitId, unitTitle) {
  const baseExercise = `${trackId}-s${sectionOrder}-u${unitOrder}-sample`;
  const exerciseIds =
    trackId === "javascript" && sectionOrder === 3 && unitOrder === 1
      ? [
          "js-functions-mc-declaration",
          "js-functions-fill-return",
          "js-functions-spot-bug",
          "js-functions-predict-output",
          "js-functions-drag-reorder",
          "js-functions-type-function",
        ]
      : sectionOrder === 1 && unitOrder <= 3
        ? [baseExercise]
        : [];
  return [
    {
      id: `${unitId}-lesson-1`,
      unitId,
      title: `Learn ${unitTitle}`,
      order: 1,
      exerciseIds,
    },
    {
      id: `${unitId}-lesson-2`,
      unitId,
      title: `Practice ${unitTitle}`,
      order: 2,
      exerciseIds: [],
    },
    {
      id: `${unitId}-lesson-3`,
      unitId,
      title: `Review ${unitTitle}`,
      order: 3,
      exerciseIds: [],
    },
  ];
}

function buildTrack(track) {
  if (track.sections.length !== 10) {
    throw new Error(`${track.id} must have exactly 10 sections.`);
  }

  return {
    id: track.id,
    title: track.title,
    category: track.category,
    icon: track.icon,
    color: track.color,
    description: track.description,
    sections: track.sections.map(([sectionTitle, units], sectionIndex) => {
      if (units.length !== 10) {
        throw new Error(`${track.id} ${sectionTitle} must have exactly 10 units.`);
      }

      const sectionOrder = sectionIndex + 1;
      const sectionId = `${track.id}-section-${sectionOrder}`;

      return {
        id: sectionId,
        trackId: track.id,
        order: sectionOrder,
        title: `Section ${sectionOrder}: ${sectionTitle}`,
        bannerColor: track.color,
        units: units.map((unitTitle, unitIndex) => {
          const unitOrder = unitIndex + 1;
          const unitId = `${sectionId}-unit-${unitOrder}-${slugify(unitTitle)}`;

          return {
            id: unitId,
            sectionId,
            order: unitOrder,
            title: unitTitle,
            lessons: makeLessons(track.id, sectionOrder, unitOrder, unitId, unitTitle),
          };
        }),
      };
    }),
  };
}

function makeSampleExercises(track) {
  const samples = [];
  for (const section of track.sections.slice(0, 1)) {
    for (const unit of section.units.slice(0, 3)) {
      samples.push({
        id: `${track.id}-s${section.order}-u${unit.order}-sample`,
        type: "multiple_choice",
        prompt: `Which topic does "${unit.title}" belong to in ${track.title}?`,
        options: [
          unit.title,
          "Account billing",
          "Image compression",
          "Office formatting",
        ],
        correctAnswer: unit.title,
        explanation: `${unit.title} is part of ${section.title} in the ${track.title} track.`,
        difficulty: "easy",
      });
    }
  }
  return samples;
}

await mkdir(tracksDir, { recursive: true });
await mkdir(exercisesDir, { recursive: true });

const builtTracks = tracks.map(buildTrack);
for (const track of builtTracks) {
  await writeFile(
    path.join(tracksDir, `${track.id}.json`),
    `${JSON.stringify(track, null, 2)}\n`,
  );
}

const sampleExercises = builtTracks.flatMap(makeSampleExercises);
await writeFile(
  path.join(exercisesDir, "sample.json"),
  `${JSON.stringify(sampleExercises, null, 2)}\n`,
);
await writeFile(
  path.join(exercisesDir, "placement.json"),
  `${JSON.stringify(placementQuestions, null, 2)}\n`,
);
await writeFile(
  path.join(exercisesDir, "placement-fallback.json"),
  `${JSON.stringify(fallbackQuestions, null, 2)}\n`,
);

console.log(`Generated ${builtTracks.length} tracks across ${Object.keys(categoryLabels).length} categories.`);
