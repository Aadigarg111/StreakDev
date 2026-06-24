import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const trackPath = path.join(root, "content", "tracks", "sql.json");
const exercisesPath = path.join(root, "content", "exercises", "sql.json");
const track = JSON.parse(fs.readFileSync(trackPath, "utf8"));

const domains = [
  {
    table: "orders",
    alias: "o",
    id: "order_id",
    label: "customer_id",
    metric: "total_cents",
    status: "status",
    date: "created_at",
    sampleA: "paid",
    sampleB: "refunded",
  },
  {
    table: "tickets",
    alias: "t",
    id: "ticket_id",
    label: "assignee_id",
    metric: "priority",
    status: "state",
    date: "opened_at",
    sampleA: "open",
    sampleB: "closed",
  },
  {
    table: "shipments",
    alias: "s",
    id: "shipment_id",
    label: "warehouse_id",
    metric: "weight_kg",
    status: "delivery_status",
    date: "shipped_at",
    sampleA: "in_transit",
    sampleB: "delivered",
  },
  {
    table: "subscriptions",
    alias: "sub",
    id: "subscription_id",
    label: "account_id",
    metric: "monthly_cents",
    status: "plan_state",
    date: "started_at",
    sampleA: "active",
    sampleB: "paused",
  },
  {
    table: "sensor_readings",
    alias: "r",
    id: "reading_id",
    label: "device_id",
    metric: "temperature_c",
    status: "quality",
    date: "recorded_at",
    sampleA: "valid",
    sampleB: "suspect",
  },
  {
    table: "invoices",
    alias: "i",
    id: "invoice_id",
    label: "client_id",
    metric: "amount_due",
    status: "payment_status",
    date: "issued_at",
    sampleA: "unpaid",
    sampleB: "paid",
  },
  {
    table: "lessons",
    alias: "l",
    id: "lesson_id",
    label: "track_id",
    metric: "xp_reward",
    status: "difficulty",
    date: "published_at",
    sampleA: "beginner",
    sampleB: "advanced",
  },
  {
    table: "experiments",
    alias: "e",
    id: "experiment_id",
    label: "owner_id",
    metric: "conversion_rate",
    status: "phase",
    date: "started_at",
    sampleA: "running",
    sampleB: "archived",
  },
];

const sectionFocus = {
  1: {
    focus: "SELECT basics",
    easyA: "SELECT reads rows from a table and returns only the columns you ask for.",
    easyB: "WHERE filters rows before they are returned.",
    nuance: "SQL evaluates filters before sorting and limiting the final result.",
  },
  2: {
    focus: "joins",
    easyA: "A join combines related rows by matching key values from two tables.",
    easyB: "INNER JOIN keeps only rows that find a match on both sides.",
    nuance: "Filters on the right table in WHERE can accidentally turn a LEFT JOIN into inner-join behavior.",
  },
  3: {
    focus: "aggregation",
    easyA: "Aggregate functions summarize many rows into one value.",
    easyB: "GROUP BY creates one aggregate result per group.",
    nuance: "HAVING filters groups after aggregation; WHERE filters rows before aggregation.",
  },
  4: {
    focus: "subqueries",
    easyA: "A subquery lets one query feed values into another query.",
    easyB: "CTEs give a named, readable query block that the outer query can use.",
    nuance: "EXISTS is often a good fit when you only care that a related row is present.",
  },
  5: {
    focus: "data modeling",
    easyA: "A schema describes entities, attributes, and relationships.",
    easyB: "Keys and constraints protect the meaning of stored data.",
    nuance: "Modeling choices shape the queries and integrity guarantees the database can enforce.",
  },
  6: {
    focus: "normalization",
    easyA: "Normalization reduces duplicated facts and update anomalies.",
    easyB: "Each table should store facts about one kind of entity or relationship.",
    nuance: "Denormalization can speed reads, but it requires extra discipline to keep copied data consistent.",
  },
  7: {
    focus: "indexes",
    easyA: "An index is a lookup structure that can reduce the rows a query scans.",
    easyB: "Composite index column order matters because the leftmost columns guide lookup.",
    nuance: "Indexes speed selected reads but add storage and write-maintenance cost.",
  },
  8: {
    focus: "transactions",
    easyA: "A transaction groups changes so they commit or roll back together.",
    easyB: "ACID properties describe reliability expectations for transactional work.",
    nuance: "Isolation levels trade off concurrency with protection from read anomalies.",
  },
  9: {
    focus: "writing data",
    easyA: "INSERT, UPDATE, and DELETE change stored rows.",
    easyB: "A safe write statement targets exactly the intended rows.",
    nuance: "Migrations and bulk writes should be reversible or carefully audited before launch.",
  },
  10: {
    focus: "capstone SQL",
    easyA: "Production SQL combines filtering, joins, aggregation, constraints, and review.",
    easyB: "Capstone queries should be readable enough to debug when requirements change.",
    nuance: "A good final SQL solution balances correctness, maintainability, and performance.",
  },
};

