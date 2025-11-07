import mongoose from 'mongoose';

// USUARIO / CLIENTE
const usuarioSchema = new mongoose.Schema({
  nombre: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  telefono: { type: String },
  rfc: { type: String },
  curp: { type: String },
  fecha_nacimiento: { type: Date },
  direccion: { type: String },
  ciudad: { type: String },
  estado: { type: String },
  cp: { type: String },
  rol: { type: String, enum: ['cliente', 'administrador'], default: 'cliente' },
  activo: { type: Boolean, default: true },
  fecha_registro: { type: Date, default: Date.now }
}, { timestamps: true });

// PRÉSTAMO
const prestamoSchema = new mongoose.Schema({
  usuario_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario', required: true },
  monto: { type: Number, required: true },
  plazo: { type: Number, required: true }, // meses
  tasa_interes: { type: Number, required: true }, // porcentaje anual
  pago_mensual: { type: Number, required: true },
  monto_total: { type: Number, required: true },
  destino: { type: String, required: true },
  estado: { 
    type: String, 
    enum: ['pendiente', 'aprobado', 'rechazado', 'liquidado'], 
    default: 'pendiente' 
  },
  fecha_solicitud: { type: Date, default: Date.now },
  fecha_aprobacion: { type: Date },
  fecha_rechazo: { type: Date },
  aprobado_por: { type: String },
  motivo_rechazo: { type: String }
}, { timestamps: true });

// SOLICITUD (Documentos)
const solicitudSchema = new mongoose.Schema({
  prestamo_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Prestamo', required: true },
  usuario_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario', required: true },
  latitud: { type: Number },
  longitud: { type: Number },
  documentos: { type: mongoose.Schema.Types.Mixed }, // JSON con base64
  firma_digital: { type: String },
  fecha_envio: { type: Date, default: Date.now }
}, { timestamps: true });

// CONFIGURACIÓN
const configuracionSchema = new mongoose.Schema({
  clave: { type: String, required: true, unique: true },
  valor: { type: String, required: true },
  descripcion: { type: String },
  fecha_actualizacion: { type: Date, default: Date.now }
}, { timestamps: true });

// INVERSIÓN
const inversionSchema = new mongoose.Schema({
  usuario_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario', required: true },
  monto: { type: Number, required: true },
  plazo: { type: Number, required: true }, // meses
  tasa_rendimiento: { type: Number, required: true }, // porcentaje anual
  rendimiento_total: { type: Number, required: true },
  monto_final: { type: Number, required: true },
  fecha_inicio: { type: Date, default: Date.now },
  fecha_vencimiento: { type: Date, required: true },
  estado: { 
    type: String, 
    enum: ['activa', 'vencida', 'cancelada'], 
    default: 'activa' 
  }
}, { timestamps: true });

// PROMOCIÓN
const promocionSchema = new mongoose.Schema({
  titulo: { type: String, required: true },
  descripcion: { type: String, required: true },
  descuento_tasa: { type: Number }, // % de descuento en tasa
  fecha_inicio: { type: Date, required: true },
  fecha_fin: { type: Date, required: true },
  activo: { type: Boolean, default: true },
  fecha_creacion: { type: Date, default: Date.now }
}, { timestamps: true });

// Exportar modelos
export const Usuario = mongoose.model('Usuario', usuarioSchema);
export const Prestamo = mongoose.model('Prestamo', prestamoSchema);
export const Solicitud = mongoose.model('Solicitud', solicitudSchema);
export const Configuracion = mongoose.model('Configuracion', configuracionSchema);
export const Inversion = mongoose.model('Inversion', inversionSchema);
export const Promocion = mongoose.model('Promocion', promocionSchema);
