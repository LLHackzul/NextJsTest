'use client';

import React, { useState, useEffect } from 'react';
import { 
  Box, Typography, TextField, Button, Table, TableBody, TableCell, 
  TableContainer, TableHead, TableRow, Paper, Autocomplete
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import Swal from 'sweetalert2';
import axiosClient, { setAuthToken } from "../utils/axiosClient";

interface Product {
  ProductId: number;
  Name: string;
  Price: number;
  Stock: number;
}

interface OrderItem {
  product: Product;
  quantity: number;
}

export default function Order() {
  const [products, setProducts] = useState<Product[]>([]);
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [customerName, setCustomerName] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const transformProductKeys = (data: any): Product => ({
    ProductId: data.productId,
    Name: data.name,
    Price: data.price,
    Stock: data.stock,
  });

  const fetchProducts = async () => {
    try {
      const response = await axiosClient.get('/Products');
      const transformedProducts = response.data.map(transformProductKeys);
      setProducts(transformedProducts);
    } catch (error) {
      Swal.fire('Error', 'No se pudieron cargar los productos', 'error');
      console.error('Error al obtener productos:', error);
    }
  };

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
  const addToOrder = () => {
    if (!selectedProduct) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Por favor, seleccione un producto.',
      });
      return;
    }

    const quantityNum = parseInt(quantity);
    if (isNaN(quantityNum) || quantityNum <= 0) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Por favor, ingrese una cantidad válida mayor a 0.',
      });
      return;
    }

    if (quantityNum > selectedProduct.Stock) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No hay suficiente stock disponible.',
      });
      return;
    }

    const existingItem = orderItems.find(item => item.product.ProductId === selectedProduct.ProductId);
    if (existingItem) {
      setOrderItems(orderItems.map(item => 
        item.product.ProductId === selectedProduct.ProductId 
          ? { ...item, quantity: item.quantity + quantityNum }
          : item
      ));
    } else {
      setOrderItems([...orderItems, { product: selectedProduct, quantity: quantityNum }]);
    }

    setSelectedProduct(null);
    setQuantity('');
  };

  const removeFromOrder = (productId: number) => {
    setOrderItems(orderItems.filter(item => item.product.ProductId !== productId));
  };

  const handleSubmitOrder = async () => {
    if (!customerName.trim()) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Por favor, ingrese el nombre del cliente.',
      });
      return;
    }

    if (orderItems.length === 0) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'El pedido está vacío.',
      });
      return;
    }

    const orderDetails = orderItems.map(item => ({
      productId: item.product.ProductId,
      quantity: item.quantity,
    }));

    const orderPayload = {
      clientName: customerName,
      orderDetails,
    };

    try {
        const response = await axiosClient.post('/Order', orderPayload);
    
        const { message, orderId, total } = response.data;
    
        if (message?.includes('no existe')) {
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: message,
          });
          return;
        }
    
        if (message?.includes('no tiene suficiente stock')) {
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: message,
          });
          return;
        }
    
        if (message === 'Orden creada exitosamente.') {
          Swal.fire({
            icon: 'success',
            title: 'Éxito',
            text: `Orden creada exitosamente. Orden ID: ${orderId}. Total: $${total.toFixed(2)}`,
          });
          setOrderItems([]);
          setCustomerName('');
        }
      } catch (error) {
        Swal.fire('Error', 'No se pudo realizar el pedido', 'error');
        console.error('Error al realizar el pedido:', error);
      }
  };

  const totalAmount = orderItems.reduce((total, item) => total + item.product.Price * item.quantity, 0);

  const filteredProducts = products.filter(product => 
    product.Name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Realizar Pedido
      </Typography>
      <TextField
        label="Nombre del Cliente"
        value={customerName}
        onChange={(e) => setCustomerName(e.target.value)}
        fullWidth
        margin="normal"
      />
      <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
        <Autocomplete
          options={filteredProducts}
          getOptionLabel={(option) => option.Name}
          renderInput={(params) => <TextField {...params} label="Buscar Producto" />}
          value={selectedProduct}
          onChange={(event, newValue) => setSelectedProduct(newValue)}
          onInputChange={(event, newInputValue) => setSearchTerm(newInputValue)}
          sx={{ flexGrow: 1 }}
        />
        <TextField
          label="Cantidad"
          type="number"
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
          inputProps={{ min: "1" }}
          sx={{ width: '100px' }}
        />
        <Button variant="contained" onClick={addToOrder}>
          Agregar
        </Button>
      </Box>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Producto</TableCell>
              <TableCell>Precio</TableCell>
              <TableCell>Cantidad</TableCell>
              <TableCell>Subtotal</TableCell>
              <TableCell>Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {orderItems.map((item) => (
              <TableRow key={item.product.ProductId}>
                <TableCell>{item.product.Name}</TableCell>
                <TableCell>${item.product.Price.toFixed(2)}</TableCell>
                <TableCell>{item.quantity}</TableCell>
                <TableCell>${(item.product.Price * item.quantity).toFixed(2)}</TableCell>
                <TableCell>
                  <Button 
                    startIcon={<DeleteIcon />} 
                    onClick={() => removeFromOrder(item.product.ProductId)}
                    color="error"
                  >
                    Eliminar
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <Typography variant="h6" sx={{ mt: 2 }}>
        Total: ${totalAmount.toFixed(2)}
      </Typography>
      <Button 
        variant="contained" 
        onClick={handleSubmitOrder}
        sx={{ mt: 2 }}
      >
        Realizar Pedido
      </Button>
    </Box>
  );
}