function slug(value) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function domainFor(sectionOrder, unitOrder) {
  return domains[((sectionOrder - 1) * 10 + unitOrder - 1) % domains.length];
}

function optionSet(correct, distractors) {
  return [correct, ...distractors].slice(0, 4);
}

function exercise(id, type, difficulty, prompt, correctAnswer, explanation, extra = {}) {
  return {
    id,
    type,
    prompt,
    ...extra,
    correctAnswer,
    explanation,
    difficulty,
  };
}

function baseId(sectionOrder, unitOrder, exerciseOrder) {
  return `sql-s${sectionOrder}-u${unitOrder}-e${exerciseOrder}`;
}

function schemaSnippet(domain) {
  return `-- ${domain.table}(${domain.id}, ${domain.label}, ${domain.metric}, ${domain.status}, ${domain.date})`;
}

function makeSelectQuery(domain, topic) {
  if (/distinct/i.test(topic)) {
    return `SELECT DISTINCT ${domain.status}\nFROM ${domain.table};`;
  }
  if (/order/i.test(topic)) {
    return `SELECT ${domain.id}, ${domain.metric}\nFROM ${domain.table}\nORDER BY ${domain.metric} DESC;`;
  }
  if (/limit/i.test(topic)) {
    return `SELECT ${domain.id}, ${domain.metric}\nFROM ${domain.table}\nORDER BY ${domain.metric} DESC\nLIMIT 5;`;
  }
  if (/alias/i.test(topic)) {
    return `SELECT ${domain.id} AS id, ${domain.metric} AS score\nFROM ${domain.table};`;
  }
  if (/logical/i.test(topic)) {
    return `SELECT ${domain.id}\nFROM ${domain.table}\nWHERE ${domain.status} = '${domain.sampleA}' AND ${domain.metric} > 100;`;
  }
  if (/comparison|where|filters/i.test(topic)) {
    return `SELECT ${domain.id}, ${domain.status}\nFROM ${domain.table}\nWHERE ${domain.metric} >= 100;`;
  }
  return `SELECT ${domain.id}, ${domain.label}\nFROM ${domain.table};`;
}

function makeJoinQuery(domain, topic) {
  const left = domain.table;
  const right = `${domain.label.replace(/_id$/, "")}s`;
  if (/left/i.test(topic)) {
    return `SELECT ${domain.alias}.${domain.id}, p.name\nFROM ${left} AS ${domain.alias}\nLEFT JOIN ${right} AS p\n  ON p.id = ${domain.alias}.${domain.label};`;
  }
  if (/right/i.test(topic)) {
    return `SELECT p.name, ${domain.alias}.${domain.id}\nFROM ${left} AS ${domain.alias}\nRIGHT JOIN ${right} AS p\n  ON p.id = ${domain.alias}.${domain.label};`;
  }
  if (/full/i.test(topic)) {
    return `SELECT p.name, ${domain.alias}.${domain.id}\nFROM ${left} AS ${domain.alias}\nFULL JOIN ${right} AS p\n  ON p.id = ${domain.alias}.${domain.label};`;
  }
  if (/self/i.test(topic)) {
    return `SELECT employee.name, manager.name AS manager_name\nFROM employees AS employee\nLEFT JOIN employees AS manager\n  ON manager.employee_id = employee.manager_id;`;
  }
  return `SELECT ${domain.alias}.${domain.id}, p.name\nFROM ${left} AS ${domain.alias}\nINNER JOIN ${right} AS p\n  ON p.id = ${domain.alias}.${domain.label};`;
}

