import axios from "axios";
import yts from "yt-search";
import { CookieJar } from "tough-cookie";
import { wrapper } from "axios-cookiejar-support";
import * as cheerio from "cheerio";

class YouTubeDownloader {
  constructor() {
    this.y2save = {
      baseURL: "https://y2save.com",
      headers: {
        accept: "application/json, text/javascript, /; q=0.01",
        "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
        origin: "https://y2save.com",
        referer: "https://y2save.com/id",
        "user-agent": "Postify/1.0.0",
        "x-requested-with": "XMLHttpRequest",
      },
      formats: {
        mp4: ["360P", "480p", "720p", "1080p"],
        mp3: ["128kbps"],
      },
      client: wrapper(axios.create({ jar: new CookieJar() })),
    };
  }

  extractVideoId(url) {
    const regex =
      /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
    const match = url.match(regex);
    return match ? match[1] : null;
  }

  async getVideoInfo(videoId) {
    const videoData = await yts({ videoId });
    return {
      title: videoData.title,
      description: videoData.description,
      url: videoData.url,
      videoId: videoData.videoId,
      seconds: videoData.seconds,
      timestamp: videoData.timestamp,
      views: videoData.views,
      genre: videoData.genre,
      uploadDate: videoData.uploadDate,
      ago: videoData.ago,
      image: videoData.image,
      thumbnail: videoData.thumbnail,
      author: videoData.author,
    };
  }

  async searchVideos(query) {
    const results = await yts(query).then((r) => r.videos);
    return results.map((video) => ({
      title: video.title,
      id: video.videoId,
      url: video.url,
      media: {
        thumbnail: video.thumbnail || "",
        image: video.image,
      },
      description: video.description,
      duration: {
        seconds: video.seconds,
        timestamp: video.timestamp,
      },
      published: video.ago,
      views: video.views,
      author: video.author,
    }));
  }

  async processYouTubeInput(input) {
    if (!input.trim()) {
      throw new Error("Please provide a YouTube URL or search query");
    }

    const isYouTubeUrl = /youtu(\.)?be/.test(input);

    if (isYouTubeUrl) {
      const videoId = this.extractVideoId(input);
      if (!videoId) {
        throw new Error("Invalid YouTube video ID");
      }
      const videoInfo = await this.getVideoInfo(videoId);
      return {
        type: "download",
        download: { ...videoInfo },
      };
    } else {
      const searchResults = await this.searchVideos(input);
      return {
        type: "search",
        query: input,
        total: searchResults.length,
        videos: searchResults,
      };
    }
  }

  async getToken() {
    try {
      const response = await this.y2save.client.get(
        `${this.y2save.baseURL}/id`,
        {
          headers: this.y2save.headers,
        },
      );
      const $ = cheerio.load(response.data);
      return $('meta[name="csrf-token"]').attr("content");
    } catch (error) {
      console.error("Failed to get CSRF token");
      return "error";
    }
  }

  async search(query) {
    try {
      const token = await this.getToken();
      const response = await this.y2save.client.post(
        `${this.y2save.baseURL}/search`,
        `_token=${token}&query=${encodeURIComponent(query)}`,
        { headers: this.y2save.headers },
      );
      return response.data;
    } catch (error) {
      console.error("Search failed");
      return "error";
    }
  }

  async convert(videoId, key) {
    try {
      const token = await this.getToken();
      const response = await this.y2save.client.post(
        `${this.y2save.baseURL}/searchConvert`,
        `_token=${token}&vid=${videoId}&key=${encodeURIComponent(key)}`,
        { headers: this.y2save.headers },
      );
      return response.data;
    } catch (error) {
      console.error("Conversion failed");
      return "error";
    }
  }

  getFormats(response) {
    return {
      mp4: response.data.convert_links.video.map((v) => v.quality),
      mp3: response.data.convert_links.audio.map((a) => a.quality),
    };
  }

  async download(url, format, quality) {
    try {
      if (!["mp3", "mp4"].includes(format)) {
        return "Format not available";
      }

      const searchResult = await this.search(url);
      if (searchResult.status !== "ok") {
        return "Search failed";
      }

      const links =
        format === "mp4"
          ? searchResult.data.convert_links.video
          : searchResult.data.convert_links.audio;

      const selectedQuality =
        links.find((l) => l.quality === quality) ||
        links.find((l) => l.quality === "720p") ||
        links.find((l) => l.quality === "1080p") ||
        links.find((l) => l.quality === "360P");

      const conversionResult = await this.convert(
        searchResult.data.vid,
        selectedQuality.key,
      );
      if (conversionResult.status !== "ok") {
        return "Conversion failed";
      }

      return conversionResult.dlink;
    } catch (error) {
      console.error(error);
      return "Download failed";
    }
  }

  async downloadAudio(url) {
    return await this.download(url, "mp3", "128kbps");
  }

  async downloadVideo(url) {
    return await this.download(url, "mp4", "720p");
  }

  async ytmp3(url) {
    try {
      const audioUrl = await this.downloadAudio(url);
      const videoInfo = await this.processYouTubeInput(url);
      const details = videoInfo.download;

      return {
        title: details.title || "",
        audio: audioUrl,
        author: details.author.name || "",
        description: details.description || "",
        duration: details.timestamp || "",
        views: details.views.toLocaleString() || "",
        upload: details.uploadDate || "",
        thumbnail:
          details.thumbnail ||
          "https://lh3.googleusercontent.com/3zkP2SYe7yYoKKe47bsNe44yTgb4Ukh__rBbwXwgkjNRe4PykGG409ozBxzxkrubV7zHKjfxq6y9ShogWtMBMPyB3jiNps91LoNH8A=s500",
      };
    } catch (error) {
      throw error;
    }
  }

  async ytmp4(url) {
    try {
      const videoUrl = await this.downloadVideo(url);
      const videoInfo = await this.processYouTubeInput(url);
      const details = videoInfo.download;
      return {
        title: details.title || "",
        video: videoUrl,
        author: details.author.name || "",
        description: details.description || "",
        duration: details.timestamp || "",
        views: details.views.toLocaleString() || "",
        upload: details.uploadDate || "",
        thumbnail:
          details.thumbnail ||
          "https://lh3.googleusercontent.com/3zkP2SYe7yYoKKe47bsNe44yTgb4Ukh__rBbwXwgkjNRe4PykGG409ozBxzxkrubV7zHKjfxq6y9ShogWtMBMPyB3jiNps91LoNH8A=s500",
      };
    } catch (error) {
      throw error;
    }
  }
}

const ytdl = new YouTubeDownloader();
export default ytdl;
