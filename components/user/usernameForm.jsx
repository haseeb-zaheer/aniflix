import { useRouter } from "next/router";
import { useState } from "react";

export default function UsernameForm({ onSuccess }) {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [message, setMessage] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();

    const response = await fetch(`/api/profile/${username}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username }),
    });

    if (response.ok) {
      setMessage("Username saved!");
      if (onSuccess) {
        onSuccess(); 
      } else {
        router.push("/"); 
      }
    } else {
      const data = await response.json();
      setMessage(data.error || "Failed to set username");
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <label htmlFor="username" className="block text-sm mb-1">Choose a username:</label>
      <input
        type="text"
        id="username"
        className="w-full p-2 rounded bg-gray-800 text-white mb-2"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        required
      />
      <button
        type="submit"
        className="bg-[#e50914] text-white py-2 px-4 rounded w-full hover:bg-red-700 transition"
      >
        Save
      </button>
      {message && <p className="text-sm text-gray-300 mt-2">{message}</p>}
    </form>
  );
}