function makeAggregateQuery(domain, topic) {
  if (/count/i.test(topic)) {
    return `SELECT COUNT(*) AS row_count\nFROM ${domain.table};`;
  }
  if (/sum/i.test(topic)) {
    return `SELECT SUM(${domain.metric}) AS total_metric\nFROM ${domain.table};`;
  }
  if (/avg/i.test(topic)) {
    return `SELECT AVG(${domain.metric}) AS average_metric\nFROM ${domain.table};`;
  }
  if (/min|max/i.test(topic)) {
    return `SELECT MIN(${domain.metric}) AS lowest, MAX(${domain.metric}) AS highest\nFROM ${domain.table};`;
  }
  if (/having/i.test(topic)) {
    return `SELECT ${domain.status}, COUNT(*) AS item_count\nFROM ${domain.table}\nGROUP BY ${domain.status}\nHAVING COUNT(*) >= 3;`;
  }
  return `SELECT ${domain.status}, COUNT(*) AS item_count\nFROM ${domain.table}\nGROUP BY ${domain.status};`;
}

function makeSubquery(domain, topic) {
  if (/exists/i.test(topic)) {
    return `SELECT c.customer_id\nFROM customers AS c\nWHERE EXISTS (\n  SELECT 1\n  FROM orders AS o\n  WHERE o.customer_id = c.customer_id\n);`;
  }
  if (/cte/i.test(topic)) {
    return `WITH high_value AS (\n  SELECT ${domain.id}, ${domain.metric}\n  FROM ${domain.table}\n  WHERE ${domain.metric} > 500\n)\nSELECT *\nFROM high_value;`;
  }
  if (/recursive/i.test(topic)) {
    return `WITH RECURSIVE nums(n) AS (\n  SELECT 1\n  UNION ALL\n  SELECT n + 1 FROM nums WHERE n < 3\n)\nSELECT n FROM nums;`;
  }
  return `SELECT ${domain.id}, ${domain.metric}\nFROM ${domain.table}\nWHERE ${domain.metric} > (\n  SELECT AVG(${domain.metric}) FROM ${domain.table}\n);`;
}

function makeDdl(domain, topic) {
  if (/many-to-many|junction/i.test(topic)) {
    return `CREATE TABLE course_enrollments (\n  course_id INTEGER NOT NULL,\n  learner_id INTEGER NOT NULL,\n  enrolled_at TIMESTAMP NOT NULL,\n  PRIMARY KEY (course_id, learner_id)\n);`;
  }
  if (/constraint|key|relationship|one-to-many/i.test(topic)) {
    return `CREATE TABLE ${domain.table} (\n  ${domain.id} INTEGER PRIMARY KEY,\n  ${domain.label} INTEGER NOT NULL,\n  ${domain.status} TEXT NOT NULL\n);`;
  }
  return `CREATE TABLE ${domain.table} (\n  ${domain.id} INTEGER PRIMARY KEY,\n  ${domain.label} INTEGER NOT NULL,\n  ${domain.metric} NUMERIC NOT NULL\n);`;
}

function queryFor(sectionOrder, topic, domain) {
  if (sectionOrder === 1) return makeSelectQuery(domain, topic);
  if (sectionOrder === 2) return makeJoinQuery(domain, topic);
  if (sectionOrder === 3) return makeAggregateQuery(domain, topic);
  if (sectionOrder === 4) return makeSubquery(domain, topic);
  if (sectionOrder === 5 || sectionOrder === 6) return makeDdl(domain, topic);
  if (sectionOrder === 7) {
    return `CREATE INDEX idx_${domain.table}_${domain.status}_${domain.date}\nON ${domain.table} (${domain.status}, ${domain.date});`;
  }
  if (sectionOrder === 8) {
    return `BEGIN;\nUPDATE accounts\nSET balance_cents = balance_cents - 2500\nWHERE account_id = 7;\nUPDATE accounts\nSET balance_cents = balance_cents + 2500\nWHERE account_id = 12;\nCOMMIT;`;
  }
  if (sectionOrder === 9) {
    if (/insert|bulk|seed/i.test(topic)) {
      return `INSERT INTO ${domain.table} (${domain.id}, ${domain.label}, ${domain.status})\nVALUES (101, 42, '${domain.sampleA}');`;
    }
    if (/delete|cleanup/i.test(topic)) {
      return `DELETE FROM ${domain.table}\nWHERE ${domain.status} = '${domain.sampleB}';`;
    }
    return `UPDATE ${domain.table}\nSET ${domain.status} = '${domain.sampleB}'\nWHERE ${domain.id} = 101;`;
  }
  return `${makeJoinQuery(domain, "INNER JOIN").replace(/;$/, "")}\nWHERE ${domain.alias}.${domain.date} >= DATE '2026-01-01';`;
}

