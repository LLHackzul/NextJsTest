"use client";

import React, { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  IconButton,
  Typography,
  Box,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import AddIcon from "@mui/icons-material/Add";
import Swal from "sweetalert2";
import AddProductDialog from "@/components/Dialogs/AddProductDialog";
import EditProductDialog from "@/components/Dialogs/EditProductDialog";
import axiosClient, { setAuthToken } from "../utils/axiosClient";

interface Product {
  ProductId: number;
  Name: string;
  Description: string;
  Price: number;
  Stock: number;
}
const transformProductKeys = (data: any): Product => {
  return {
    ProductId: data.productId,
    Name: data.name,
    Description: data.description,
    Price: data.price,
    Stock: data.stock,
  };
};
const transformProducts = (data: any[]): Product[] => {
  return data.map(transformProductKeys);
};
export default function Products() {
  const [products, setProducts] = useState<Product[]>([]);
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  useEffect(() => {
    const fetchToken = async () => {
      try {
        const credentials = {
          username: "admin",
          password: "password",
        };

        const response = await axiosClient.post("/Auth/token", credentials);
        setAuthToken(response.data.token);
        fetchProducts();
      } catch (error) {
        Swal.fire(
          "Error",
          "No se pudo obtener el token de autenticación",
          "error"
        );
      }
    };
    fetchToken();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await axiosClient.get("/Products");
      const transformedProducts = transformProducts(response.data);
      setProducts(transformedProducts);
    } catch (error) {
      Swal.fire("Error", "No se pudieron cargar los productos", "error");
    }
  };

  const handleAddProduct = async (newProduct: Omit<Product, "ProductId">) => {
    try {
      const response = await axiosClient.post("/Products", newProduct);
      fetchProducts();
      setOpenAddDialog(false);
      Swal.fire("Éxito", "Producto agregado correctamente", "success");
    } catch (error) {
      Swal.fire("Error", "No se pudo agregar el producto", "error");
    }
  };

  const handleEditProduct = async (editedProduct: Product) => {
    try {
      const response = await axiosClient.put("/Products", editedProduct);
      fetchProducts();
      setOpenEditDialog(false);
      Swal.fire("Éxito", "Producto actualizado correctamente", "success");
    } catch (error) {
      Swal.fire("Error", "No se pudo actualizar el producto", "error");
    }
  };

  const handleDeleteProduct = async (productId: number) => {
    Swal.fire({
      title: "¿Estás seguro?",
      text: "No podrás revertir esta acción!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Sí, eliminar!",
      cancelButtonText: "Cancelar",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const response = await axiosClient.delete("/Products", {
            data: { productId },
          });
          fetchProducts();
          Swal.fire("Eliminado!", "El producto ha sido eliminado.", "success");
        } catch (error) {
          Swal.fire("Error", "No se pudo eliminar el producto", "error");
        }
      }
    });
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Listado de Productos
      </Typography>
      <Button
        variant="contained"
        startIcon={<AddIcon />}
        onClick={() => setOpenAddDialog(true)}
        sx={{ mb: 2 }}
      >
        Agregar Producto
      </Button>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Nombre</TableCell>
              <TableCell>Descripción</TableCell>
              <TableCell>Precio</TableCell>
              <TableCell>Stock</TableCell>
              <TableCell>Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {products.map((product) => (
              <TableRow key={product.ProductId}>
                <TableCell>{product.ProductId}</TableCell>
                <TableCell>{product.Name}</TableCell>
                <TableCell>{product.Description}</TableCell>
                <TableCell>${product.Price.toFixed(2)}</TableCell>
                <TableCell>{product.Stock}</TableCell>
                <TableCell>
                  <IconButton
                    onClick={() => {
                      setEditingProduct(product);
                      setOpenEditDialog(true);
                    }}
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    onClick={() => handleDeleteProduct(product.ProductId)}
                  >
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <AddProductDialog
        open={openAddDialog}
        onClose={() => setOpenAddDialog(false)}
        onAdd={handleAddProduct}
      />
      <EditProductDialog
        open={openEditDialog}
        onClose={() => setOpenEditDialog(false)}
        onEdit={handleEditProduct}
        product={editingProduct}
      />
    </Box>
  );
}
