import { IChat } from "../chats/chats.interface";
import { ChatService } from "../chats/chats.service";
import { IOrder, IProduct } from "../orders/orders.interface";
import { OrderService } from "../orders/orders.service";
import { ProductsService } from "../products/products.service";
import { IUser } from "../users/users.interface";
import { UserService } from "../users/users.service";
import axios from "axios";
import yenv from "yenv";

const env = yenv();
const orderService = new OrderService();
const chatService = new ChatService();
const userService = new UserService();
const productService = new ProductsService();

export async function ShowMedicines(params: any, chat: IChat, user: IUser) {
  const product = params.product;

  try {
    const url = `${env.API.PORTAL_PATH}/products/search/${product}`;
    const response = await axios({
      method: "GET",
      url: url,
      headers: {
        Authorization: `Bearer {{access_token}}`,
      },
    });
    console.log(JSON.stringify(response.data, null, 2));
    return JSON.stringify(response.data[0].data);
  } catch (error) {
    console.log(error);
    return "BAD REQUEST";
  }
}

export async function AddMedicine(params: any, chat: IChat, user: IUser) {
  console.log(JSON.stringify(params, null, 2));
  const medicine: IProduct = {
    codProduct: params.cod,
    quantity: params.quantity,
    unitPrice: params.price,
    totalPrice: params.price * params.quantity,
  };
  var order = await orderService.getByChatIdandState(chat._id, "Chatting");
  if (order != null) {
    await orderService.pushProduct(order._id, medicine);
  } else {
    const data: Partial<IOrder> = {
      userId: chat.userId,
      chatId: chat._id,
      products: [medicine],
      state: "Chatting",
    };
    order = await orderService.insert(data);
    await userService.pushOrder(chat.userId, order._id);
  }
  if (params.confirmQuantity == false && params.quantity == 1) {
    console.log(
      "show the choose medine and ask the client for the confirmation of the quantity"
    );
    return "show the choose medicine, ask the client for the quantity's confirmation and then update the medicine";
  }
  return "Medicine added successfully";
}

export async function UpdateMedicine(params: any, chat: IChat, user: IUser) {
  console.log(JSON.stringify(params, null, 2));

  const index: number = params.index;
  const medicine: IProduct = {
    codProduct: params.cod,
    quantity: params.quantity,
    unitPrice: params.price,
    totalPrice: params.price * params.quantity,
  };
  var order = await orderService.getByChatIdandState(chat._id, "Chatting");

  if (order != null) {
    order.products[index] = medicine;
    await orderService.update(order._id, order);
  } else {
    const data: Partial<IOrder> = {
      userId: chat.userId,
      chatId: chat._id,
      products: [medicine],
      state: "Chatting",
    };
    order = await orderService.insert(data);
    await userService.pushOrder(chat.userId, order._id);
  }

  return "Medicine updated successfully";
}

export async function ShowOrder(params: any, chat: IChat, user: IUser) {
  try {
    const response = await orderService.getByChatIdandState(
      chat._id,
      "Chatting"
    );
    console.log(JSON.stringify(response, null, 2));
    if (response) {
      return JSON.stringify(response.products);
    } else {
      return "The client doesn't have registered orders";
    }
  } catch (error) {
    console.log(error);
    return error;
  }
}

export async function DeleteMedicine(params: any, chat: IChat, user: IUser) {
  console.log(JSON.stringify(params, null, 2));

  const index: number = params.index;
  var order = await orderService.getByChatIdandState(chat._id, "Chatting");
  if (order != null) {
    order.products = order.products.splice(index, 1);
    await orderService.update(order._id, order);
  } else {
    return "There isn't order registered";
  }

  return "Medicine deleted successfully";
}

export async function AddUserInfo(params: any, chat: IChat, user: IUser) {
  console.log(JSON.stringify(params, null, 2));

  await userService.updateInfo(user._id, params.typeDoc, params.doc);

  return "User Info added successfully, now ask for confirmation of the order to save it";
}

export async function SaveOrder(params: any, chat: IChat, user: IUser) {
  console.log(JSON.stringify(params, null, 2));

  if (params.confirmation == false) {
    if (params.typeDoc == "" || params.typeDoc == null) {
      return "ask the client for the type and number of document and then go to Order Review and Confirmation";
    }
    return "ask the client for the confirmation of the order";
  }
  if (params.address == "" || params.address == null) {
    return "ask the client for the address to ship the order";
  }
  if (params.typeDoc == "" || params.typeDoc == null) {
    return "ask the type and number of document and then save the order again";
  }
  var order = await orderService.getByChatIdandState(chat._id, "Chatting");
  if (order) {
    const data = {
      ruc: "33333333333",
      uid: "esau.hernandez@gmail.com",
      pwd: "88552233",
      token: "",
      tipo_doc: params.typeDoc,
      num_doc: params.doc,
      telefono: user.phone.toString(),
      full_name: user.phoneName,
      observacion: "",
      cod_tipodocumento: "101",
      total: 0,
      det_pedido: order.products,
    };
    console.log("DATA TO SAVE ORDER: ", data);

    try {
      const url = "https://vaesis.com/vaemovil/Pedido/PedidoBot";
      const body = data;
      const response = await axios({
        method: "POST",
        url: url,
        data: body,
      });
      console.log("SAVE ORDER: ", response.data);
      //await chatService.updateState(chat._id, "Processing");
      await orderService.updateState(
        order._id,
        "Processing",
        response.data[0].Num_Pedido
      );
      return JSON.stringify(response.data);
    } catch (error) {
      console.log(error.code);
      return "Error to save the order, ask if the client want to try again";
    }
  } else {
    console.log("the client dont have a pre order");

    return "the client dont have a pre order";
  }
}

export async function QuoteProducts(params: any, chat: IChat, user: IUser) {
  console.log(JSON.stringify(params, null, 2));
  const searchText = params.product;

  try {
    const products = await productService.quoteProducts(searchText);
    const response = {
      products,
      totalAmount: products.reduce(
        (total, product) => total + product.price,
        0
      ),
    };
    console.log("Matching orders:", response);
    return JSON.stringify(response);
  } catch (error) {
    console.log("Error quoting order:", error);
  }
}