function fillBlankFor(sectionOrder, topic, domain) {
  if (sectionOrder === 1) {
    const keyword = /order/i.test(topic)
      ? "ORDER BY"
      : /limit/i.test(topic)
        ? "LIMIT"
        : /distinct/i.test(topic)
          ? "DISTINCT"
          : /alias/i.test(topic)
            ? "AS"
            : "WHERE";
    const snippet =
      keyword === "AS"
        ? `SELECT ${domain.metric} ____ metric_value\nFROM ${domain.table};`
        : keyword === "DISTINCT"
          ? `SELECT ____ ${domain.status}\nFROM ${domain.table};`
          : `${makeSelectQuery(domain, topic).replace(keyword, "____")}`;
    return { snippet, answer: keyword };
  }
  if (sectionOrder === 2) {
    const answer = /left/i.test(topic)
      ? "LEFT JOIN"
      : /right/i.test(topic)
        ? "RIGHT JOIN"
        : /full/i.test(topic)
          ? "FULL JOIN"
          : "INNER JOIN";
    return {
      snippet: `${schemaSnippet(domain)}\nSELECT ${domain.alias}.${domain.id}, p.name\nFROM ${domain.table} AS ${domain.alias}\n____ profiles AS p\n  ON p.id = ${domain.alias}.${domain.label};`,
      answer,
    };
  }
  if (sectionOrder === 3) {
    const answer = /having/i.test(topic) ? "HAVING" : /group|report|rollup/i.test(topic) ? "GROUP BY" : "COUNT";
    const snippet =
      answer === "COUNT"
        ? `SELECT ____(*) AS total_rows\nFROM ${domain.table};`
        : `SELECT ${domain.status}, COUNT(*)\nFROM ${domain.table}\n${answer === "GROUP BY" ? "____" : "GROUP BY"} ${domain.status}\n${answer === "HAVING" ? "____" : "--"} COUNT(*) > 2;`;
    return { snippet, answer };
  }
  if (sectionOrder === 4) {
    const answer = /cte|recursive/i.test(topic) ? "WITH" : /exists/i.test(topic) ? "EXISTS" : "IN";
    return {
      snippet:
        answer === "WITH"
          ? `____ recent_rows AS (\n  SELECT ${domain.id} FROM ${domain.table}\n)\nSELECT * FROM recent_rows;`
          : answer === "EXISTS"
            ? `SELECT ${domain.id}\nFROM ${domain.table}\nWHERE ____ (\n  SELECT 1 FROM profiles WHERE profiles.id = ${domain.table}.${domain.label}\n);`
          : `SELECT ${domain.id}\nFROM ${domain.table}\nWHERE ${domain.label} ${answer === "EXISTS" ? "____" : "____"} (\n  SELECT ${domain.label} FROM profiles\n);`,
      answer,
    };
  }
  if (sectionOrder === 5 || sectionOrder === 6) {
    const answer = /foreign|relationship|one-to-many/i.test(topic) ? "REFERENCES" : /unique|key/i.test(topic) ? "UNIQUE" : "NOT NULL";
    return {
      snippet: `CREATE TABLE ${domain.table} (\n  ${domain.id} INTEGER PRIMARY KEY,\n  ${domain.label} INTEGER ____ profiles(id),\n  ${domain.status} TEXT ${answer === "NOT NULL" ? "____" : "NOT NULL"}\n);`,
      answer,
    };
  }
  if (sectionOrder === 7) {
    return {
      snippet: `CREATE ____ idx_${domain.table}_${domain.status}\nON ${domain.table} (${domain.status});`,
      answer: "INDEX",
    };
  }
  if (sectionOrder === 8) {
    const answer = /rollback/i.test(topic) ? "ROLLBACK" : "COMMIT";
    return {
      snippet: `BEGIN;\nUPDATE accounts SET balance_cents = balance_cents - 100 WHERE account_id = 1;\n____;`,
      answer,
    };
  }
  if (sectionOrder === 9) {
    const answer = /delete|cleanup/i.test(topic) ? "DELETE" : /update/i.test(topic) ? "UPDATE" : "INSERT";
    return {
      snippet:
        answer === "INSERT"
          ? `____ INTO ${domain.table} (${domain.id}, ${domain.status}) VALUES (1, '${domain.sampleA}');`
          : answer === "UPDATE"
            ? `____ ${domain.table}\nSET ${domain.status} = '${domain.sampleB}'\nWHERE ${domain.id} = 1;`
            : `____ FROM ${domain.table}\nWHERE ${domain.status} = '${domain.sampleB}';`,
      answer,
    };
  }
  return {
    snippet: `WITH daily AS (\n  SELECT ${domain.date}, COUNT(*) AS total\n  FROM ${domain.table}\n  GROUP BY ${domain.date}\n)\nSELECT * FROM daily\n____ total DESC;`,
    answer: "ORDER BY",
  };
}

