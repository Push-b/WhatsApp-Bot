import FormData from "form-data";
import axios from "axios";
const NsfwDetector = async (file) => {
  try {
    const api = `https://www.nyckel.com/v1/functions/mcpf3t3w6o3ww7id/invoke`;
    const formData = new FormData();
    file.ext = file.ext.includes("mp4") ? "gif" : file.ext;
    file.mime = file.mime.includes("mp4") ? "image/gif" : file.mime;
    formData.append("file", file.data, {
      filename: `file.${file.ext}`,
      contentType: file.mime,
    });
    const res = await axios.post(api, formData, {
      headers: formData.getHeaders(),
    });
    return res.data;
  } catch {
    return null;
  }
};

export default NsfwDetector;
