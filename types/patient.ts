export interface PatientData {
  id?: string;
  nombre_completo: string;
  dni?: string | null;
  fecha_nacimiento?: string | null;
  telefono?: string | null;
  direccion?: string | null;
  obra_social?: string | null;
  estado?: 'Control Pendiente' | 'Cirugía Próxima' | 'Postoperatorio' | 'Preoperatorio';
  created_at?: string;
  turnos?: { id: string; fecha: string; hora: string }[];
}

export interface ClinicalHistoryData {
  id?: string;
  paciente_id?: string;
  motivo_consulta?: string | null;
  funcion_ventilatoria?: boolean;
  cottle_resultado?: boolean;
  cottle_lado?: string | null;
  acido_hialuronico?: boolean;
  traumatismo?: boolean;
  tabaquismo?: boolean;
  medicacion?: string | null;
  alergias?: string | null;
  antecedentes_medicos?: string | null;
  antecedentes_quirurgicos?: string | null;
  examen_fisico?: string | null;
  cirugia_realizada?: string | null;
  created_at?: string;
}

export interface StudyAttachmentData {
  id?: string;
  paciente_id: string;
  nombre_archivo: string;
  url_archivo: string;
  tipo_archivo?: string;
  created_at?: string;
}

export interface EvolutionData {
  id?: string;
  paciente_id: string;
  texto: string;
  created_at?: string;
}