function spotBugFor(sectionOrder, topic, domain) {
  if (sectionOrder === 1) {
    return {
      snippet: `SELECT ${domain.id}, ${domain.status}\nFROM ${domain.table}\nWHERE ${domain.status} = '${domain.sampleA}'\nORDER ${domain.date} DESC;`,
      line: "line-4",
      explanation: "Sorting uses ORDER BY, not ORDER by itself; the BY keyword is required before the sort expression.",
    };
  }
  if (sectionOrder === 2) {
    const joinKeyword = /left/i.test(topic)
      ? "LEFT JOIN"
      : /right/i.test(topic)
        ? "RIGHT JOIN"
        : /full/i.test(topic)
          ? "FULL JOIN"
          : "INNER JOIN";
    return {
      snippet: `SELECT ${domain.alias}.${domain.id}, p.name\nFROM ${domain.table} AS ${domain.alias}\n${joinKeyword} profiles AS p\n  p.id = ${domain.alias}.${domain.label};`,
      line: "line-4",
      explanation: "A join condition must be introduced with ON; otherwise the database cannot tell how the tables relate.",
    };
  }
  if (sectionOrder === 3) {
    return {
      snippet: `SELECT ${domain.status}, COUNT(*) AS total\nFROM ${domain.table}\nWHERE COUNT(*) > 2\nGROUP BY ${domain.status};`,
      line: "line-3",
      explanation: "Aggregate filters belong in HAVING, because WHERE runs before groups and aggregate values exist.",
    };
  }
  if (sectionOrder === 4) {
    return {
      snippet: `WITH recent_rows AS\n  SELECT ${domain.id} FROM ${domain.table}\n)\nSELECT * FROM recent_rows;`,
      line: "line-1",
      explanation: "A CTE body must be wrapped in parentheses after AS.",
    };
  }
  if (sectionOrder === 5 || sectionOrder === 6) {
    return {
      snippet: `CREATE TABLE ${domain.table} (\n  ${domain.id} INTEGER PRIMARY,\n  ${domain.label} INTEGER NOT NULL\n);`,
      line: "line-2",
      explanation: "The table constraint is PRIMARY KEY; PRIMARY alone is not valid SQL.",
    };
  }
  if (sectionOrder === 7) {
    return {
      snippet: `CREATE idx_${domain.table}_${domain.status}\nON ${domain.table} (${domain.status});`,
      line: "line-1",
      explanation: "Index creation requires CREATE INDEX before the index name.",
    };
  }
  if (sectionOrder === 8) {
    return {
      snippet: `BEGIN;\nUPDATE accounts SET balance_cents = balance_cents - 500 WHERE account_id = 1;\nSAVE;`,
      line: "line-3",
      explanation: "A transaction is finalized with COMMIT, or undone with ROLLBACK; SAVE is not the commit command.",
    };
  }
  if (sectionOrder === 9) {
    return {
      snippet: `UPDATE ${domain.table}\n${domain.status} = '${domain.sampleB}'\nWHERE ${domain.id} = 1;`,
      line: "line-2",
      explanation: "UPDATE assignments must be introduced with SET.",
    };
  }
  return {
    snippet: `WITH report AS (\n  SELECT ${domain.status}, COUNT(*) AS total\n  FROM ${domain.table}\n  ORDER BY ${domain.status}\n)\nSELECT * FROM report;`,
    line: "line-4",
    explanation: "This grouped report is missing GROUP BY before ordering by the grouped column.",
  };
}

