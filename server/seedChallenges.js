const mongoose = require("mongoose");
const dotenv = require("dotenv");
const Challenge = require("./models/Challenge");

dotenv.config();

const challenges = [
  // ─── JavaScript ────────────────────────────────
  {
    title: "What is the output of typeof null?",
    description: "JavaScript has a well-known quirk with the typeof operator when used on null values.",
    skillTag: "JavaScript",
    difficulty: "easy",
    options: ["\"null\"", "\"undefined\"", "\"object\"", "\"boolean\""],
    correctAnswer: "\"object\"",
    xpReward: 100,
  },
  {
    title: "What does Array.prototype.reduce() do?",
    description: "Understanding higher-order array methods is essential for modern JS development.",
    skillTag: "JavaScript",
    difficulty: "easy",
    options: [
      "Filters elements from an array",
      "Executes a reducer function on each element, resulting in a single output",
      "Creates a new array with transformed elements",
      "Sorts the array in place",
    ],
    correctAnswer: "Executes a reducer function on each element, resulting in a single output",
    xpReward: 100,
  },
  {
    title: "What is a closure in JavaScript?",
    description: "Closures are a fundamental concept that enables powerful patterns in JS.",
    skillTag: "JavaScript",
    difficulty: "medium",
    options: [
      "A function that has no return value",
      "A function bundled with its lexical environment",
      "A way to close a browser window",
      "A method to end a loop",
    ],
    correctAnswer: "A function bundled with its lexical environment",
    xpReward: 100,
  },
  {
    title: "What is the event loop in JavaScript?",
    description: "The event loop is crucial for understanding async behavior in JS.",
    skillTag: "JavaScript",
    difficulty: "hard",
    options: [
      "A loop that listens for DOM events",
      "A mechanism that handles async callbacks via a call stack and task queue",
      "A for...of loop for iterating events",
      "A built-in timer function",
    ],
    correctAnswer: "A mechanism that handles async callbacks via a call stack and task queue",
    xpReward: 150,
  },
  {
    title: "What is the difference between == and === in JavaScript?",
    description: "Understanding type coercion is key to writing bug-free JavaScript.",
    skillTag: "JavaScript",
    difficulty: "easy",
    options: [
      "There is no difference",
      "== checks value only, === checks value and type",
      "=== checks value only, == checks value and type",
      "== is used for strings, === for numbers",
    ],
    correctAnswer: "== checks value only, === checks value and type",
    xpReward: 100,
  },

  // ─── React ─────────────────────────────────────
  {
    title: "What hook replaces componentDidMount in functional components?",
    description: "React Hooks revolutionized how we write React components.",
    skillTag: "React",
    difficulty: "easy",
    options: ["useState", "useEffect", "useRef", "useMemo"],
    correctAnswer: "useEffect",
    xpReward: 100,
  },
  {
    title: "What is the purpose of React.memo()?",
    description: "Performance optimization in React requires understanding memoization.",
    skillTag: "React",
    difficulty: "medium",
    options: [
      "To store global state",
      "To prevent unnecessary re-renders of functional components",
      "To create memoized variables",
      "To handle side effects",
    ],
    correctAnswer: "To prevent unnecessary re-renders of functional components",
    xpReward: 100,
  },
  {
    title: "What is the virtual DOM?",
    description: "The virtual DOM is a core concept behind React's efficient rendering.",
    skillTag: "React",
    difficulty: "medium",
    options: [
      "A copy of the real DOM stored in the browser cache",
      "A lightweight JS representation of the real DOM used for diffing",
      "A server-side representation of HTML",
      "A CSS rendering engine",
    ],
    correctAnswer: "A lightweight JS representation of the real DOM used for diffing",
    xpReward: 100,
  },
  {
    title: "What does the useCallback hook do?",
    description: "Understanding when to memoize callbacks prevents performance pitfalls.",
    skillTag: "React",
    difficulty: "hard",
    options: [
      "Calls a function immediately on mount",
      "Returns a memoized version of a callback that only changes if dependencies change",
      "Creates a callback queue for async operations",
      "Handles error boundaries in functional components",
    ],
    correctAnswer: "Returns a memoized version of a callback that only changes if dependencies change",
    xpReward: 150,
  },
  {
    title: "What is the Context API used for?",
    description: "Managing state across component trees without prop drilling.",
    skillTag: "React",
    difficulty: "easy",
    options: [
      "To make API calls",
      "To share state across components without prop drilling",
      "To create database connections",
      "To manage CSS styles",
    ],
    correctAnswer: "To share state across components without prop drilling",
    xpReward: 100,
  },

  // ─── Node.js ───────────────────────────────────
  {
    title: "What is middleware in Express.js?",
    description: "Middleware is the backbone of Express application architecture.",
    skillTag: "Node.js",
    difficulty: "easy",
    options: [
      "A database connector",
      "Functions that execute during the request-response cycle",
      "A frontend framework",
      "A testing utility",
    ],
    correctAnswer: "Functions that execute during the request-response cycle",
    xpReward: 100,
  },
  {
    title: "What does the 'cluster' module do in Node.js?",
    description: "Scaling Node.js applications requires understanding the cluster module.",
    skillTag: "Node.js",
    difficulty: "hard",
    options: [
      "Connects to a database cluster",
      "Allows creating child processes that share the same server port",
      "Groups related files together",
      "Manages npm packages",
    ],
    correctAnswer: "Allows creating child processes that share the same server port",
    xpReward: 150,
  },
  {
    title: "What is the purpose of package.json?",
    description: "Every Node.js project starts with understanding package.json.",
    skillTag: "Node.js",
    difficulty: "easy",
    options: [
      "To store environment variables",
      "To define project metadata, scripts, and dependencies",
      "To configure the database",
      "To compile TypeScript",
    ],
    correctAnswer: "To define project metadata, scripts, and dependencies",
    xpReward: 100,
  },
  {
    title: "What is the difference between process.nextTick() and setImmediate()?",
    description: "Understanding the Node.js event loop internals is crucial for advanced development.",
    skillTag: "Node.js",
    difficulty: "hard",
    options: [
      "They are identical in behavior",
      "nextTick fires before I/O callbacks, setImmediate fires after",
      "setImmediate fires before I/O callbacks, nextTick fires after",
      "nextTick is deprecated in favor of setImmediate",
    ],
    correctAnswer: "nextTick fires before I/O callbacks, setImmediate fires after",
    xpReward: 150,
  },

  // ─── Python ────────────────────────────────────
  {
    title: "What is a list comprehension in Python?",
    description: "Pythonic code leverages list comprehensions for concise data transformations.",
    skillTag: "Python",
    difficulty: "easy",
    options: [
      "A way to create lists using a for loop in a single line",
      "A method to sort lists",
      "A function to merge two lists",
      "A tool to compress lists",
    ],
    correctAnswer: "A way to create lists using a for loop in a single line",
    xpReward: 100,
  },
  {
    title: "What is the GIL in Python?",
    description: "The Global Interpreter Lock is important for understanding Python concurrency.",
    skillTag: "Python",
    difficulty: "hard",
    options: [
      "A graphics rendering library",
      "A mutex that protects access to Python objects, preventing multiple threads from executing simultaneously",
      "A global import library",
      "A garbage collection mechanism",
    ],
    correctAnswer: "A mutex that protects access to Python objects, preventing multiple threads from executing simultaneously",
    xpReward: 150,
  },
  {
    title: "What does 'self' refer to in a Python class?",
    description: "Understanding object-oriented Python starts with the self parameter.",
    skillTag: "Python",
    difficulty: "easy",
    options: [
      "The parent class",
      "The current instance of the class",
      "A global variable",
      "The module itself",
    ],
    correctAnswer: "The current instance of the class",
    xpReward: 100,
  },

  // ─── CSS ───────────────────────────────────────
  {
    title: "What is the CSS Box Model?",
    description: "The box model is foundational to understanding CSS layout.",
    skillTag: "CSS",
    difficulty: "easy",
    options: [
      "A 3D rendering model",
      "Content, padding, border, and margin layers around an element",
      "A flexbox container",
      "A grid layout system",
    ],
    correctAnswer: "Content, padding, border, and margin layers around an element",
    xpReward: 100,
  },
  {
    title: "What is the difference between Flexbox and Grid?",
    description: "Choosing the right layout system is key to responsive design.",
    skillTag: "CSS",
    difficulty: "medium",
    options: [
      "They are the same thing",
      "Flexbox is 1D (row or column), Grid is 2D (rows and columns)",
      "Grid is only for images, Flexbox is for text",
      "Flexbox is newer than Grid",
    ],
    correctAnswer: "Flexbox is 1D (row or column), Grid is 2D (rows and columns)",
    xpReward: 100,
  },
  {
    title: "What does 'position: sticky' do?",
    description: "Sticky positioning combines relative and fixed behavior.",
    skillTag: "CSS",
    difficulty: "medium",
    options: [
      "Makes an element invisible",
      "Toggles between relative and fixed based on scroll position",
      "Sticks the element to the bottom of the page",
      "Prevents the element from being clicked",
    ],
    correctAnswer: "Toggles between relative and fixed based on scroll position",
    xpReward: 100,
  },

  // ─── MongoDB ───────────────────────────────────
  {
    title: "What is the difference between SQL and NoSQL databases?",
    description: "Choosing the right database paradigm impacts your entire architecture.",
    skillTag: "MongoDB",
    difficulty: "easy",
    options: [
      "SQL stores data in tables with schemas; NoSQL uses flexible document structures",
      "NoSQL is always faster than SQL",
      "SQL databases cannot scale horizontally",
      "There is no practical difference",
    ],
    correctAnswer: "SQL stores data in tables with schemas; NoSQL uses flexible document structures",
    xpReward: 100,
  },
  {
    title: "What does the $lookup stage do in a MongoDB aggregation pipeline?",
    description: "Aggregation pipelines are powerful tools for data processing in MongoDB.",
    skillTag: "MongoDB",
    difficulty: "hard",
    options: [
      "Searches for text within documents",
      "Performs a left outer join with another collection",
      "Looks up an index for optimization",
      "Validates document schemas",
    ],
    correctAnswer: "Performs a left outer join with another collection",
    xpReward: 150,
  },
  {
    title: "What is an index in MongoDB?",
    description: "Database indexing is essential for query performance.",
    skillTag: "MongoDB",
    difficulty: "medium",
    options: [
      "A backup copy of the database",
      "A data structure that improves the speed of data retrieval",
      "A unique identifier for documents",
      "A type of collection",
    ],
    correctAnswer: "A data structure that improves the speed of data retrieval",
    xpReward: 100,
  },

  // ─── TypeScript ────────────────────────────────
  {
    title: "What is the main benefit of TypeScript over JavaScript?",
    description: "TypeScript adds a crucial layer to JavaScript development.",
    skillTag: "TypeScript",
    difficulty: "easy",
    options: [
      "Faster runtime performance",
      "Static type checking at compile time",
      "Built-in database support",
      "Automatic code formatting",
    ],
    correctAnswer: "Static type checking at compile time",
    xpReward: 100,
  },
  {
    title: "What is a generic in TypeScript?",
    description: "Generics enable reusable, type-safe code components.",
    skillTag: "TypeScript",
    difficulty: "medium",
    options: [
      "A default export type",
      "A way to create reusable components that work with multiple types",
      "A built-in TypeScript interface",
      "A testing framework feature",
    ],
    correctAnswer: "A way to create reusable components that work with multiple types",
    xpReward: 100,
  },

  // ─── Git ───────────────────────────────────────
  {
    title: "What does 'git rebase' do?",
    description: "Understanding git rebase vs merge is crucial for clean commit history.",
    skillTag: "Git",
    difficulty: "medium",
    options: [
      "Deletes a branch",
      "Re-applies commits on top of another base commit",
      "Creates a new repository",
      "Reverts the last commit",
    ],
    correctAnswer: "Re-applies commits on top of another base commit",
    xpReward: 100,
  },
  {
    title: "What is a Git merge conflict?",
    description: "Handling merge conflicts is a daily reality in collaborative development.",
    skillTag: "Git",
    difficulty: "easy",
    options: [
      "When git cannot automatically merge changes because the same lines were modified",
      "When a branch is deleted",
      "When the repository runs out of space",
      "When two people push at the same time",
    ],
    correctAnswer: "When git cannot automatically merge changes because the same lines were modified",
    xpReward: 100,
  },

  // ─── Docker ────────────────────────────────────
  {
    title: "What is the difference between a Docker image and a container?",
    description: "Understanding Docker fundamentals is essential for modern DevOps.",
    skillTag: "Docker",
    difficulty: "medium",
    options: [
      "They are the same thing",
      "An image is a blueprint; a container is a running instance of that image",
      "A container is stored on disk; an image runs in memory",
      "Images are for production, containers for development",
    ],
    correctAnswer: "An image is a blueprint; a container is a running instance of that image",
    xpReward: 100,
  },

  // ─── SQL ───────────────────────────────────────
  {
    title: "What is a JOIN in SQL?",
    description: "JOINs are fundamental to relational database queries.",
    skillTag: "SQL",
    difficulty: "easy",
    options: [
      "A way to combine rows from two or more tables based on a related column",
      "A method to insert data into multiple tables",
      "A command to create new columns",
      "A backup operation",
    ],
    correctAnswer: "A way to combine rows from two or more tables based on a related column",
    xpReward: 100,
  },
  {
    title: "What is database normalization?",
    description: "Normalization reduces redundancy and improves data integrity.",
    skillTag: "SQL",
    difficulty: "hard",
    options: [
      "Making all column names lowercase",
      "Organizing data to minimize redundancy by dividing into related tables",
      "Compressing the database file size",
      "Converting data types to strings",
    ],
    correctAnswer: "Organizing data to minimize redundancy by dividing into related tables",
    xpReward: 150,
  },

  // ─── HTML ──────────────────────────────────────
  {
    title: "What is semantic HTML?",
    description: "Semantic HTML improves accessibility and SEO.",
    skillTag: "HTML",
    difficulty: "easy",
    options: [
      "HTML that uses only div elements",
      "Using HTML elements that convey meaning about the content (e.g., <article>, <nav>)",
      "HTML with inline CSS",
      "Minified HTML code",
    ],
    correctAnswer: "Using HTML elements that convey meaning about the content (e.g., <article>, <nav>)",
    xpReward: 100,
  },
];

const seedDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB Connected...");

    // Clear existing challenges
    await Challenge.deleteMany({});
    console.log("Old challenges removed");

    // Insert new challenges
    await Challenge.insertMany(challenges);
    console.log(`${challenges.length} challenges seeded successfully!`);

    process.exit();
  } catch (error) {
    console.error("Error seeding challenges: ", error.message);
    process.exit(1);
  }
};

seedDB();
