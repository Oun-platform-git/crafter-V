export async function fetchData(endpoint, options = {}) {
  const res = await fetch(`http://localhost:8000/${endpoint}`, options);
  return await res.json();
}