function predictFor(sectionOrder, topic, domain) {
  if (sectionOrder === 1) {
    return {
      snippet: `-- ${domain.table}\n-- id | ${domain.status}\n-- 1  | ${domain.sampleA}\n-- 2  | ${domain.sampleA}\n-- 3  | ${domain.sampleB}\nSELECT DISTINCT ${domain.status}\nFROM ${domain.table};`,
      correct: `${domain.sampleA}, ${domain.sampleB}`,
      options: [`${domain.sampleA}, ${domain.sampleB}`, `${domain.sampleA}, ${domain.sampleA}, ${domain.sampleB}`, domain.sampleA, "0 rows"],
      explanation: "DISTINCT removes duplicate projected values, so repeated statuses appear once.",
    };
  }
  if (sectionOrder === 2) {
    return {
      snippet: `-- orders: (1, customer 7), (2, customer 8)\n-- customers: (7, Ada)\nSELECT o.order_id\nFROM orders AS o\nINNER JOIN customers AS c ON c.customer_id = o.customer_id;`,
      correct: "1",
      options: ["1", "1, 2", "2", "0 rows"],
      explanation: "INNER JOIN keeps only rows that have a matching customer, so order 2 is dropped.",
    };
  }
  if (sectionOrder === 3) {
    return {
      snippet: `-- ${domain.table}.${domain.status}: open, open, closed\nSELECT ${domain.status}, COUNT(*)\nFROM ${domain.table}\nGROUP BY ${domain.status};`,
      correct: "closed: 1 and open: 2",
      options: ["closed: 1 and open: 2", "open: 3", "closed: 2 and open: 1", "1 row total"],
      explanation: "GROUP BY produces one row per status value, and COUNT(*) counts rows inside each group.",
    };
  }
  if (sectionOrder === 4) {
    return {
      snippet: `-- scores: 10, 20, 40\nSELECT score\nFROM scores\nWHERE score > (SELECT AVG(score) FROM scores);`,
      correct: "40",
      options: ["40", "20, 40", "10, 20, 40", "0 rows"],
      explanation: "The average is about 23.33, so only 40 is greater than the scalar subquery result.",
    };
  }
  if (sectionOrder === 5 || sectionOrder === 6) {
    return {
      snippet: `CREATE TABLE enrollments (\n  learner_id INTEGER NOT NULL,\n  course_id INTEGER NOT NULL,\n  PRIMARY KEY (learner_id, course_id)\n);`,
      correct: "A learner can enroll in the same course only once",
      options: [
        "A learner can enroll in the same course only once",
        "Each learner can take only one course ever",
        "course_id may be NULL",
        "The table has no key",
      ],
      explanation: "The composite primary key enforces uniqueness for the pair, not for each column independently.",
    };
  }
  if (sectionOrder === 7) {
    return {
      snippet: `CREATE INDEX idx_orders_status_created\nON orders (status, created_at);`,
      correct: "Filtering by status can use the leftmost index column",
      options: [
        "Filtering by status can use the leftmost index column",
        "The index prevents all INSERT statements",
        "Only created_at filters can use the index",
        "The table is automatically sorted forever",
      ],
      explanation: "A composite B-tree index is most directly useful from its leftmost column onward.",
    };
  }
  if (sectionOrder === 8) {
    return {
      snippet: `BEGIN;\nUPDATE accounts SET balance_cents = balance_cents - 100 WHERE account_id = 1;\nROLLBACK;`,
      correct: "The balance change is undone",
      options: ["The balance change is undone", "The balance change is committed", "The account row is deleted", "The transaction stays open forever"],
      explanation: "ROLLBACK cancels the uncommitted work done since BEGIN.",
    };
  }
  if (sectionOrder === 9) {
    return {
      snippet: `UPDATE tickets\nSET state = 'closed'\nWHERE state = 'open';`,
      correct: "All open tickets become closed",
      options: ["All open tickets become closed", "Only one arbitrary ticket changes", "Closed tickets become open", "The table is dropped"],
      explanation: "UPDATE changes every row that matches its WHERE clause.",
    };
  }
  return {
    snippet: `WITH ranked AS (\n  SELECT player_id, points,\n         RANK() OVER (ORDER BY points DESC) AS place\n  FROM scores\n)\nSELECT player_id FROM ranked WHERE place = 1;`,
    correct: "It returns every player tied for the top score",
    options: [
      "It returns every player tied for the top score",
      "It returns only the last player inserted",
      "It deletes lower-ranked players",
      "It ignores the points column",
    ],
    explanation: "RANK assigns the same rank to ties, so every row with the highest points has place 1.",
  };
}

