export type AppointmentType = 'Consulta General' | 'Preoperatorio' | 'Cirugía Próxima' | 'Postoperatorio';

export interface AppointmentData {
  id?: string;
  pacienteNombre: string;
  tipo: AppointmentType;
  fecha: string; // Formato YYYY-MM-DD
  hora: string;  // Formato HH:MM
  observacion: string;
  created_at?: string;
}
