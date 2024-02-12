import { Request, Response } from "express";
import { OpenAI } from "openai";
import yenv from "yenv";
import { GptDataModel, NameFuntions } from "./gpt.model";
import { resolve } from "path";
import {
  ShowMedicines,
  SaveOrder,
  AddMedicine,
  UpdateMedicine,
  ShowOrder,
  AddUserInfo,
  DeleteMedicine,
  QuoteProducts,
} from "../gpt/gpt.functions";
import { IChat } from "../chats/chats.interface";
import { IUser } from "../users/users.interface";

const env = yenv();
const openAi = new OpenAI({
  apiKey: env.GPT.TOKEN,
});

var global = {
  showMedicines: ShowMedicines,
  saveOrder: SaveOrder,
  addMedicine: AddMedicine,
  updateMedicine: UpdateMedicine,
  showOrder: ShowOrder,
  addUserInfo: AddUserInfo,
  deleteMedicine: DeleteMedicine,
  quoteProducts: QuoteProducts,
} satisfies Record<NameFuntions, any>;

export class GptController {
  async generateThreads(user: IUser) {
    const thread = await openAi.beta.threads.create({
      metadata: { userName: user.phoneName, orders: 0 },
    });
    return thread;
  }

  async retrieveThreads(req: Request, res: Response) {
    console.log(req.params);
    try {
      const thread = await openAi.beta.threads.retrieve(req.params.id);
      res.status(200).json({
        status: 200,
        data: thread,
        message: "THREAD_LISTED_BYID",
      });
    } catch (error) {
      console.log(error);
      res.status(500).json("ERROR_GETTING_THREAD");
    }
  }

  async generateNewResponse(user: IUser, chat: IChat, content: string) {
    const threadMessages = await openAi.beta.threads.messages.create(
      chat.threadId,
      {
        role: "user",
        content: content,
      }
    );
    // console.log("threadMessages : ", JSON.stringify(threadMessages, null, 2));

    const run = await openAi.beta.threads.runs.create(chat.threadId, {
      assistant_id: env.GPT.ID,
    });
    // console.log("RUN THREAD: ", JSON.stringify(run, null, 2));

    let runStatus = await openAi.beta.threads.runs.retrieve(
      chat.threadId,
      run.id
    );
    while (runStatus.status !== "completed") {
      await new Promise((resolve) => setTimeout(resolve, 2000));
      runStatus = await openAi.beta.threads.runs.retrieve(
        chat.threadId,
        run.id
      );

      if (runStatus.status === "requires_action") {
        //console.log(runStatus.required_action.submit_tool_outputs.tool_calls);
        const toolCalls =
          runStatus.required_action.submit_tool_outputs.tool_calls;
        const toolOutputs = [];

        for (const toolCall of toolCalls) {
          const functionName: NameFuntions = toolCall.function
            .name as NameFuntions;
          console.log(
            `This question requires us to call a function: ${functionName}`
          );
          const args = JSON.parse(toolCall.function.arguments);

          const argsArray = Object.keys(args).map((key) => args[key]);

          // Dynamically call the function with arguments
          //const output = await global[functionName].apply(null, [args]);

          const output = await global[functionName](args, chat, user);
          console.log("OUTPUT: ", output);
          toolOutputs.push({
            tool_call_id: toolCall.id,
            output: output,
          });
        }
        // Submit tool outputs
        await openAi.beta.threads.runs.submitToolOutputs(
          chat.threadId,
          run.id,
          {
            tool_outputs: toolOutputs,
          }
        );
        continue; // Continue polling for the final response
      }

      // Check for failed, cancelled, or expired status
      if (["failed", "cancelled", "expired"].includes(runStatus.status)) {
        console.log(
          `Run status is '${runStatus.status}'. Unable to complete the request.`
        );
        break; // Exit the loop if the status indicates a failure or cancellation
      }
    }

    const response = await openAi.beta.threads.messages.list(chat.threadId);
    const lastResponse: any = response.data
      .filter(
        (message) => message.run_id === run.id && message.role === "assistant"
      )
      .pop();
    //console.log("LAST RESPONSE: ", lastResponse);
    if (lastResponse) {
      return lastResponse.content[0].text.value;
    } else {
      return "FAIL";
    }
  }

  // async generateResponse(chatHistory: any) {
  //   console.log(chatHistory);
  //   const response = await openAi.chat.completions.create({
  //     model: "gpt-3.5-turbo",
  //     temperature: 0.6,
  //     messages: [
  //       {
  //         role: "system",
  //         content:
  //           "You area a sales assistant of a big store, your name is Aurora. If user ask other things try to conduce him to the product that the user needs.",
  //       },
  //       ...chatHistory,
  //     ],
  //     functions: [
  //       {
  //         name: "identifyProducts",
  //         description: "get product that user needs",
  //         parameters: {
  //           type: "object",
  //           properties: {
  //             products: {
  //               type: "array",
  //               description: "name of products",
  //               items: {
  //                 type: "string",
  //                 description: "name of products",
  //               },
  //             },
  //           },
  //         },
  //       },
  //       {
  //         name: "identifyLocation",
  //         description:
  //           "identify full location where the user will recibe the product",
  //         parameters: {
  //           type: "object",
  //           properties: {
  //             location: {
  //               type: "string",
  //               description: "location where the user will recibe the product",
  //             },
  //           },
  //         },
  //       },
  //       {
  //         name: "confirm",
  //         description:
  //           "Confirmation of the user to ship the product when all information is completed",
  //         parameters: {
  //           type: "object",
  //           properties: {
  //             confirm: {
  //               type: "boolean",
  //               description: "User's confirmation",
  //             },
  //           },
  //           required: ["confirm"],
  //         },
  //       },
  //     ],
  //     function_call: "auto",
  //   });
  //   console.log("RESPONSE ONE", response);
  //   const choise = response.choices[0].message;
  //   const graph = await atendanceFuntions();
  //   if (choise.function_call) {
  //     const functionName: NameFuntions = choise.function_call
  //       .name as NameFuntions;
  //     graph[functionName](JSON.parse(choise.function_call.arguments));
  //     const build = graph.build();
  //     const content = `
  //     List of items
  //     products: ${build.data.products ? build.data.products.join(",") : ""}
  //     location: ${build.data.location}
  //     confirm: ${build.data.confirm}
  //   `;
  //     const answer = await openAi.chat.completions.create({
  //       model: "gpt-3.5-turbo",
  //       temperature: 0.6,
  //       messages: [
  //         {
  //           role: "system",
  //           content: `
  //           You are a sales assistant. Be consise and answer in the input language spanish or english, etc.
  //           If an item has value, don't ask for that item and ask for other that is empty, just one question.
  //           ---
  //           Order of priority to ask for items: it is mean products must be asked first than location and so on
  //           "products" > "location" > "confirm"
  //           ---
  //           1. products: Ask for name of the product (Empty if it is '').
  //           2. location: Ask where the user is living to ship the order (Empty if it is null).
  //           3. confirm: Ask for  for user confirmation for the products and ship them to his location (Empty if it is null).
  //           ---
  //           If all information is completed. give the user thanks for information.

  //         `,
  //         },
  //         ...chatHistory,
  //         {
  //           role: "user",
  //           content: content,
  //         },
  //       ],
  //     });
  //     console.log("RESPONSE TWO", answer);
  //     console.log(JSON.stringify(data, null, 2));
  //     const responseMessage = answer.choices[0].message;
  //     return responseMessage;
  //   }
  //   const responseMessage = response.choices[0].message;
  //   return responseMessage;
  // }
}