function reorderFor(sectionOrder, topic, domain) {
  if (sectionOrder === 8) {
    const correct = ["BEGIN;", "UPDATE accounts SET balance_cents = balance_cents - 500 WHERE account_id = 1;", "UPDATE accounts SET balance_cents = balance_cents + 500 WHERE account_id = 2;", "COMMIT;"];
    return {
      options: [correct[1], correct[0], correct[3], correct[2]],
      correct,
      prompt: `Put the transaction steps for ${topic} in a safe order.`,
      explanation: "A transfer-style transaction begins, applies all related changes, then commits them together.",
    };
  }
  if (sectionOrder === 5 || sectionOrder === 6 || sectionOrder === 7 || sectionOrder === 9) {
    const correct = queryFor(sectionOrder, topic, domain).split("\n");
    return {
      options: [...correct].reverse(),
      correct,
      prompt: `Reorder the SQL lines so the ${topic} statement is valid.`,
      explanation: "SQL statements have a clause order; DDL and write statements also require their keywords in fixed positions.",
    };
  }
  const query = queryFor(sectionOrder, topic, domain).split("\n");
  const correct = query.slice(0, Math.min(4, query.length));
  return {
    options: [correct[1], correct[0], correct[3] ?? correct[2], correct[2] ?? correct[1]].filter(Boolean),
    correct,
    prompt: `Reorder the clauses to build the ${topic} query.`,
    explanation: "Readable SQL follows the logical clause order: SELECT, FROM, joins or filters, then grouping/sorting/limits as needed.",
  };
}

function typeAnswerFor(sectionOrder, topic, domain) {
  const query = queryFor(sectionOrder, topic, domain);
  if (sectionOrder === 1) {
    return {
      prompt: `Write a query that applies ${topic} to the ${domain.table} table.`,
      codeSnippet: schemaSnippet(domain),
      answers: [query, `${query};`.replace(/;;$/, ";")],
      explanation: `This answer uses the relevant ${topic} clause while keeping the query focused on the ${domain.table} table.`,
    };
  }
  if (sectionOrder === 2) {
    return {
      prompt: `Write the join query for the ${topic} scenario.`,
      codeSnippet: `${schemaSnippet(domain)}\n-- profiles(id, name)`,
      answers: [query],
      explanation: "The join condition connects the foreign-key-like column to the related table's key.",
    };
  }
  if (sectionOrder === 3) {
    return {
      prompt: `Write an aggregate query for ${topic}.`,
      codeSnippet: schemaSnippet(domain),
      answers: [query],
      explanation: "The aggregate query summarizes rows while preserving grouping only when the question asks for grouped output.",
    };
  }
  if (sectionOrder === 4) {
    return {
      prompt: `Write a query that demonstrates ${topic}.`,
      codeSnippet: schemaSnippet(domain),
      answers: [query],
      explanation: "The nested query or CTE isolates an intermediate result and lets the outer query use it clearly.",
    };
  }
  if (sectionOrder === 5 || sectionOrder === 6) {
    return {
      prompt: `Write a table definition that fits the ${topic} modeling goal.`,
      codeSnippet: `-- Model a ${domain.table} record with a stable id and required fields.`,
      answers: [query],
      explanation: "The table definition uses keys and NOT NULL constraints to encode basic integrity in the schema.",
    };
  }
  if (sectionOrder === 7) {
    return {
      prompt: `Write the index statement for ${topic}.`,
      codeSnippet: schemaSnippet(domain),
      answers: [query],
      explanation: "The index targets columns commonly used together in filters or ordering.",
    };
  }
  if (sectionOrder === 8) {
    return {
      prompt: `Write the transaction flow for ${topic}.`,
      codeSnippet: "-- accounts(account_id, balance_cents)",
      answers: [query],
      explanation: "The transaction wraps related account updates so they succeed or fail as a unit.",
    };
  }
  if (sectionOrder === 9) {
    return {
      prompt: `Write a safe data-changing statement for ${topic}.`,
      codeSnippet: schemaSnippet(domain),
      answers: [query],
      explanation: "The statement includes the write keyword and a target condition where needed so it changes intended rows only.",
    };
  }
  return {
    prompt: `Write a capstone query for ${topic}.`,
    codeSnippet: `${schemaSnippet(domain)}\n-- ${domain.label.replace(/_id$/, "")}s(id, name)`,
    answers: [query],
    explanation: "The capstone query combines relationship logic and filtering in one readable statement.",
  };
}

