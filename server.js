import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { Usuario, Prestamo, Solicitud, Configuracion, Inversion, Promocion } from './models.js';

// Cargar variables de entorno
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || '*'
}));
app.use(express.json({ limit: '50mb' })); // Para imágenes base64

// ==================== CONEXIÓN A MONGODB ====================
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/cesiente';

mongoose.connect(MONGODB_URI)
  .then(async () => {
    console.log('✅ Conectado a MongoDB');
    await inicializarDatos();
  })
  .catch(err => console.error('❌ Error conectando a MongoDB:', err));

// Inicializar datos de ejemplo si la BD está vacía
async function inicializarDatos() {
  try {
    const configCount = await Configuracion.countDocuments();
    
    if (configCount === 0) {
      console.log('📝 Inicializando configuración...');
      
      await Configuracion.insertMany([
        { clave: "tasa_3_meses", valor: "18", descripcion: "Tasa de interés a 3 meses (%)" },
        { clave: "tasa_6_meses", valor: "18", descripcion: "Tasa de interés a 6 meses (%)" },
        { clave: "tasa_12_meses", valor: "18", descripcion: "Tasa de interés a 12 meses (%)" },
        { clave: "tasa_18_meses", valor: "18", descripcion: "Tasa de interés a 18 meses (%)" },
        { clave: "tasa_24_meses", valor: "18", descripcion: "Tasa de interés a 24 meses (%)" },
        { clave: "monto_minimo", valor: "1000", descripcion: "Monto mínimo de préstamo" },
        { clave: "monto_maximo", valor: "500000", descripcion: "Monto máximo de préstamo" },
        { clave: "rendimiento_3_meses", valor: "5.5", descripcion: "Rendimiento inversión 3 meses (%)" },
        { clave: "rendimiento_6_meses", valor: "6.5", descripcion: "Rendimiento inversión 6 meses (%)" },
        { clave: "rendimiento_12_meses", valor: "8.0", descripcion: "Rendimiento inversión 12 meses (%)" },
        { clave: "rendimiento_18_meses", valor: "9.0", descripcion: "Rendimiento inversión 18 meses (%)" },
        { clave: "rendimiento_24_meses", valor: "10.0", descripcion: "Rendimiento inversión 24 meses (%)" }
      ]);
      
      console.log('✅ Configuración inicializada');
    }

    const userCount = await Usuario.countDocuments();
    if (userCount === 0) {
      console.log('📝 Creando usuarios de ejemplo...');
      
      await Usuario.insertMany([
        {
          nombre: "Administrador",
          email: "admin@cesiente.com",
          password: "admin123",
          telefono: "5551234567",
          rol: "administrador",
          activo: true
        },
        {
          nombre: "Juan Pérez",
          email: "juan@email.com",
          password: "demo123",
          telefono: "5551234567",
          rfc: "PEPJ850101ABC",
          rol: "cliente",
          activo: true
        },
        {
          nombre: "María González",
          email: "maria@email.com",
          password: "demo123",
          telefono: "5557654321",
          rfc: "GOMA920305DEF",
          rol: "cliente",
          activo: true
        }
      ]);
      
      console.log('✅ Usuarios creados');
    }
  } catch (error) {
    console.error('Error inicializando datos:', error);
  }
}

// ==================== USUARIOS ====================

