document.addEventListener("DOMContentLoaded", () => {
  const btnFollowers = document.getElementById("btn-followers");
  const btnFollowing = document.getElementById("btn-following");
  const btnNotFollowingBack = document.getElementById("btn-not-following-back");
  const btnNotFollowedBack = document.getElementById("btn-not-followed-back");
  const resultSection = document.getElementById("result");

  btnFollowers.addEventListener("click", () => fetchAndDisplay("followers"));
  btnFollowing.addEventListener("click", () => fetchAndDisplay("following"));
  btnNotFollowingBack.addEventListener("click", () => fetchAndDisplay("not-following-back"));
  btnNotFollowedBack.addEventListener("click", () => fetchAndDisplay("not-followed-back"));

  async function fetchAndDisplay(type) {
    try {
      const response = await fetch(`/api/${type}`);
      if (!response.ok) throw new Error('Network response was not ok');
      const data = await response.json();
      displayResults(type, data);
    } catch (error) {
      console.error(`Failed to fetch ${type}:`, error);
      resultSection.innerHTML = `<p>Error fetching data. Please try again later.</p>`;
    }
  }

  function displayResults(type, data) {
    const title = capitalize(type.replace(/-/g, ' '));
    resultSection.innerHTML = `<h2>${title}</h2><ul>${data.map(username => `<li>@${username}</li>`).join('')}</ul>`;
  }

  function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }
});
