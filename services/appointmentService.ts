import { supabase } from './supabase';
import { AppointmentData } from '@/types';

export const appointmentService = {
  /**
   * Obtiene todos los turnos del usuario (médico) autenticado actualmente.
   */
  async getAppointments(): Promise<AppointmentData[]> {
    // 1. Obtener sesión activa para asegurar RLS y el ID del usuario
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError || !session) {
      throw new Error('Usuario no autenticado.');
    }

    // 2. Traer turnos ordenados cronológicamente
    const { data, error } = await supabase
      .from('turnos')
      .select('*')
      .eq('user_id', session.user.id)
      .order('fecha', { ascending: true })
      .order('hora', { ascending: true });

    if (error) {
      console.error('Error fetching appointments:', error);
      throw error;
    }

    // Adaptar nombres de campos de base de datos a tipos de la app
    return (data || []).map((t) => ({
      id: t.id,
      pacienteNombre: t.paciente_nombre,
      tipo: t.tipo,
      fecha: t.fecha,
      hora: t.hora,
      observacion: t.observacion,
      created_at: t.created_at
    })) as AppointmentData[];
  },

  /**
   * Crea un nuevo turno vinculándolo al usuario médico activo y al paciente si ya existe.
   */
  async createAppointment(appointment: Omit<AppointmentData, 'id' | 'created_at'>): Promise<AppointmentData> {
    // 1. Obtener sesión activa
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError || !session) {
      throw new Error('Usuario no autenticado para agendar turnos.');
    }

    const userId = session.user.id;

    // 1b. Validar conflicto de horario: comprobar si ya existe un turno del mismo médico en la misma fecha y hora
    const { data: existingApp, error: checkError } = await supabase
      .from('turnos')
      .select('id, paciente_nombre')
      .eq('user_id', userId)
      .eq('fecha', appointment.fecha)
      .eq('hora', appointment.hora)
      .maybeSingle();

    if (checkError) {
      console.error('Error checking existing appointment:', checkError);
    }

    if (existingApp) {
      throw new Error(`El horario de las ${appointment.hora} hs ya está ocupado por el paciente ${existingApp.paciente_nombre} en esta fecha.`);
    }

    // 2. Intentar buscar el id de paciente si ya está registrado en la base de datos
    let pacienteId: string | null = null;
    try {
      const { data: patientData } = await supabase
        .from('pacientes')
        .select('id')
        .eq('nombre_completo', appointment.pacienteNombre)
        .maybeSingle();
      
      pacienteId = patientData?.id || null;
    } catch (err) {
      console.warn('No se pudo verificar la existencia del paciente de forma directa:', err);
    }

    // 3. Insertar el turno
    const { data, error } = await supabase
      .from('turnos')
      .insert({
        user_id: userId,
        paciente_id: pacienteId,
        paciente_nombre: appointment.pacienteNombre,
        tipo: appointment.tipo,
        fecha: appointment.fecha,
        hora: appointment.hora,
        observacion: appointment.observacion
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating appointment:', error);
      throw error;
    }

    return {
      id: data.id,
      pacienteNombre: data.paciente_nombre,
      tipo: data.tipo,
      fecha: data.fecha,
      hora: data.hora,
      observacion: data.observacion,
      created_at: data.created_at
    } as AppointmentData;
  },

  /**
   * Cancela / elimina un turno por su ID.
   */
  async deleteAppointment(id: string): Promise<void> {
    const { error } = await supabase
      .from('turnos')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting appointment:', error);
      throw error;
    }
  }
};