app.get('/api/usuarios', async (req, res) => {
  try {
    const usuarios = await Usuario.find({ rol: 'cliente' }).select('-password');
    res.json(usuarios);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/usuarios/:id', async (req, res) => {
  try {
    const usuario = await Usuario.findById(req.params.id).select('-password');
    if (!usuario) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }
    res.json(usuario);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/usuarios', async (req, res) => {
  try {
    const nuevoUsuario = new Usuario(req.body);
    await nuevoUsuario.save();
    res.status(201).json(nuevoUsuario);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/usuarios/:id', async (req, res) => {
  try {
    const usuario = await Usuario.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!usuario) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }
    res.json(usuario);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==================== PRESTAMOS ====================

app.get('/api/prestamos', async (req, res) => {
  try {
    const prestamos = await Prestamo.find().populate('usuario_id', 'nombre email telefono');
    res.json(prestamos);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/prestamos', async (req, res) => {
  try {
    const nuevoPrestamo = new Prestamo(req.body);
    await nuevoPrestamo.save();
    res.status(201).json(nuevoPrestamo);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/prestamos/:id/aprobar', async (req, res) => {
  try {
    const { aprobado_por } = req.body;
    const prestamo = await Prestamo.findByIdAndUpdate(
      req.params.id,
      {
        estado: 'aprobado',
        fecha_aprobacion: new Date(),
        aprobado_por: aprobado_por || 'Administrador'
      },
      { new: true }
    );
    
    if (!prestamo) {
      return res.status(404).json({ error: 'Préstamo no encontrado' });
    }
    
    res.json(prestamo);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/prestamos/:id/rechazar', async (req, res) => {
  try {
    const { motivo_rechazo } = req.body;
    const prestamo = await Prestamo.findByIdAndUpdate(
      req.params.id,
      {
        estado: 'rechazado',
        fecha_rechazo: new Date(),
        motivo_rechazo: motivo_rechazo || 'No especificado'
      },
      { new: true }
    );
    
    if (!prestamo) {
      return res.status(404).json({ error: 'Préstamo no encontrado' });
    }
    
    res.json(prestamo);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==================== SOLICITUDES ====================

app.get('/api/solicitudes', async (req, res) => {
  try {
    const solicitudes = await Solicitud.find()
      .populate('usuario_id', 'nombre email telefono')
      .populate('prestamo_id');
    res.json(solicitudes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/solicitudes', async (req, res) => {
  try {
    const {
      usuario_id,
      monto,
      plazo,
      destino,
      latitud,
      longitud,
      documentos,
      firma_digital
    } = req.body;

    // Obtener tasa de interés de configuración
    const tasaConfig = await Configuracion.findOne({ clave: `tasa_${plazo}_meses` });
    const tasa = tasaConfig ? parseFloat(tasaConfig.valor) : 18;

    const montoFloat = parseFloat(monto);
    const plazoInt = parseInt(plazo);
    const interesMensual = tasa / 100 / 12;
    const pagoMensual = (montoFloat * interesMensual * Math.pow(1 + interesMensual, plazoInt)) / 
                        (Math.pow(1 + interesMensual, plazoInt) - 1);
    const montoTotal = pagoMensual * plazoInt;

    // Crear préstamo
    const nuevoPrestamo = new Prestamo({
      usuario_id,
      monto: montoFloat,
      plazo: plazoInt,
      tasa_interes: tasa,
      pago_mensual: pagoMensual,
      monto_total: montoTotal,
      destino,
      estado: 'pendiente'
    });
    await nuevoPrestamo.save();

    // Crear solicitud con documentos
    const nuevaSolicitud = new Solicitud({
      prestamo_id: nuevoPrestamo._id,
      usuario_id,
      latitud: parseFloat(latitud),
      longitud: parseFloat(longitud),
      documentos,
      firma_digital
    });
    await nuevaSolicitud.save();

    res.status(201).json({
      prestamo: nuevoPrestamo,
      solicitud: nuevaSolicitud
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==================== CONFIGURACION ====================

app.get('/api/configuracion', async (req, res) => {
  try {
    const configuracion = await Configuracion.find();
    res.json(configuracion);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/configuracion/:clave', async (req, res) => {
  try {
    const { valor } = req.body;
    const config = await Configuracion.findOneAndUpdate(
      { clave: req.params.clave },
      { valor, fecha_actualizacion: new Date() },
      { new: true }
    );
    
    if (!config) {
      return res.status(404).json({ error: 'Configuración no encontrada' });
    }
    
    res.json(config);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==================== DASHBOARD ====================

app.get('/api/dashboard', async (req, res) => {
  try {
    const totalClientes = await Usuario.countDocuments({ rol: 'cliente' });
    const prestamosPendientes = await Prestamo.countDocuments({ estado: 'pendiente' });
    const prestamosAprobados = await Prestamo.countDocuments({ estado: 'aprobado' });
    
    const prestamosAprobadosDocs = await Prestamo.find({ estado: 'aprobado' });
    const montoTotal = prestamosAprobadosDocs.reduce((sum, p) => sum + p.monto, 0);

    res.json({
      total_clientes: totalClientes,
      prestamos_pendientes: prestamosPendientes,
      prestamos_aprobados: prestamosAprobados,
      monto_total: montoTotal
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==================== PROMOCIONES ====================

app.get('/api/promociones', async (req, res) => {
  try {
    const promociones = await Promocion.find({ activo: true });
    res.json(promociones);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/promociones', async (req, res) => {
  try {
    const nuevaPromocion = new Promocion(req.body);
    await nuevaPromocion.save();
    res.status(201).json(nuevaPromocion);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==================== HEALTH CHECK ====================

app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log('═══════════════════════════════════════════════');
  console.log('  ✓ Servidor CeSiente Backend iniciado');
  console.log(`  ✓ Puerto: ${PORT}`);
  console.log(`  ✓ URL: http://localhost:${PORT}`);
  console.log(`  ✓ Base de Datos: MongoDB`);
  console.log('═══════════════════════════════════════════════');
});
