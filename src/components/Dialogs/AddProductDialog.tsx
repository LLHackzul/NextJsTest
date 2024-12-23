import React, { useState } from 'react';
import { 
  Dialog, DialogTitle, DialogContent, DialogActions, 
  TextField, Button, FormHelperText 
} from '@mui/material';

interface AddProductDialogProps {
  open: boolean;
  onClose: () => void;
  onAdd: (product: { Name: string; Description: string; Price: number; Stock: number }) => void;
}

export default function AddProductDialog({ open, onClose, onAdd }: AddProductDialogProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('');
  const [errors, setErrors] = useState({ name: '', description: '', price: '', stock: '' });

  const validateForm = () => {
    let isValid = true;
    const newErrors = { name: '', description: '', price: '', stock: '' };

    if (!name.trim()) {
      newErrors.name = 'El nombre es requerido';
      isValid = false;
    }

    if (!description.trim()) {
      newErrors.description = 'La descripción es requerida';
      isValid = false;
    }

    if (!price || parseFloat(price) < 1) {
      newErrors.price = 'El precio debe ser un número mayor o igual a 1';
      isValid = false;
    }

    if (!stock || parseInt(stock) < 1) {
      newErrors.stock = 'El stock debe ser un número entero mayor o igual a 1';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onAdd({
        Name: name,
        Description: description,
        Price: parseFloat(price),
        Stock: parseInt(stock, 10)
      });
      setName('');
      setDescription('');
      setPrice('');
      setStock('');
      setErrors({ name: '', description: '', price: '', stock: '' });
    }
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Agregar Producto</DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Nombre"
            type="text"
            fullWidth
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            error={!!errors.name}
            helperText={errors.name}
          />
          <TextField
            margin="dense"
            label="Descripción"
            type="text"
            fullWidth
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
            error={!!errors.description}
            helperText={errors.description}
          />
          <TextField
            margin="dense"
            label="Precio"
            type="number"
            fullWidth
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            required
            inputProps={{ min: "1", step: "0.01" }}
            error={!!errors.price}
            helperText={errors.price}
          />
          <TextField
            margin="dense"
            label="Stock"
            type="number"
            fullWidth
            value={stock}
            onChange={(e) => setStock(e.target.value)}
            required
            inputProps={{ min: "1", step: "1" }}
            error={!!errors.stock}
            helperText={errors.stock}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancelar</Button>
          <Button type="submit">Agregar</Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}

