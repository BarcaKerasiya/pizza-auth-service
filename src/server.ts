function login(username: string): string {
  const user = {
    name: "barca",
  };
  const name = user["name"];

  return username + name;
}

login("Barca");
