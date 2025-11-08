async function fetchPaper(paperId: string) {
  const res = await fetch(`http://localhost:8000/api/paper/${paperId}`);
  if (!res.ok) throw new Error("Paper not found");
  const data = await res.json();
  return data;
}

export default fetchPaper;