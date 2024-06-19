import { Request, Response } from 'express';
import prisma from '@/prisma';
import { Product, ProductGender, ProductTypes } from '@prisma/client'; // Import the enum type
import { v4 as uuidv4 } from 'uuid';

export class CategoryController {
  async getCategory(req: Request, res: Response) {
    const { gender, type } = req.query;
    try {
        await prisma.$transaction(async (tx)=> {
            if (gender?.length == 0 && type?.length == 0) {
                const category = await tx.productCategory.findMany()
                console.log(category);
                
                return res.status(200).send({
                    status: 'ok',
                    message: 'Categories found',
                    category
                  });
            }
            if (typeof gender === 'string' && !type) {
                const productGender: ProductGender = gender.toUpperCase() as ProductGender;
          
                const tops = await tx.productCategory.findMany({
                  where: {
                    gender: productGender,
                    type: "TOPS"
                  },
                });
                const bottoms = await tx.productCategory.findMany({
                    where: {
                      gender: productGender,
                      type: "BOTTOMS"
                    },
                });
                const accessories = await tx.productCategory.findMany({
                    where: {
                      gender: productGender,
                      type: "ACCESSORIES"
                    },
                });        
                return res.status(200).send({
                  status: 'ok',
                  message: 'Categories found',
                  tops,
                  bottoms,
                  accessories
                });
            }
            if (typeof gender === 'string' && typeof type === 'string') {
              const productGender: ProductGender = gender.toUpperCase() as ProductGender;
              const productTypes: ProductTypes = type.toUpperCase() as ProductTypes

              const category = await tx.productCategory.findMany({
                  where: {
                      gender: productGender,
                      type: productTypes
                  }
              })
              return res.status(200).send({
                  status: 'ok',
                  message: 'Categories found',
                  category
                });
            }
        })
    } catch (error) {
        res.status(400).send({
            status: 'error',
            message: error,
        });
    }

  }

  async createCategory(req: Request, res: Response) {
    try {
      console.log(req.body);
      const {type, gender, category } = req.body

      const existingCategory = await prisma.productCategory.findMany({
        where: {
          gender,
          type,
        }
      })

      const checkDuplicate = existingCategory.find((cat) => cat.category.toLowerCase() === category.toLowerCase())
      console.log(checkDuplicate);
      
      
      if (checkDuplicate) throw "Category already exists."

      await prisma.productCategory.create({
        data: {
          id: uuidv4(),
          ...req.body
        }
      })
      res.status(200).send({
        status: 'ok',
        message: 'Category created.'
      })

    } catch (error) {
        res.status(400).send({
          status: 'error',
          message: error,
        });
    }
  }

  async editCategory(req: Request, res: Response) {
    try {
      const {type, gender, category, newCategory } = req.body
      
      const currentCategory = await prisma.productCategory.findFirst({
        where: {
          gender,
          type,
          category
        }
      })
      const existingCategory = await prisma.productCategory.findMany({
        where: {
          gender,
          type,
        }
      })

      const checkDuplicate = existingCategory.find((cat) => cat.category.toLowerCase() === newCategory.toLowerCase() && cat.id !== currentCategory?.id)
      if (checkDuplicate) throw "Category already exists."

      const toEditCategory = await prisma.productCategory.findFirst({
        where: {
          gender,
          type,
          category
        }
      })

      await prisma.productCategory.update({
        where: {
          id: toEditCategory?.id
        },
        data: {
          category: newCategory
        }
      })

      res.status(200).send({
        status: 'ok',
        message: 'Category edited.'
      })
    } catch (error) {
        res.status(400).send({
          status: 'error',
          message: error,
        });
    }
  }

  async deleteCategory(req: Request, res: Response) {
    try {
      const {id } = req.params
      
      const containsProducts = await prisma.product.findFirst({
        where: {
          categoryID: id
        }
      })
      
      if (containsProducts) throw "Cannot delete category that is being used."

      await prisma.productCategory.delete({
        where: {
          id
        }
      })

      res.status(200).send({
        status: 'ok',
        message: 'Category deleted.'
      })
    } catch (error) {
        res.status(400).send({
          status: 'error',
          message: error,
        });
    }
  }
}
