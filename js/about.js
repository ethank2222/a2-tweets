function parseTweets(runkeeper_tweets) {
  //Do not proceed if no tweets loaded
  if (runkeeper_tweets === undefined) {
    window.alert("No tweets returned");
    return;
  }

  tweet_array = runkeeper_tweets.map(function (tweet) {
    return new Tweet(tweet.text, tweet.created_at);
  });

  document.getElementById("numberTweets").innerText = tweet_array.length;

  const dates = tweet_array.map((t) => t.time).sort((a, b) => a - b);
  document.getElementById("firstDate").innerText = dates[0].toLocaleDateString(
    "en-US",
    { weekday: "long", year: "numeric", month: "long", day: "numeric" }
  );
  document.getElementById("lastDate").innerText = dates[
    dates.length - 1
  ].toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const completed = tweet_array.filter((t) => t.source === "completed_event");
  const live = tweet_array.filter((t) => t.source === "live_event");
  const achievement = tweet_array.filter((t) => t.source === "achievement");
  const misc = tweet_array.filter((t) => t.source === "miscellaneous");
  const written = completed.filter((t) => t.written);

  const total = tweet_array.length;
  document
    .querySelectorAll(".completedEvents")
    .forEach((el) => (el.innerText = completed.length));
  document.querySelectorAll(".completedEventsPct").forEach(
    (el) =>
      (el.innerText =
        math.format((completed.length / total) * 100, {
          notation: "fixed",
          precision: 2,
        }) + "%")
  );
  document
    .querySelectorAll(".liveEvents")
    .forEach((el) => (el.innerText = live.length));
  document.querySelectorAll(".liveEventsPct").forEach(
    (el) =>
      (el.innerText =
        math.format((live.length / total) * 100, {
          notation: "fixed",
          precision: 2,
        }) + "%")
  );
  document
    .querySelectorAll(".achievements")
    .forEach((el) => (el.innerText = achievement.length));
  document.querySelectorAll(".achievementsPct").forEach(
    (el) =>
      (el.innerText =
        math.format((achievement.length / total) * 100, {
          notation: "fixed",
          precision: 2,
        }) + "%")
  );
  document
    .querySelectorAll(".miscellaneous")
    .forEach((el) => (el.innerText = misc.length));
  document.querySelectorAll(".miscellaneousPct").forEach(
    (el) =>
      (el.innerText =
        math.format((misc.length / total) * 100, {
          notation: "fixed",
          precision: 2,
        }) + "%")
  );
  document
    .querySelectorAll(".written")
    .forEach((el) => (el.innerText = written.length));
  document.querySelectorAll(".writtenPct").forEach(
    (el) =>
      (el.innerText =
        math.format((written.length / completed.length) * 100, {
          notation: "fixed",
          precision: 2,
        }) + "%")
  );
}

//Wait for the DOM to load
document.addEventListener("DOMContentLoaded", function (event) {
  loadSavedRunkeeperTweets().then(parseTweets);
});
