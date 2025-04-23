import { Category } from "../models/model.categories.js";


export const getCategories = async (req, res) => {
    try {
        const userId = req.user._id;

        //Fetch all categories created by the user
        const categories = await Category.find({ createdBy: userId }).populate("clients", "name email");

        //Check if the user has any categories
        if (categories.length === 0) {
            return res.status(404).json({ message: "No categories found" });
        }
        //Check if the categories were fetched successfully
        if (!categories) {
            return res.status(400).json({ message: "Failed to fetch categories" });
        }

        res.status(200).json(categories);
    } catch (error) {
        console.error("Error fetching categories:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}

export const createCategory = async(req,res) => {
    try{
        const {name, categoryClients } = req.body;
        const userId = req.user._id;

        //Check if category exists
        const categoryExists = await Category.findOne({ categoryId: `catg-${name}-${userId}` });

        if(categoryExists){
            return res.status(400).json({ message: "Category already exists" });
        }


        //Create the category 
        const category = await Category.create({
            name,
            categoryId: `catg-${name}-${userId}`,
            createdBy: userId,
            clients: categoryClients
        });
        //Check if the category was created successfully
        if(!category){
            return res.status(400).json({ message: "Category creation failed" });
        }

        res.status(201).json({
            message: "Category created successfully",
            category
        });

    } catch(error){
        console.error("Error creating category:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}

export const deleteCategoryById = async (req, res) => {
    try{
        const { id } = req.params;
        const userId = req.user._id;

        //Check if category exists
        const categoryExists = await Category.findOne({ categoryId: `catg-${id}-${userId}`, createdBy: userId });

        if(!categoryExists){
            return res.status(404).json({ message: "Category not found" });
        }

        //Delete the category
        const deletedCategory = await Category.findOneAndDelete({ categoryId: `catg-${id}-${userId}`, createdBy: userId });
        //Check if the category was deleted successfully
        if(!deletedCategory){
            return res.status(400).json({ message: "Category deletion failed" });
        }
        res.status(200).json({
            message: "Category deleted successfully",
            deletedCategory
        });
    }
    catch(error){
        console.error("Error deleting category:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}