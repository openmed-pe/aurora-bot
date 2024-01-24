import ProductModel from "./products.model";

export class ProductsService {
    
    async quoteProducts(text: string) {
        return ProductModel.find({
            product: { $regex: new RegExp(text, 'i') }
        })
    }
}