function makeUnitExercises(section, unit) {
  const sectionOrder = section.order;
  const unitOrder = unit.order;
  const topic = unit.title;
  const domain = domainFor(sectionOrder, unitOrder);
  const focus = sectionFocus[sectionOrder];
  const fill = fillBlankFor(sectionOrder, topic, domain);
  const bug = spotBugFor(sectionOrder, topic, domain);
  const predicted = predictFor(sectionOrder, topic, domain);
  const reorder = reorderFor(sectionOrder, topic, domain);
  const typed = typeAnswerFor(sectionOrder, topic, domain);
  const query = queryFor(sectionOrder, topic, domain);

  return [
    exercise(
      baseId(sectionOrder, unitOrder, 1),
      "multiple_choice",
      "easy",
      `What is the main job of ${topic} in SQL?`,
      focus.easyA,
      `${topic} is part of ${focus.focus}. ${focus.easyA}`,
      {
        options: optionSet(focus.easyA, [
          "It permanently deletes every table in the database.",
          "It changes how the operating system schedules database processes.",
          "It replaces the need for table relationships.",
        ]),
      },
    ),
    exercise(
      baseId(sectionOrder, unitOrder, 2),
      "multiple_choice",
      "easy",
      `Which statement best matches the ${topic} lesson goal?`,
      focus.easyB,
      `${focus.easyB} This is the behavior to remember before combining ${topic} with later SQL features.`,
      {
        options: optionSet(focus.easyB, [
          "SQL clauses may be written in any order with identical results.",
          "Every SQL statement must include a subquery.",
          "Indexes always change the rows returned by a query.",
        ]),
      },
    ),
    exercise(
      baseId(sectionOrder, unitOrder, 3),
      "fill_blank",
      "easy",
      `Fill the blank in this ${topic} statement.`,
      fill.answer,
      `The missing token is ${fill.answer}. It is the SQL keyword or clause that expresses ${topic} in this context.`,
      {
        codeSnippet: fill.snippet,
      },
    ),
    exercise(
      baseId(sectionOrder, unitOrder, 4),
      "spot_bug",
      "medium",
      `Which line contains the bug in this ${topic} SQL?`,
      bug.line,
      bug.explanation,
      {
        codeSnippet: bug.snippet,
      },
    ),
    exercise(
      baseId(sectionOrder, unitOrder, 5),
      "predict_output",
      "medium",
      `Predict the result of this ${topic} query.`,
      predicted.correct,
      predicted.explanation,
      {
        codeSnippet: predicted.snippet,
        options: predicted.options,
      },
    ),
    exercise(
      baseId(sectionOrder, unitOrder, 6),
      "multiple_choice",
      "medium",
      `What is the important nuance when using ${topic}?`,
      focus.nuance,
      `${focus.nuance} That nuance is what prevents many subtle SQL bugs in real projects.`,
      {
        codeSnippet: query,
        options: optionSet(focus.nuance, [
          "The database ignores constraints when a query contains a WHERE clause.",
          "NULL values behave exactly like empty strings in every comparison.",
          "Adding more joins always makes a query faster.",
        ]),
      },
    ),
    exercise(
      baseId(sectionOrder, unitOrder, 7),
      "drag_reorder",
      "hard",
      reorder.prompt,
      reorder.correct,
      reorder.explanation,
      {
        codeSnippet: `-- Topic: ${topic}\n${schemaSnippet(domain)}`,
        options: reorder.options,
      },
    ),
    exercise(
      baseId(sectionOrder, unitOrder, 8),
      "type_function",
      "hard",
      typed.prompt,
      typed.answers,
      typed.explanation,
      {
        codeSnippet: typed.codeSnippet,
      },
    ),
  ];
}

const exercises = [];
for (const section of track.sections) {
  const sectionExercises = [];

  for (const unit of section.units) {
    const unitExercises = makeUnitExercises(section, unit);
    sectionExercises.push(...unitExercises);
    unit.lessons[0].exerciseIds = unitExercises.map((item) => item.id);
  }

  exercises.push(...sectionExercises);
  console.log(
    `Generated SQL section ${section.order}: ${section.title} (${sectionExercises.length} exercises)`,
  );
}

fs.writeFileSync(trackPath, `${JSON.stringify(track, null, 2)}\n`);
fs.writeFileSync(exercisesPath, `${JSON.stringify(exercises, null, 2)}\n`);

console.log(`Wrote ${exercises.length} SQL exercises to ${path.relative(root, exercisesPath)}.`);
