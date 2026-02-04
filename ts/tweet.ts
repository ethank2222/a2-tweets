class Tweet {
  private text: string;
  time: Date;

  constructor(tweet_text: string, tweet_time: string) {
    this.text = tweet_text;
    this.time = new Date(tweet_time); //, "ddd MMM D HH:mm:ss Z YYYY"
  }

  //returns either 'live_event', 'achievement', 'completed_event', or 'miscellaneous'
  get source(): string {
    if (this.text.includes("#RKLive") || this.text.includes("Watch my"))
      return "live_event";
    if (
      this.text.startsWith("Just completed") ||
      this.text.startsWith("Just posted")
    )
      return "completed_event";
    if (
      this.text.includes("Achieved") ||
      this.text.includes("set a goal") ||
      this.text.toLowerCase().includes("personal record")
    )
      return "achievement";
    return "miscellaneous";
  }

  //returns a boolean, whether the text includes any content written by the person tweeting.
  get written(): boolean {
    if (this.source !== "completed_event") return false;
    const dashIdx = this.text.indexOf(" - ");
    const linkIdx = this.text.indexOf(" https://");
    if (dashIdx === -1 || linkIdx === -1) return false;
    const text = this.text.substring(dashIdx + 3, linkIdx).trim();
    return text.length > 0;
  }

  get writtenText(): string {
    if (!this.written) return "";
    const dashIdx = this.text.indexOf(" - ");
    const linkIdx = this.text.indexOf(" https://");
    return dashIdx !== -1 && linkIdx !== -1
      ? this.text.substring(dashIdx + 3, linkIdx).trim()
      : "";
  }

  get activityType(): string {
    if (this.source !== "completed_event") return "";
    if (this.text.includes("walk")) return "walk";
    if (this.text.includes("run")) return "run";
    if (this.text.includes("bike")) return "bike";
    return "";
  }

  get distance(): number {
    if (this.source !== "completed_event") return 0;
    const kmIdx = this.text.indexOf(" km");
    const miIdx = this.text.indexOf(" mi");
    if (kmIdx === -1 && miIdx === -1) return 0;
    const unitIdx =
      kmIdx !== -1 && (miIdx === -1 || kmIdx < miIdx) ? kmIdx : miIdx;
    const isKm = unitIdx === kmIdx;
    let startIdx = unitIdx - 1;
    while (
      startIdx >= 0 &&
      ((this.text[startIdx] >= "0" && this.text[startIdx] <= "9") ||
        this.text[startIdx] === ".")
    ) {
      startIdx--;
    }
    const dist = parseFloat(this.text.substring(startIdx + 1, unitIdx));
    if (isNaN(dist)) return 0;
    return isKm ? dist / 1.609 : dist;
  }

  getHTMLTableRow(rowNumber: number): string {
    return `<tr><td>${rowNumber}</td><td>${this.activityType}</td><td>${this.text}</td></tr>`;
  }
}
