import { supabase } from './supabase';
import { PatientData, ClinicalHistoryData, StudyAttachmentData, EvolutionData } from '@/types';

export const patientService = {
  /**
   * Crea un nuevo paciente, su ficha médica de historia clínica inicial y sube los archivos de estudios adjuntos.
   * Realiza las operaciones de forma secuencial en una llamada unificada.
   */
  async createPatient(
    patient: PatientData,
    history: ClinicalHistoryData,
    files: File[],
    initialEvolution?: string
  ): Promise<{ patientId: string }> {
    // 1. Insertar el paciente principal
    const { data: createdPatient, error: patientError } = await supabase
      .from('pacientes')
      .insert(patient)
      .select()
      .single();

    if (patientError) {
      console.error('Error creating patient:', patientError);
      throw patientError;
    }

    const pacienteId = createdPatient.id;

    // 2. Insertar la historia clínica inicial vinculada
    const { error: historyError } = await supabase
      .from('historias_clinicas')
      .insert({
        ...history,
        paciente_id: pacienteId,
      });

    if (historyError) {
      console.error('Error creating clinical history:', historyError);
      // Intentar limpiar el paciente creado si falla el historial para evitar huérfanos
      await supabase.from('pacientes').delete().eq('id', pacienteId);
      throw historyError;
    }

    // 2b. Insertar la evolución inicial si existe
    if (initialEvolution && initialEvolution.trim()) {
      const { error: evolutionError } = await supabase
        .from('evoluciones')
        .insert({
          paciente_id: pacienteId,
          texto: initialEvolution.trim(),
        });

      if (evolutionError) {
        console.error('Error creating initial evolution:', evolutionError);
        // Intentar limpiar todo si falla para evitar consistencias incompletas
        await supabase.from('historias_clinicas').delete().eq('paciente_id', pacienteId);
        await supabase.from('pacientes').delete().eq('id', pacienteId);
        throw evolutionError;
      }
    }

    // 3. Subir estudios e insertar referencias en la base de datos
    if (files && files.length > 0) {
      for (const file of files) {
        try {
          // Sanitizar y renombrar el archivo para evitar colisiones
          const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
          const filePath = `${pacienteId}/${Date.now()}-${safeName}`;

          // Subir al bucket public 'studies'
          const { error: uploadError } = await supabase.storage
            .from('studies')
            .upload(filePath, file, {
              cacheControl: '3600',
              upsert: true,
            });

          if (uploadError) throw uploadError;

          // Obtener URL pública
          const { data: urlData } = supabase.storage
            .from('studies')
            .getPublicUrl(filePath);

          if (!urlData?.publicUrl) {
            throw new Error('No se pudo generar la URL pública para el estudio.');
          }

          // Insertar en public.estudios_imagenes
          const { error: dbImageError } = await supabase
            .from('estudios_imagenes')
            .insert({
              paciente_id: pacienteId,
              nombre_archivo: file.name,
              url_archivo: urlData.publicUrl,
              tipo_archivo: file.type,
            });

          if (dbImageError) throw dbImageError;
        } catch (fileErr) {
          console.error(`Error uploading file ${file.name}:`, fileErr);
          // Continuamos con el resto de los archivos para evitar que falle toda la transacción,
          // o lanzamos el error según se prefiera. En este caso lanzamos para consistencia.
          throw fileErr;
        }
      }
    }

    return { patientId: pacienteId };
  },

  /**
   * Obtiene la lista paginada de pacientes, filtrada opcionalmente por estado.
   */
  async getPatients(options: {
    page: number;
    pageSize: number;
    filter: string;
  }): Promise<{ data: PatientData[]; count: number }> {
    const { page, pageSize, filter } = options;
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    let query = supabase
      .from('pacientes')
      .select('*, turnos(id, fecha, hora)', { count: 'exact' });

    if (filter && filter !== 'Todos') {
      query = query.eq('estado', filter);
    }

    const { data, count, error } = await query
      .order('created_at', { ascending: false })
      .range(from, to);

    if (error) {
      console.error('Error fetching patients:', error);
      throw error;
    }

    return {
      data: (data || []) as PatientData[],
      count: count || 0,
    };
  },

  /**
   * Obtiene la información completa de un paciente por su ID,
   * incluyendo su historia clínica y sus estudios adjuntos.
   */
  async getPatientById(id: string): Promise<{
    patient: PatientData;
    clinicalHistory: ClinicalHistoryData | null;
    studies: StudyAttachmentData[];
  }> {
    // 1. Obtener datos del paciente
    const { data: patient, error: patientError } = await supabase
      .from('pacientes')
      .select('*')
      .eq('id', id)
      .single();

    if (patientError) {
      console.error('Error fetching patient details:', patientError);
      throw patientError;
    }

    // 2. Obtener historia clínica vinculada
    const { data: history, error: historyError } = await supabase
      .from('historias_clinicas')
      .select('*')
      .eq('paciente_id', id)
      .maybeSingle();

    if (historyError) {
      console.error('Error fetching clinical history:', historyError);
      throw historyError;
    }

    // 3. Obtener estudios e imágenes adjuntas
    const { data: studies, error: studiesError } = await supabase
      .from('estudios_imagenes')
      .select('*')
      .eq('paciente_id', id);

    if (studiesError) {
      console.error('Error fetching studies:', studiesError);
      throw studiesError;
    }

    return {
      patient: patient as PatientData,
      clinicalHistory: history as ClinicalHistoryData | null,
      studies: (studies || []) as StudyAttachmentData[],
    };
  },

  /**
   * Sube un nuevo estudio para un paciente existente, lo almacena en el bucket y registra la referencia en estudios_imagenes.
   */
  async uploadPatientStudy(
    patientId: string,
    file: File
  ): Promise<StudyAttachmentData> {
    // Sanitizar y renombrar el archivo para evitar colisiones
    const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const filePath = `${patientId}/${Date.now()}-${safeName}`;

    // Subir al bucket public 'studies'
    const { error: uploadError } = await supabase.storage
      .from('studies')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: true,
      });

    if (uploadError) {
      console.error('Error uploading file to storage:', uploadError);
      throw uploadError;
    }

    // Obtener URL pública
    const { data: urlData } = supabase.storage
      .from('studies')
      .getPublicUrl(filePath);

    if (!urlData?.publicUrl) {
      throw new Error('No se pudo generar la URL pública para el estudio.');
    }

    // Insertar en public.estudios_imagenes
    const { data: dbImage, error: dbImageError } = await supabase
      .from('estudios_imagenes')
      .insert({
        paciente_id: patientId,
        nombre_archivo: file.name,
        url_archivo: urlData.publicUrl,
        tipo_archivo: file.type,
      })
      .select()
      .single();

    if (dbImageError) {
      console.error('Error recording study in database:', dbImageError);
      throw dbImageError;
    }

    return dbImage as StudyAttachmentData;
  },

  /**
   * Actualiza la información completa de un paciente y su historia clínica.
   */
  async updatePatient(
    patientId: string,
    patient: Partial<PatientData>,
    history: Partial<ClinicalHistoryData>
  ): Promise<void> {
    // 1. Actualizar tabla pacientes
    const { error: patientError } = await supabase
      .from('pacientes')
      .update(patient)
      .eq('id', patientId);

    if (patientError) {
      console.error('Error updating patient info:', patientError);
      throw patientError;
    }

    // 2. Actualizar tabla historias_clinicas
    const { error: historyError } = await supabase
      .from('historias_clinicas')
      .update(history)
      .eq('paciente_id', patientId);

    if (historyError) {
      console.error('Error updating clinical history:', historyError);
      throw historyError;
    }
  },

  /**
   * Obtiene la lista de evoluciones registradas de un paciente, ordenadas cronológicamente de forma descendente.
   */
  async getPatientEvolutions(patientId: string): Promise<EvolutionData[]> {
    const { data, error } = await supabase
      .from('evoluciones')
      .select('*')
      .eq('paciente_id', patientId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching patient evolutions:', error);
      throw error;
    }

    return (data || []) as EvolutionData[];
  },

  /**
   * Crea un nuevo registro de evolución clínica para un paciente.
   */
  async createPatientEvolution(patientId: string, texto: string): Promise<EvolutionData> {
    const { data, error } = await supabase
      .from('evoluciones')
      .insert({
        paciente_id: patientId,
        texto: texto,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating patient evolution:', error);
      throw error;
    }

    return data as EvolutionData;
  },
};

