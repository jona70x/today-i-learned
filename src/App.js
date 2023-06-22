import React, { useState, useEffect } from "react";
import supabase from "./supabase";

import "./style.css";
import logo from "./logo.png";

// Always start a react component with capital letters

function App() {
  const [facts, setFacts] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentCategory, setCurrentCategory] = useState("all");

  // Using useEffect to fetch the data
  useEffect(() => {
    async function getFacts() {
      setIsLoading(true);

      let query = supabase.from("facts").select("*");

      if (currentCategory !== "all")
        query = query.eq("category", currentCategory);

      const { data: facts, error } = await query.order("votesInteresting", {
        ascending: false,
      });
      // Placing data in state
      if (!error) setFacts(facts);
      else alert("There was an error");
      setIsLoading(false);
    }
    getFacts();

    return () => {};
  }, [currentCategory]);

  // Always return just one element
  return (
    <>
      <Header setShowForm={setShowForm} showForm={showForm} />
      {/* Fact form */}
      {showForm && (
        <NewFactForm setFacts={setFacts} setShowForm={setShowForm} />
      )}

      <main className="main">
        {/* Category Filters */}
        <CategoryFilter setCurrentCategory={setCurrentCategory} />
        {/* Fact List */}
        {isLoading ? (
          <Loader />
        ) : (
          <FactList facts={facts} setFacts={setFacts} />
        )}
      </main>
    </>
  );
}
function Loader() {
  return <p className="message">Loading...</p>;
}

// Header
function Header({ setShowForm, showForm }) {
  const appTitle = "Today I Learned";
  return (
    <header className="header">
      <div className="logo">
        <img src={logo} alt="logo" />
        <h1>{appTitle}</h1>
      </div>
      <button
        className="btn btn-large btn-form"
        onClick={() => setShowForm((show) => !show)}
      >
        {showForm ? "Close" : "Share a Fact"}
      </button>
    </header>
  );
}

const CATEGORIES = [
  { name: "technology", color: "#3b82f6" },
  { name: "science", color: "#16a34a" },
  { name: "finance", color: "#ef4444" },
  { name: "society", color: "#eab308" },
  { name: "entertainment", color: "#db2777" },
  { name: "health", color: "#14b8a6" },
  { name: "history", color: "#f97316" },
  { name: "news", color: "#8b5cf6" },
];

function isValidHttpUrl(string) {
  let url;
  try {
    url = new URL(string);
  } catch (_) {
    return false;
  }
  return url.protocol === "http:" || url.protocol === "https:";
}

// Form
function NewFactForm({ setFacts, setShowForm }) {
  const [text, setText] = useState("");
  const [source, setSource] = useState("");
  const [category, setCategory] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  const textLength = text.length;

  async function handleSubmit(e) {
    // 1. Prevent browser reload
    e.preventDefault();
    console.log(text, category, source);

    // 2. Check if data is valid
    // if so, crate a new fact
    if (text && isValidHttpUrl(source) && category && textLength <= 200) {
      // 3. Upload a new fact and upload it to supabase
      setIsUploading(true);
      const { data: newFact, error } = await supabase
        .from("facts")
        .insert([{ text, source, category }])
        .select();

      // 4. Add the new fact to the UI: add the fact to the state (this will make the UI render again)
      if (!error) setFacts((prevState) => [newFact[0], ...prevState]);
      // 5. Reset the input fields
      setText("");
      setCategory("");
      setSource("");
      // 6. Close the form

      setShowForm(false);
      setIsUploading(false);
    }
  }

  return (
    <form className="fact-form" action="" onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="Share a fact with the world"
        value={text}
        // This is necessary because react needs to have total control over the form
        onChange={(e) => setText(e.target.value)}
        disabled={isUploading}
      />
      <span>{200 - textLength}</span>
      <input
        type="text"
        placeholder="Trustworthy source..."
        value={source}
        onChange={(e) => setSource(e.target.value)}
        disabled={isUploading}
      />
      <select
        value={category}
        onChange={(e) => {
          setCategory(e.target.value);
        }}
        disabled={isUploading}
      >
        <option value="">Choose category:</option>
        {CATEGORIES.map((cat) => (
          <option key={cat.name} value={cat.name}>
            {cat.name.toUpperCase()}
            disabled={isUploading}
          </option>
        ))}
      </select>
      <button className="btn btn-large btn-open">Post</button>
    </form>
  );
}

// Category Filters
function CategoryFilter({ setCurrentCategory }) {
  return (
    <aside>
      <ul>
        <li className="category">
          <button
            className="btn btn-all-categories"
            onClick={() => setCurrentCategory("all")}
          >
            All
          </button>
        </li>
        {CATEGORIES.map((cat) => {
          return (
            <li key={cat.name} className="category">
              <button
                className="btn btn-category"
                onClick={() => setCurrentCategory(cat.name)}
                style={{ backgroundColor: cat.color }}
              >
                {cat.name}
              </button>
            </li>
          );
        })}
      </ul>
    </aside>
  );
}

//  Fact list
function FactList({ facts, setFacts }) {
  // Temporary
  if (facts.length === 0) {
    return (
      <p className="message">
        No facts for this category yet! Create the first one 🤩
      </p>
    );
  }
  return (
    <section>
      <ul className="facts-list">
        {facts.map((fact) => {
          return <Fact key={fact.id} fact={fact} setFacts={setFacts} />;
        })}
      </ul>
      <p>There are {facts.length} facts in the database</p>
    </section>
  );
}

function Fact({ fact, setFacts }) {
  const [isUpdating, setIsUpdating] = useState(false);
  const isDisputed =
    fact.votesInteresting + fact.votesMindblowing < fact.votesFalse;

  async function handleVote(columnName) {
    setIsUpdating(true);

    const { data: updatedFact, error } = await supabase
      .from("facts")
      .update({ [columnName]: fact[columnName] + 1 })
      .eq("id", fact.id)
      .select();

    setIsUpdating(false);

    if (!error)
      setFacts((facts) =>
        facts.map((f) => (f.id === fact.id ? updatedFact[0] : f))
      );
  }
  return (
    <li className="fact">
      <p>
        {isDisputed ? <span className="disputed">[‼️DISPUTED]</span> : null}
        {fact.text}
        <a
          className="source"
          href={fact.source}
          target="_blank"
          rel="noreferrer"
        >
          (Source)
        </a>
      </p>
      <span
        className="tag"
        style={{
          backgroundColor: CATEGORIES.find((el) => el.name === fact.category)
            .color,
        }}
      >
        {fact.category}
      </span>
      <div className="vote-buttons">
        <button
          onClick={() => handleVote("votesInteresting")}
          disabled={isUpdating}
        >
          👍🏻 {fact.votesInteresting}
        </button>
        <button onClick={() => handleVote("votesMindblowing")}>
          🤯 {fact.votesMindblowing}
        </button>
        <button onClick={() => handleVote("votesFalse")}>
          ⛔️ {fact.votesFalse}
        </button>
      </div>
    </li>
  );
}

export default App;
