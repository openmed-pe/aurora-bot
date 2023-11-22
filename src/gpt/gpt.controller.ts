import { Request, Response } from "express";
import { OpenAI } from "openai";
import yenv from "yenv";
import { GptDataModel, NameFuntions } from "./gpt.model";

const env = yenv();

var data: GptDataModel = {
  products: null,
  location: null,
  confirm: null,
  completed: false,
};

async function atendanceFuntions() {
  function checkCompletion() {
    if (data.products) {
      const hasCompletedData =
        data.products.length > 0 && data.location !== null && data.confirm;
      data.completed = hasCompletedData;
    } else {
      data.completed = false;
    }
  }
  function identifyProducts(params: any) {
    console.log("identifyProducts: ", params);
    if (params.products) {
      data.products = params.products;
    }
  }
  function identifyLocation(params: any) {
    console.log("identifyLocation: ", params);
    if (data.products) {
      const required = data.products.length > 0;
      if (required && params.location) {
        data.location = params.location;
      }
    }
  }
  function confirm(params: any) {
    console.log("confirm: ", params);
    if ("confirm" in params) {
      data.confirm = params.confirm;
    }
  }

  function build() {
    checkCompletion();
    return {
      data,
    };
  }

  return {
    data,
    identifyProducts,
    identifyLocation,
    confirm,
    build,
  };
}

const openAi = new OpenAI({
  apiKey: env.GPT.TOKEN,
});

export class GptController {
  async generateThreads() {
    const response = openAi.beta.threads.create();
    return response;
  }

  async generateResponse(chatHistory: any) {
    console.log(chatHistory);
    const response = await openAi.chat.completions.create({
      model: "gpt-3.5-turbo",
      temperature: 0.6,
      messages: [
        {
          role: "system",
          content:
            "You area a sales assistant of a big store, your name is Aurora. If user ask other things try to conduce him to the product that the user needs.",
        },
        ...chatHistory,
      ],
      functions: [
        {
          name: "identifyProducts",
          description: "get product that user needs",
          parameters: {
            type: "object",
            properties: {
              products: {
                type: "array",
                description: "name of products",
                items: {
                  type: "string",
                  description: "name of products",
                },
              },
            },
          },
        },
        {
          name: "identifyLocation",
          description:
            "identify full location where the user will recibe the product",
          parameters: {
            type: "object",
            properties: {
              location: {
                type: "string",
                description: "location where the user will recibe the product",
              },
            },
          },
        },
        {
          name: "confirm",
          description:
            "Confirmation of the user to ship the product when all information is completed",
          parameters: {
            type: "object",
            properties: {
              confirm: {
                type: "boolean",
                description: "User's confirmation",
              },
            },
            required: ["confirm"],
          },
        },
      ],
      function_call: "auto",
    });
    console.log("RESPONSE ONE", response);
    const choise = response.choices[0].message;
    const graph = await atendanceFuntions();
    if (choise.function_call) {
      const functionName: NameFuntions = choise.function_call
        .name as NameFuntions;
      graph[functionName](JSON.parse(choise.function_call.arguments));
      const build = graph.build();
      const content = `
      List of items 
      products: ${build.data.products ? build.data.products.join(",") : ""}
      location: ${build.data.location}
      confirm: ${build.data.confirm}
    `;
      const answer = await openAi.chat.completions.create({
        model: "gpt-3.5-turbo",
        temperature: 0.6,
        messages: [
          {
            role: "system",
            content: `
            You are a sales assistant. Be consise and answer in the input language spanish or english, etc.
            If an item has value, don't ask for that item and ask for other that is empty, just one question.
            ---
            Order of priority to ask for items: it is mean products must be asked first than location and so on
            "products" > "location" > "confirm"
            ---
            1. products: Ask for name of the product (Empty if it is ''). 
            2. location: Ask where the user is living to ship the order (Empty if it is null).
            3. confirm: Ask for  for user confirmation for the products and ship them to his location (Empty if it is null).
            ---
            If all information is completed. give the user thanks for information.

          `,
          },
          ...chatHistory,
          {
            role: "user",
            content: content,
          },
        ],
      });
      console.log("RESPONSE TWO", answer);
      console.log(JSON.stringify(data, null, 2));
      const responseMessage = answer.choices[0].message;
      return responseMessage;
    }
    const responseMessage = response.choices[0].message;
    return responseMessage;
  }
}
