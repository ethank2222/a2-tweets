function parseTweets(runkeeper_tweets) {
  if (runkeeper_tweets === undefined) {
    window.alert("No tweets returned");
    return;
  }

  tweet_array = runkeeper_tweets.map(function (tweet) {
    return new Tweet(tweet.text, tweet.created_at);
  });

  const completed = tweet_array.filter(
    (t) => t.source === "completed_event" && t.activityType && t.distance > 0
  );
  const activityCounts = {};
  completed.forEach((t) => {
    activityCounts[t.activityType] = (activityCounts[t.activityType] || 0) + 1;
  });
  const sortedActivities = Object.entries(activityCounts).sort(
    (a, b) => b[1] - a[1]
  );
  const top3 = sortedActivities.slice(0, 3).map((a) => a[0]);

  document.getElementById("numberActivities").innerText =
    sortedActivities.length;
  document.getElementById("firstMost").innerText = top3[0];
  document.getElementById("secondMost").innerText = top3[1];
  document.getElementById("thirdMost").innerText = top3[2];

  const activityVisData = sortedActivities.map(([activity, count]) => ({
    activity,
    count,
  }));
  const activity_vis_spec = {
    $schema: "https://vega.github.io/schema/vega-lite/v5.json",
    description:
      "A graph of the number of Tweets containing each type of activity.",
    data: { values: activityVisData },
    mark: "bar",
    encoding: {
      x: { field: "activity", type: "ordinal", sort: "-y" },
      y: { field: "count", type: "quantitative" },
    },
  };
  vegaEmbed("#activityVis", activity_vis_spec, { actions: false });

  const top3Completed = completed.filter((t) => top3.includes(t.activityType));
  const distanceData = top3Completed.map((t) => ({
    activity: t.activityType,
    distance: t.distance,
    day: t.time.toLocaleDateString("en-US", { weekday: "long" }),
  }));

  const distance_vis_spec = {
    $schema: "https://vega.github.io/schema/vega-lite/v5.json",
    data: { values: distanceData },
    mark: "circle",
    encoding: {
      x: {
        field: "day",
        type: "ordinal",
        sort: [
          "Monday",
          "Tuesday",
          "Wednesday",
          "Thursday",
          "Friday",
          "Saturday",
          "Sunday",
        ],
      },
      y: { field: "distance", type: "quantitative", title: "Distance (miles)" },
      color: { field: "activity", type: "nominal" },
    },
  };

  const aggregatedData = {};
  distanceData.forEach((d) => {
    const key = d.activity + "|" + d.day;
    if (!aggregatedData[key]) {
      aggregatedData[key] = { activity: d.activity, day: d.day, distances: [] };
    }
    aggregatedData[key].distances.push(d.distance);
  });
  const aggregatedValues = Object.values(aggregatedData).map((d) => ({
    activity: d.activity,
    day: d.day,
    meanDistance: d.distances.reduce((a, b) => a + b, 0) / d.distances.length,
  }));

  const distance_vis_aggregated_spec = {
    $schema: "https://vega.github.io/schema/vega-lite/v5.json",
    data: { values: aggregatedValues },
    mark: { type: "line", point: true },
    encoding: {
      x: {
        field: "day",
        type: "ordinal",
        sort: [
          "Monday",
          "Tuesday",
          "Wednesday",
          "Thursday",
          "Friday",
          "Saturday",
          "Sunday",
        ],
      },
      y: {
        field: "meanDistance",
        type: "quantitative",
        title: "Mean Distance (miles)",
      },
      color: { field: "activity", type: "nominal" },
    },
  };

  let showAggregated = false;
  vegaEmbed("#distanceVis", distance_vis_spec, { actions: false });

  document.getElementById("aggregate").addEventListener("click", function () {
    showAggregated = !showAggregated;
    document.getElementById("distanceVis").style.display = showAggregated
      ? "none"
      : "block";
    document.getElementById("distanceVisAggregated").style.display =
      showAggregated ? "block" : "none";
    if (showAggregated) {
      vegaEmbed("#distanceVisAggregated", distance_vis_aggregated_spec, {
        actions: false,
      });
    }
  });
  document.getElementById("distanceVisAggregated").style.display = "none";

  const activityMeans = {};
  top3.forEach((activity) => {
    const acts = completed.filter((t) => t.activityType === activity);
    activityMeans[activity] =
      acts.reduce((sum, t) => sum + t.distance, 0) / acts.length;
  });
  const sortedMeans = Object.entries(activityMeans).sort((a, b) => b[1] - a[1]);
  document.getElementById("longestActivityType").innerText = sortedMeans[0][0];
  document.getElementById("shortestActivityType").innerText =
    sortedMeans[sortedMeans.length - 1][0];

  const weekdayData = completed.filter((t) => {
    const day = t.time.getDay();
    return day >= 1 && day <= 5;
  });
  const weekendData = completed.filter((t) => {
    const day = t.time.getDay();
    return day === 0 || day === 6;
  });
  const weekdayAvg =
    weekdayData.length > 0
      ? weekdayData.reduce((sum, t) => sum + t.distance, 0) / weekdayData.length
      : 0;
  const weekendAvg =
    weekendData.length > 0
      ? weekendData.reduce((sum, t) => sum + t.distance, 0) / weekendData.length
      : 0;
  document.getElementById("weekdayOrWeekendLonger").innerText =
    weekdayAvg > weekendAvg ? "weekdays" : "weekends";
}

document.addEventListener("DOMContentLoaded", function (event) {
  loadSavedRunkeeperTweets().then(parseTweets);
});
