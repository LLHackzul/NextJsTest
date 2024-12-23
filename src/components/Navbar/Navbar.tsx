'use client';

import { AppBar, Toolbar, Typography, Button } from '@mui/material';
import Link from 'next/link';

export default function Navbar() {
  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6" sx={{ flexGrow: 1 }}>
          Gestión de Productos
        </Typography>
        <Button color="inherit" component={Link} href="/">
          Productos
        </Button>
        <Button color="inherit" component={Link} href="/orders">
          Órdenes
        </Button>
      </Toolbar>
    </AppBar>
  );
}
