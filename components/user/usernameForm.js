import { useRouter } from "next/router";
import { useState } from "react";

export default function UsernameForm() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [message, setMessage] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();

    const response = await fetch(`/api/user/${username}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username }),
    });

    if (response.ok) {
      setMessage("Username saved!");
      // redirect to home page once made
    } else {
      const data = await response.json();
      setMessage(data.error || "Failed to set username");
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <label htmlFor="username">Choose a username:</label>
      <input
        type="text"
        id="username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        required
      />
      <button type="submit">Save</button>
      {message && <p>{message}</p>}
    </form>
  );
}
