import axios from "axios";
import yenv from "yenv";

const env = yenv();

export class ZucaritasService {
  async sendMessage(content: string, phone_number_id: any, from: any) {
    const res = await axios({
      method: "POST", // Required, HTTP method, a string, e.g. POST, GET
      url:
        "https://graph.facebook.com/v12.0/" +
        phone_number_id +
        "/messages?access_token=" +
        env.WSSP.CHAT_TOKEN,
      data: {
        messaging_product: "whatsapp",
        to: from,
        text: { body: content },
      },
      headers: { "Content-Type": "application/json" },
    });

    return res;
  }
}
