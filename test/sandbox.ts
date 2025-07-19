const request = async () => {
  try {
    const res = await fetch("http://localhost:3001/user/create", {
      method: "POST",
      headers: { "Content-Type": "application/json", },
      body: JSON.stringify({ email: "1", }),
    });
    const data = await res.json();
    console.dir(data);
  } catch (e) {
    console.error(e);
  }
};
