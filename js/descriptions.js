let writtenTweets = [];

const positiveWords = [
  "good",
  "great",
  "excellent",
  "amazing",
  "wonderful",
  "fantastic",
  "love",
  "happy",
  "enjoy",
  "best",
  "awesome",
  "perfect",
  "beautiful",
  "nice",
  "fun",
  "proud",
  "achieved",
  "success",
  "win",
  "victory",
  "strong",
  "fast",
  "better",
  "improved",
  "pb",
  "personal record",
];
const negativeWords = [
  "bad",
  "terrible",
  "awful",
  "hate",
  "sad",
  "difficult",
  "hard",
  "tired",
  "pain",
  "hurt",
  "slow",
  "worst",
  "failed",
  "disappointed",
  "struggle",
  "exhausted",
  "injured",
  "sick",
  "weak",
];

function getSentiment(text) {
  const lower = text.toLowerCase();
  let pos = 0,
    neg = 0;
  positiveWords.forEach((word) => {
    if (lower.includes(word)) pos++;
  });
  negativeWords.forEach((word) => {
    if (lower.includes(word)) neg++;
  });
  if (pos > neg) return "positive";
  if (neg > pos) return "negative";
  return "neutral";
}

function parseTweets(runkeeper_tweets) {
  if (runkeeper_tweets === undefined) {
    window.alert("No tweets returned");
    return;
  }
  writtenTweets = runkeeper_tweets
    .map((t) => new Tweet(t.text, t.created_at))
    .filter((t) => t.written);
}

function addEventHandlerForSearch() {
  const searchBox = document.getElementById("textFilter");
  const searchCount = document.getElementById("searchCount");
  const searchText = document.getElementById("searchText");
  const tableBody = document.getElementById("tweetTable");

  searchBox.addEventListener("input", function () {
    const query = this.value.toLowerCase();
    searchText.textContent = query || "???";

    if (query === "") {
      tableBody.innerHTML = "";
      searchCount.textContent = "???";
      return;
    }

    const filtered = writtenTweets.filter((t) =>
      t.writtenText.toLowerCase().includes(query)
    );
    searchCount.textContent = filtered.length;

    tableBody.innerHTML = filtered
      .map((t, i) => {
        let html = t.text;
        const httpIdx = html.indexOf("http://");
        const httpsIdx = html.indexOf("https://");
        const urlStart =
          httpsIdx !== -1
            ? httpIdx !== -1 && httpIdx < httpsIdx
              ? httpIdx
              : httpsIdx
            : httpIdx;

        if (urlStart !== -1) {
          let urlEnd = html.indexOf(" ", urlStart);
          if (urlEnd === -1) urlEnd = html.length;
          const url = html.substring(urlStart, urlEnd);
          html =
            html.substring(0, urlStart) +
            `<a href="${url}" target="_blank">${url}</a>` +
            html.substring(urlEnd);
        }

        const sentiment = getSentiment(t.writtenText);
        return `<tr><td>${i + 1}</td><td>${
          t.activityType
        }</td><td>${html}</td><td>${sentiment}</td></tr>`;
      })
      .join("");
  });
}

document.addEventListener("DOMContentLoaded", function (event) {
  addEventHandlerForSearch();
  loadSavedRunkeeperTweets().then(parseTweets);
});
