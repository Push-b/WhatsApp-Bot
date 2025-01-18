import axios from "axios";

export default class YTDL {
  constructor(url, type = "video") {
    this.url = url;
    this.type = type;
  }

  download = async () => {
    try {
      let res = await axios.get(
        `https://olduser.us.kg/youtube/${
          this.type === "video" ? "vid" : "aud"
        }?ytlink=${this.url}&apikey=anya-md`
      );

      let dl_link = this.type === "video" ? res.data.video : res.data.audio;
      
      let response = await axios.get(dl_link, {
        responseType: "arraybuffer",
      });
      return response.data;
    } catch (error) {
      throw new Error(error);
    }
  };
}
