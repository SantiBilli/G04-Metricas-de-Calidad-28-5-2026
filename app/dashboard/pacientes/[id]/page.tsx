"use client";

import React, { useState, useRef, use, useEffect, useCallback } from "react";
import Link from "next/link";
import NuevaEvolucionModal from "@/components/dashboard/NuevaEvolucionModal";
import SuccessToast from "@/components/dashboard/SuccessToast";
import { patientService } from "@/services/patientService";
import {
  PatientData,
  ClinicalHistoryData,
  StudyAttachmentData,
  EvolutionData,
} from "@/types";

const statusStyles: Record<string, string> = {
  "Control Pendiente": "bg-[#856627] text-white",
  "Cirugía Próxima": "bg-[#856627] text-white",
  Preoperatorio: "bg-[#856627] text-white",
  Postoperatorio: "bg-[#856627] text-white",
};

const calculateAge = (birthDateString: string | null | undefined): number => {
  if (!birthDateString) return 0;
  const today = new Date();
  const birthDate = new Date(birthDateString);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (
    monthDiff < 0 ||
    (monthDiff === 0 && today.getDate() < birthDate.getDate())
  ) {
    age--;
  }
  return age;
};

const formatBoolean = (val: boolean | null | undefined): string => {
  if (val === undefined || val === null) return "No";
  return val ? "Si" : "No";
};

const formatCottleLado = (val: string | null | undefined): string => {
  return val || "-";
};

const formatDateTime = (dateString: string | undefined): string => {
  if (!dateString) return "-";
  const date = new Date(dateString);
  return (
    date.toLocaleDateString("es-AR", {
      day: "numeric",
      month: "short",
      year: "numeric",
    }) +
    " - " +
    date.toLocaleTimeString("es-AR", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }) +
    " hs"
  );
};

export default function PatientDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const patientId = resolvedParams.id;

  const [patient, setPatient] = useState<PatientData | null>(null);
  const [clinicalHistory, setClinicalHistory] =
    useState<ClinicalHistoryData | null>(null);
  const [estudios, setEstudios] = useState<StudyAttachmentData[]>([]);
  const [evoluciones, setEvoluciones] = useState<EvolutionData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [nombreCompleto, setNombreCompleto] = useState("");
  const [dni, setDni] = useState("");
  const [fechaNacimiento, setFechaNacimiento] = useState("");
  const [telefono, setTelefono] = useState("");
  const [direccion, setDireccion] = useState("");
  const [obraSocial, setObraSocial] = useState("");
  const [estado, setEstado] = useState<
    "Control Pendiente" | "Cirugía Próxima" | "Postoperatorio" | "Preoperatorio"
  >("Control Pendiente");

  const [medicacion, setMedicacion] = useState("");
  const [alergias, setAlergias] = useState("");
  const [antecedentesQuirurgicos, setAntecedentesQuirurgicos] = useState("");
  const [funcionVentilatoria, setFuncionVentilatoria] = useState(false);
  const [cottleLado, setCottleLado] = useState("Der.");
  const [cottleResultado, setCottleResultado] = useState(false);
  const [acidoHialuronico, setAcidoHialuronico] = useState(false);
  const [traumatismo, setTraumatismo] = useState(false);
  const [tabaquismo, setTabaquismo] = useState(false);
  const [examenFisico, setExamenFisico] = useState("");
  const [cirugiaRealizada, setCirugiaRealizada] = useState("");
  const [motivoConsulta, setMotivoConsulta] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadPatientData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [data, evols] = await Promise.all([
        patientService.getPatientById(patientId),
        patientService.getPatientEvolutions(patientId),
      ]);
      setPatient(data.patient);
      setClinicalHistory(data.clinicalHistory);
      setEstudios(data.studies);
      setEvoluciones(evols);

      setNombreCompleto(data.patient.nombre_completo || "");
      setDni(data.patient.dni || "");
      setFechaNacimiento(data.patient.fecha_nacimiento || "");
      setTelefono(data.patient.telefono || "");
      setDireccion(data.patient.direccion || "");
      setObraSocial(data.patient.obra_social || "");
      setEstado(data.patient.estado || "Control Pendiente");

      setMedicacion(data.clinicalHistory?.medicacion || "");
      setAlergias(data.clinicalHistory?.alergias || "");
      setAntecedentesQuirurgicos(
        data.clinicalHistory?.antecedentes_quirurgicos || "",
      );
      setFuncionVentilatoria(
        data.clinicalHistory?.funcion_ventilatoria || false,
      );
      setCottleLado(data.clinicalHistory?.cottle_lado || "Der.");
      setCottleResultado(data.clinicalHistory?.cottle_resultado || false);
      setAcidoHialuronico(data.clinicalHistory?.acido_hialuronico || false);
      setTraumatismo(data.clinicalHistory?.traumatismo || false);
      setTabaquismo(data.clinicalHistory?.tabaquismo || false);
      setExamenFisico(data.clinicalHistory?.examen_fisico || "");
      setCirugiaRealizada(data.clinicalHistory?.cirugia_realizada || "");
      setMotivoConsulta(data.clinicalHistory?.motivo_consulta || "");
    } catch (err) {
      console.error("Error loading patient details:", err);
      setError("No se pudo cargar la información del paciente.");
    } finally {
      setIsLoading(false);
    }
  }, [patientId]);

  useEffect(() => {
    loadPatientData();
  }, [loadPatientData]);

  const handleSavePatientChanges = async () => {
    if (!nombreCompleto.trim()) {
      alert("El nombre completo es requerido.");
      return;
    }
    setIsSaving(true);
    try {
      await patientService.updatePatient(
        patientId,
        {
          nombre_completo: nombreCompleto,
          dni: dni || null,
          fecha_nacimiento: fechaNacimiento || null,
          telefono: telefono || null,
          direccion: direccion || null,
          obra_social: obraSocial || null,
          estado: estado,
        },
        {
          medicacion: medicacion || null,
          alergias: alergias || null,
          antecedentes_quirurgicos: antecedentesQuirurgicos || null,
          funcion_ventilatoria: funcionVentilatoria,
          cottle_lado: cottleLado || null,
          cottle_resultado: cottleResultado,
          acido_hialuronico: acidoHialuronico,
          traumatismo: traumatismo,
          tabaquismo: tabaquismo,
          examen_fisico: examenFisico || null,
          cirugia_realizada: cirugiaRealizada || null,
          motivo_consulta: motivoConsulta || null,
        },
      );

      setPatient((prev) =>
        prev
          ? {
              ...prev,
              nombre_completo: nombreCompleto,
              dni: dni || null,
              fecha_nacimiento: fechaNacimiento || null,
              telefono: telefono || null,
              direccion: direccion || null,
              obra_social: obraSocial || null,
              estado: estado,
            }
          : null,
      );

      setClinicalHistory((prev) =>
        prev
          ? {
              ...prev,
              medicacion: medicacion || null,
              alergias: alergias || null,
              antecedentes_quirurgicos: antecedentesQuirurgicos || null,
              funcion_ventilatoria: funcionVentilatoria,
              cottle_lado: cottleLado || null,
              cottle_resultado: cottleResultado,
              acido_hialuronico: acidoHialuronico,
              traumatismo: traumatismo,
              tabaquismo: tabaquismo,
              examen_fisico: examenFisico || null,
              cirugia_realizada: cirugiaRealizada || null,
              motivo_consulta: motivoConsulta || null,
            }
          : null,
      );

      setIsEditing(false);
      setShowToast(true);
    } catch (err) {
      console.error("Error saving patient changes:", err);
      alert("Ocurrió un error al guardar los cambios en la base de datos.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancelEdit = () => {
    if (patient) {
      setNombreCompleto(patient.nombre_completo || "");
      setDni(patient.dni || "");
      setFechaNacimiento(patient.fecha_nacimiento || "");
      setTelefono(patient.telefono || "");
      setDireccion(patient.direccion || "");
      setObraSocial(patient.obra_social || "");
      setEstado(patient.estado || "Control Pendiente");
    }

    if (clinicalHistory) {
      setMedicacion(clinicalHistory.medicacion || "");
      setAlergias(clinicalHistory.alergias || "");
      setAntecedentesQuirurgicos(
        clinicalHistory.antecedentes_quirurgicos || "",
      );
      setFuncionVentilatoria(clinicalHistory.funcion_ventilatoria || false);
      setCottleLado(clinicalHistory.cottle_lado || "Der.");
      setCottleResultado(clinicalHistory.cottle_resultado || false);
      setAcidoHialuronico(clinicalHistory.acido_hialuronico || false);
      setTraumatismo(clinicalHistory.traumatismo || false);
      setTabaquismo(clinicalHistory.tabaquismo || false);
      setExamenFisico(clinicalHistory.examen_fisico || "");
      setCirugiaRealizada(clinicalHistory.cirugia_realizada || "");
      setMotivoConsulta(clinicalHistory.motivo_consulta || "");
    }

    setIsEditing(false);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const filesArray = Array.from(e.target.files);
      setIsUploading(true);
      try {
        const uploadedStudies: StudyAttachmentData[] = [];
        for (const file of filesArray) {
          const newStudy = await patientService.uploadPatientStudy(
            patientId,
            file,
          );
          uploadedStudies.push(newStudy);
        }
        setEstudios((prev) => [...prev, ...uploadedStudies]);
        setShowToast(true);
      } catch (err) {
        console.error("Error uploading file:", err);
        alert("Ocurrió un error al subir el archivo.");
      } finally {
        setIsUploading(false);
      }
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const filesArray = Array.from(e.dataTransfer.files);
      setIsUploading(true);
      try {
        const uploadedStudies: StudyAttachmentData[] = [];
        for (const file of filesArray) {
          const newStudy = await patientService.uploadPatientStudy(
            patientId,
            file,
          );
          uploadedStudies.push(newStudy);
        }
        setEstudios((prev) => [...prev, ...uploadedStudies]);
        setShowToast(true);
      } catch (err) {
        console.error("Error uploading file:", err);
        alert("Ocurrió un error al subir el archivo.");
      } finally {
        setIsUploading(false);
      }
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6 w-full animate-pulse">
        <div className="h-4 bg-zinc-800 rounded w-24"></div>

        <div className="bg-[var(--color-box)] rounded-[12px] border border-[#4d4638] p-6 shadow-lg flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div className="flex flex-col gap-3 w-full lg:w-auto">
            <div className="h-7 bg-zinc-800 rounded w-48"></div>
            <div className="h-4 bg-zinc-800 rounded w-64"></div>
          </div>
          <div className="flex gap-3 w-full sm:w-auto">
            <div className="h-10 bg-zinc-800 rounded w-32"></div>
            <div className="h-10 bg-zinc-800 rounded w-32"></div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 flex flex-col gap-6">
            <div className="bg-[var(--color-box)] rounded-[12px] border border-[#4d4638] p-6 h-64"></div>
            <div className="bg-[var(--color-box)] rounded-[12px] border border-[#4d4638] p-6 h-64"></div>
          </div>
          <div className="lg:col-span-1 flex flex-col gap-6">
            <div className="bg-[var(--color-box)] rounded-[12px] border border-[#4d4638] p-6 h-64"></div>
            <div className="bg-[var(--color-box)] rounded-[12px] border border-[#4d4638] p-6 h-64"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !patient) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-6 bg-[var(--color-box)] rounded-[12px] border border-[#4d4638] text-center">
        <span className="material-symbols-outlined text-[64px] text-[var(--color-dorado)] mb-4">
          warning
        </span>
        <h2 className="text-white text-xl font-bold mb-2">
          Error al cargar el paciente
        </h2>
        <p className="text-[var(--color-neutral-a60)] max-w-md mb-6">
          {error || "El paciente solicitado no existe en la base de datos."}
        </p>
        <Link
          href="/dashboard/pacientes"
          className="px-6 py-2.5 rounded-[8px] bg-[linear-gradient(180deg,#FFE59C_15.87%,var(--color-dorado)_91.83%)] text-[var(--color-deepest)] font-bold hover:opacity-95 transition-all text-sm"
        >
          Volver a Pacientes
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 w-full">
      <div>
        <Link
          href="/dashboard/pacientes"
          className="inline-flex items-center gap-1 text-[var(--color-dorado)] hover:text-[var(--color-highlight)] transition-colors font-medium text-sm"
        >
          <span className="material-symbols-outlined text-[20px]">
            chevron_left
          </span>
          <span>Historia Clínica</span>
        </Link>
      </div>

      <div className="flex flex-col justify-between gap-6 bg-[var(--color-box)] rounded-[12px] border border-[#4d4638] p-6 shadow-lg">
        {isEditing ? (
          <div className="flex flex-col gap-5 w-full">
            <div className="flex justify-between items-center border-b border-[#4d4638]/40 pb-3">
              <h1 className="font-bold text-[var(--color-blanco)] text-xl flex items-center gap-2">
                <span className="material-symbols-outlined text-[var(--color-dorado)]">
                  edit_square
                </span>
                <span>Editar Expediente del Paciente</span>
              </h1>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="flex flex-col">
                <label className="text-[11px] font-bold tracking-wider text-[var(--color-dorado)] mb-1.5 uppercase">
                  Nombre Completo
                </label>
                <input
                  type="text"
                  value={nombreCompleto}
                  onChange={(e) => setNombreCompleto(e.target.value)}
                  className="bg-[#121414] border border-[#4d4638] text-[var(--color-blanco)] px-3.5 py-2 rounded-[8px] focus:outline-none focus:border-[var(--color-dorado)] text-sm font-medium w-full transition-all"
                />
              </div>

              <div className="flex flex-col">
                <label className="text-[11px] font-bold tracking-wider text-[var(--color-dorado)] mb-1.5 uppercase">
                  DNI
                </label>
                <input
                  type="text"
                  value={dni}
                  onChange={(e) => setDni(e.target.value)}
                  className="bg-[#121414] border border-[#4d4638] text-[var(--color-blanco)] px-3.5 py-2 rounded-[8px] focus:outline-none focus:border-[var(--color-dorado)] text-sm font-medium w-full transition-all"
                />
              </div>

              <div className="flex flex-col">
                <label className="text-[11px] font-bold tracking-wider text-[var(--color-dorado)] mb-1.5 uppercase">
                  Fecha de Nacimiento
                </label>
                <input
                  type="date"
                  value={fechaNacimiento}
                  onChange={(e) => setFechaNacimiento(e.target.value)}
                  className="bg-[#121414] border border-[#4d4638] text-[var(--color-blanco)] px-3.5 py-2 rounded-[8px] focus:outline-none focus:border-[var(--color-dorado)] text-sm font-medium w-full transition-all"
                />
              </div>

              <div className="flex flex-col">
                <label className="text-[11px] font-bold tracking-wider text-[var(--color-dorado)] mb-1.5 uppercase">
                  Estado
                </label>
                <select
                  value={estado}
                  onChange={(e) => setEstado(e.target.value as any)}
                  className="bg-[#121414] border border-[#4d4638] text-white px-3.5 py-2 rounded-[8px] focus:outline-none focus:border-[var(--color-dorado)] text-sm font-medium w-full cursor-pointer transition-all"
                >
                  <option
                    value="Control Pendiente"
                    className="bg-[#1a1c1c] text-white"
                  >
                    Control Pendiente
                  </option>
                  <option
                    value="Preoperatorio"
                    className="bg-[#1a1c1c] text-white"
                  >
                    Preoperatorio
                  </option>
                  <option
                    value="Cirugía Próxima"
                    className="bg-[#1a1c1c] text-white"
                  >
                    Cirugía Próxima
                  </option>
                  <option
                    value="Postoperatorio"
                    className="bg-[#1a1c1c] text-white"
                  >
                    Postoperatorio
                  </option>
                </select>
              </div>
            </div>

            <div className="flex flex-row justify-end gap-3 mt-2 border-t border-[#4d4638]/40 pt-4">
              <button
                onClick={handleCancelEdit}
                disabled={isSaving}
                className="flex items-center justify-center gap-2 px-6 py-2.5 rounded-[8px] border border-zinc-600 text-zinc-300 font-semibold hover:bg-[#2c2c2c]/40 active:scale-98 transition-all text-nav-bar cursor-pointer bg-transparent disabled:opacity-50"
              >
                <span>Cancelar</span>
              </button>
              <button
                onClick={handleSavePatientChanges}
                disabled={isSaving}
                className="flex items-center justify-center gap-2 px-6 py-2.5 rounded-[8px] bg-[linear-gradient(180deg,#FFE59C_15.87%,var(--color-dorado)_91.83%)] text-[var(--color-deepest)] font-bold hover:opacity-95 active:scale-98 transition-all border border-[var(--color-highlight)] text-nav-bar cursor-pointer shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className="material-symbols-outlined text-[18px] font-bold">
                  {isSaving ? "sync" : "save"}
                </span>
                <span>{isSaving ? "Guardando..." : "Guardar Cambios"}</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 w-full">
            <div className="flex flex-col">
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="font-bold text-[var(--color-blanco)] leading-tight text-2xl">
                  {patient.nombre_completo}
                </h1>
                <span className="inline-block px-5 py-1.5 rounded-full text-[13px] font-medium tracking-wide bg-[#856627] text-white">
                  {patient.estado || "Control Pendiente"}
                </span>
                <button
                  onClick={() => setIsEditing(true)}
                  className="text-[var(--color-dorado)] hover:text-[var(--color-highlight)] transition-colors p-1 rounded-full hover:bg-[#2c2c2c] flex items-center justify-center cursor-pointer shadow-sm"
                >
                  <span className="material-symbols-outlined text-[16px]">
                    edit
                  </span>
                </button>
              </div>
              <p className="text-[var(--color-neutral-a60)] text-sm font-medium mt-2">
                Edad:{" "}
                <span className="text-[var(--color-blanco)] mr-6">
                  {patient.fecha_nacimiento
                    ? `${calculateAge(patient.fecha_nacimiento)} años`
                    : "No especificada"}
                </span>
                DNI:{" "}
                <span className="text-[var(--color-blanco)]">
                  {patient.dni || "No especificado"}
                </span>
              </p>
            </div>

            <div className="flex flex-row gap-3 w-full sm:w-auto mt-2 lg:mt-0">
              <button
                onClick={() => setIsModalOpen(true)}
                className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-6 py-2.5 rounded-[8px] bg-[linear-gradient(180deg,#FFE59C_15.87%,var(--color-dorado)_91.83%)] text-[var(--color-deepest)] font-bold hover:opacity-95 active:scale-98 transition-all border border-[var(--color-highlight)] text-nav-bar cursor-pointer shadow-md"
              >
                <span className="material-symbols-outlined text-[18px] font-bold">
                  add
                </span>
                <span>Nueva Evolución</span>
              </button>
              <button className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-6 py-2.5 rounded-[8px] border border-[var(--color-dorado)] text-[var(--color-dorado)] font-semibold hover:bg-[#2c2c2c]/40 active:scale-98 transition-all text-nav-bar cursor-pointer bg-transparent">
                <span className="material-symbols-outlined text-[18px]">
                  calendar_month
                </span>
                <span>Agendar Turno</span>
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 flex flex-col gap-6">
          <div className="bg-[var(--color-box)] rounded-[12px] border border-[#4d4638] p-6 shadow-md">
            <h2 className="text-lg font-bold text-[var(--color-blanco)] border-b border-[#4d4638]/40 pb-3 mb-5">
              Antecedentes / Ventilación
            </h2>
            <div className="flex flex-col gap-5">
              <div>
                <span className="text-[11px] font-bold tracking-wider text-[var(--color-dorado)] block mb-1">
                  MEDICACIÓN
                </span>
                {isEditing ? (
                  <textarea
                    value={medicacion}
                    onChange={(e) => setMedicacion(e.target.value)}
                    rows={2}
                    className="bg-[#121414] border border-[#4d4638] text-[var(--color-blanco)] p-3 rounded-[8px] focus:outline-none focus:border-[var(--color-dorado)] text-sm leading-relaxed w-full resize-y"
                  />
                ) : (
                  <p className="text-[var(--color-blanco)] text-sm leading-relaxed">
                    {clinicalHistory?.medicacion ||
                      "Ninguna declarada en la primera entrevista."}
                  </p>
                )}
              </div>
              <div>
                <span className="text-[11px] font-bold tracking-wider text-[var(--color-dorado)] block mb-1">
                  ALERGIA MEDICACIÓN
                </span>
                {isEditing ? (
                  <textarea
                    value={alergias}
                    onChange={(e) => setAlergias(e.target.value)}
                    rows={2}
                    className="bg-[#121414] border border-[#4d4638] text-[var(--color-blanco)] p-3 rounded-[8px] focus:outline-none focus:border-[var(--color-dorado)] text-sm leading-relaxed w-full resize-y"
                  />
                ) : (
                  <p className="text-[var(--color-blanco)] text-sm leading-relaxed">
                    {clinicalHistory?.alergias || "Ninguna conocida."}
                  </p>
                )}
              </div>
              <div>
                <span className="text-[11px] font-bold tracking-wider text-[var(--color-dorado)] block mb-1">
                  ANTECEDENTES QUIRÚRGICOS
                </span>
                {isEditing ? (
                  <textarea
                    value={antecedentesQuirurgicos}
                    onChange={(e) => setAntecedentesQuirurgicos(e.target.value)}
                    rows={2}
                    className="bg-[#121414] border border-[#4d4638] text-[var(--color-blanco)] p-3 rounded-[8px] focus:outline-none focus:border-[var(--color-dorado)] text-sm leading-relaxed w-full resize-y"
                  />
                ) : (
                  <p className="text-[var(--color-blanco)] text-sm leading-relaxed">
                    {clinicalHistory?.antecedentes_quirurgicos ||
                      "Ninguno conocido."}
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="bg-[var(--color-box)] rounded-[12px] border border-[#4d4638] p-6 shadow-md">
            <h2 className="text-lg font-bold text-[var(--color-blanco)] mb-3">
              Evaluación Clínica Específica
            </h2>
            <div className="flex flex-col divide-y divide-[#4d4638]/30">
              <div className="flex justify-between items-center py-4">
                <span className="text-[var(--color-blanco)] text-sm font-medium">
                  Función Ventilatoria Nasal
                </span>
                {isEditing ? (
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setFuncionVentilatoria(true)}
                      className={`px-4 py-1 text-xs font-semibold rounded-full transition-all h-[32px] cursor-pointer ${
                        funcionVentilatoria
                          ? "bg-[linear-gradient(180deg,#FFE59C_15.87%,var(--color-dorado)_91.83%)] text-[var(--color-deepest)] border border-[var(--color-highlight)] font-bold"
                          : "bg-[#121414] text-[var(--color-neutral-a60)] border border-[#4d4638]/40 hover:bg-[#2c2c2c]/40"
                      }`}
                    >
                      Si
                    </button>
                    <button
                      type="button"
                      onClick={() => setFuncionVentilatoria(false)}
                      className={`px-4 py-1 text-xs font-semibold rounded-full transition-all h-[32px] cursor-pointer ${
                        !funcionVentilatoria
                          ? "bg-[linear-gradient(180deg,#FFE59C_15.87%,var(--color-dorado)_91.83%)] text-[var(--color-deepest)] border border-[var(--color-highlight)] font-bold"
                          : "bg-[#121414] text-[var(--color-neutral-a60)] border border-[#4d4638]/40 hover:bg-[#2c2c2c]/40"
                      }`}
                    >
                      No
                    </button>
                  </div>
                ) : (
                  <span className="flex items-center justify-center px-3.5 py-1 text-xs font-semibold rounded-full text-[var(--color-dorado)] bg-[#121414] h-[32px]">
                    {formatBoolean(clinicalHistory?.funcion_ventilatoria)}
                  </span>
                )}
              </div>

              <div className="flex justify-between items-center py-4">
                <span className="text-[var(--color-blanco)] text-sm font-medium">
                  Maniobra de Cottle
                </span>
                {isEditing ? (
                  <div className="flex flex-col sm:flex-row gap-3">
                    <div className="flex gap-2 items-center">
                      <span className="text-xs text-[var(--color-neutral-a60)]">
                        Lado:
                      </span>
                      <button
                        type="button"
                        onClick={() => setCottleLado("Der.")}
                        className={`px-4 py-1 text-xs font-semibold rounded-full transition-all h-[32px] cursor-pointer ${
                          cottleLado === "Der."
                            ? "bg-[linear-gradient(180deg,#FFE59C_15.87%,var(--color-dorado)_91.83%)] text-[var(--color-deepest)] border border-[var(--color-highlight)] font-bold"
                            : "bg-[#121414] text-[var(--color-neutral-a60)] border border-[#4d4638]/40 hover:bg-[#2c2c2c]/40"
                        }`}
                      >
                        Der.
                      </button>
                      <button
                        type="button"
                        onClick={() => setCottleLado("Izq.")}
                        className={`px-4 py-1 text-xs font-semibold rounded-full transition-all h-[32px] cursor-pointer ${
                          cottleLado === "Izq."
                            ? "bg-[linear-gradient(180deg,#FFE59C_15.87%,var(--color-dorado)_91.83%)] text-[var(--color-deepest)] border border-[var(--color-highlight)] font-bold"
                            : "bg-[#121414] text-[var(--color-neutral-a60)] border border-[#4d4638]/40 hover:bg-[#2c2c2c]/40"
                        }`}
                      >
                        Izq.
                      </button>
                    </div>
                    <div className="flex gap-2 items-center">
                      <span className="text-xs text-[var(--color-neutral-a60)]">
                        Resultado:
                      </span>
                      <button
                        type="button"
                        onClick={() => setCottleResultado(true)}
                        className={`px-4 py-1 text-xs font-semibold rounded-full transition-all h-[32px] cursor-pointer ${
                          cottleResultado
                            ? "bg-[linear-gradient(180deg,#FFE59C_15.87%,var(--color-dorado)_91.83%)] text-[var(--color-deepest)] border border-[var(--color-highlight)] font-bold"
                            : "bg-[#121414] text-[var(--color-neutral-a60)] border border-[#4d4638]/40 hover:bg-[#2c2c2c]/40"
                        }`}
                      >
                        Si
                      </button>
                      <button
                        type="button"
                        onClick={() => setCottleResultado(false)}
                        className={`px-4 py-1 text-xs font-semibold rounded-full transition-all h-[32px] cursor-pointer ${
                          !cottleResultado
                            ? "bg-[linear-gradient(180deg,#FFE59C_15.87%,var(--color-dorado)_91.83%)] text-[var(--color-deepest)] border border-[var(--color-highlight)] font-bold"
                            : "bg-[#121414] text-[var(--color-neutral-a60)] border border-[#4d4638]/40 hover:bg-[#2c2c2c]/40"
                        }`}
                      >
                        No
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <span className="flex items-center justify-center px-3.5 py-1 text-xs font-semibold rounded-full text-[var(--color-dorado)] bg-[#121414] h-[32px]">
                      Lado: {formatCottleLado(clinicalHistory?.cottle_lado)}
                    </span>
                    <span className="flex items-center justify-center px-3.5 py-1 text-xs font-semibold rounded-full text-[var(--color-dorado)] bg-[#121414] h-[32px]">
                      Resultado:{" "}
                      {formatBoolean(clinicalHistory?.cottle_resultado)}
                    </span>
                  </div>
                )}
              </div>

              <div className="flex justify-between items-center py-4">
                <span className="text-[var(--color-blanco)] text-sm font-medium">
                  Ácido Hialurónico
                </span>
                {isEditing ? (
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setAcidoHialuronico(true)}
                      className={`px-4 py-1 text-xs font-semibold rounded-full transition-all h-[32px] cursor-pointer ${
                        acidoHialuronico
                          ? "bg-[linear-gradient(180deg,#FFE59C_15.87%,var(--color-dorado)_91.83%)] text-[var(--color-deepest)] border border-[var(--color-highlight)] font-bold"
                          : "bg-[#121414] text-[var(--color-neutral-a60)] border border-[#4d4638]/40 hover:bg-[#2c2c2c]/40"
                      }`}
                    >
                      Si
                    </button>
                    <button
                      type="button"
                      onClick={() => setAcidoHialuronico(false)}
                      className={`px-4 py-1 text-xs font-semibold rounded-full transition-all h-[32px] cursor-pointer ${
                        !acidoHialuronico
                          ? "bg-[linear-gradient(180deg,#FFE59C_15.87%,var(--color-dorado)_91.83%)] text-[var(--color-deepest)] border border-[var(--color-highlight)] font-bold"
                          : "bg-[#121414] text-[var(--color-neutral-a60)] border border-[#4d4638]/40 hover:bg-[#2c2c2c]/40"
                      }`}
                    >
                      No
                    </button>
                  </div>
                ) : (
                  <span className="flex items-center justify-center px-3.5 py-1 text-xs font-semibold rounded-full text-[var(--color-dorado)] bg-[#121414] h-[32px]">
                    {formatBoolean(clinicalHistory?.acido_hialuronico)}
                  </span>
                )}
              </div>

              <div className="flex justify-between items-center py-4">
                <span className="text-[var(--color-blanco)] text-sm font-medium">
                  Traumatismo
                </span>
                {isEditing ? (
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setTraumatismo(true)}
                      className={`px-4 py-1 text-xs font-semibold rounded-full transition-all h-[32px] cursor-pointer ${
                        traumatismo
                          ? "bg-[linear-gradient(180deg,#FFE59C_15.87%,var(--color-dorado)_91.83%)] text-[var(--color-deepest)] border border-[var(--color-highlight)] font-bold"
                          : "bg-[#121414] text-[var(--color-neutral-a60)] border border-[#4d4638]/40 hover:bg-[#2c2c2c]/40"
                      }`}
                    >
                      Si
                    </button>
                    <button
                      type="button"
                      onClick={() => setTraumatismo(false)}
                      className={`px-4 py-1 text-xs font-semibold rounded-full transition-all h-[32px] cursor-pointer ${
                        !traumatismo
                          ? "bg-[linear-gradient(180deg,#FFE59C_15.87%,var(--color-dorado)_91.83%)] text-[var(--color-deepest)] border border-[var(--color-highlight)] font-bold"
                          : "bg-[#121414] text-[var(--color-neutral-a60)] border border-[#4d4638]/40 hover:bg-[#2c2c2c]/40"
                      }`}
                    >
                      No
                    </button>
                  </div>
                ) : (
                  <span className="flex items-center justify-center px-3.5 py-1 text-xs font-semibold rounded-full text-[var(--color-dorado)] bg-[#121414] h-[32px]">
                    {formatBoolean(clinicalHistory?.traumatismo)}
                  </span>
                )}
              </div>

              <div className="flex justify-between items-center py-4">
                <span className="text-[var(--color-blanco)] text-sm font-medium">
                  Tabaquismo
                </span>
                {isEditing ? (
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setTabaquismo(true)}
                      className={`px-4 py-1 text-xs font-semibold rounded-full transition-all h-[32px] cursor-pointer ${
                        tabaquismo
                          ? "bg-[linear-gradient(180deg,#FFE59C_15.87%,var(--color-dorado)_91.83%)] text-[var(--color-deepest)] border border-[var(--color-highlight)] font-bold"
                          : "bg-[#121414] text-[var(--color-neutral-a60)] border border-[#4d4638]/40 hover:bg-[#2c2c2c]/40"
                      }`}
                    >
                      Si
                    </button>
                    <button
                      type="button"
                      onClick={() => setTabaquismo(false)}
                      className={`px-4 py-1 text-xs font-semibold rounded-full transition-all h-[32px] cursor-pointer ${
                        !tabaquismo
                          ? "bg-[linear-gradient(180deg,#FFE59C_15.87%,var(--color-dorado)_91.83%)] text-[var(--color-deepest)] border border-[var(--color-highlight)] font-bold"
                          : "bg-[#121414] text-[var(--color-neutral-a60)] border border-[#4d4638]/40 hover:bg-[#2c2c2c]/40"
                      }`}
                    >
                      No
                    </button>
                  </div>
                ) : (
                  <span className="flex items-center justify-center px-3.5 py-1 text-xs font-semibold rounded-full text-[var(--color-dorado)] bg-[#121414] h-[32px]">
                    {formatBoolean(clinicalHistory?.tabaquismo)}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="bg-[var(--color-box)] rounded-[12px] border border-[#4d4638] p-6 shadow-md">
            <h2 className="text-lg font-bold text-[var(--color-blanco)] border-b border-[#4d4638]/40 pb-3 mb-4">
              Examen Fisico
            </h2>
            {isEditing ? (
              <textarea
                value={examenFisico}
                onChange={(e) => setExamenFisico(e.target.value)}
                rows={4}
                className="bg-[#121414] border border-[#4d4638] text-[var(--color-blanco)] p-3 rounded-[8px] focus:outline-none focus:border-[var(--color-dorado)] text-sm leading-relaxed w-full resize-y whitespace-pre-line"
              />
            ) : (
              <p className="text-[var(--color-blanco)]/80 text-sm leading-relaxed whitespace-pre-line">
                {clinicalHistory?.examen_fisico ||
                  "Sin examen físico registrado."}
              </p>
            )}
          </div>

          <div className="bg-[var(--color-box)] rounded-[12px] border border-[#4d4638] p-6 shadow-md">
            <h2 className="text-lg font-bold text-[var(--color-blanco)] border-b border-[#4d4638]/40 pb-3 mb-4">
              Cirugía Realizada
            </h2>
            {isEditing ? (
              <input
                type="text"
                value={cirugiaRealizada}
                onChange={(e) => setCirugiaRealizada(e.target.value)}
                className="bg-[#121414] border border-[#4d4638] text-[var(--color-blanco)] px-3 py-1.5 rounded-[8px] focus:outline-none focus:border-[var(--color-dorado)] text-sm font-medium w-full"
              />
            ) : (
              <p className="text-[var(--color-blanco)] text-sm font-semibold leading-relaxed">
                {clinicalHistory?.cirugia_realizada ||
                  "Sin cirugía registrada."}
              </p>
            )}
          </div>

          <div className="bg-[var(--color-box)] rounded-[12px] border border-[#4d4638] p-6 shadow-md flex flex-col">
            <div className="flex items-center justify-between border-b border-[#4d4638]/40 pb-4">
              <h2 className="text-lg font-bold text-[var(--color-blanco)] flex items-center gap-2">
                <span className="material-symbols-outlined text-[var(--color-dorado)]">
                  assignment
                </span>
                <span>Evoluciones Clínicas</span>
              </h2>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-[#121414] text-[var(--color-dorado)] border border-[#4d4638]/40">
                {evoluciones.length}{" "}
                {evoluciones.length === 1 ? "registro" : "registros"}
              </span>
            </div>

            {evoluciones.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <span className="material-symbols-outlined text-[40px] text-[#5d5d5d] mb-2 animate-pulse">
                  assignment_late
                </span>
                <p className="text-[var(--color-neutral-a60)] text-sm font-medium">
                  Sin evoluciones registradas para este paciente.
                </p>
              </div>
            ) : (
              <div className="relative pl-6 border-l border-[#4d4638]/60 ml-3.5 mt-6 space-y-6">
                {evoluciones.map((evol) => (
                  <div
                    key={evol.id}
                    className="relative group transition-all duration-200"
                  >
                    <div className="absolute -left-[31px] top-1.5 w-3.5 h-3.5 rounded-full bg-[#1a1c1c] border-2 border-[var(--color-dorado)] shadow-[0_0_8px_rgba(216,182,104,0.3)] group-hover:bg-[var(--color-dorado)] group-hover:scale-110 transition-all duration-300" />

                    <div className="flex flex-col gap-1.5">
                      <div className="flex items-center gap-1.5 text-xs text-[var(--color-dorado)] font-semibold uppercase tracking-wider">
                        <span className="material-symbols-outlined text-[14px]">
                          schedule
                        </span>
                        <span>{formatDateTime(evol.created_at)}</span>
                      </div>

                      <div className="bg-[#121414]/40 p-4 rounded-[8px] border border-[#4d4638]/30 hover:border-[#4d4638]/60 transition-all duration-300 shadow-sm">
                        <p className="text-[var(--color-blanco)]/95 text-sm leading-relaxed whitespace-pre-line">
                          {evol.texto}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="lg:col-span-1 flex flex-col gap-6">
          <div className="bg-[var(--color-box)] rounded-[12px] border border-[#4d4638] p-6 shadow-md">
            <h2 className="text-lg font-bold text-[var(--color-blanco)] border-b border-[#4d4638]/40 pb-3 mb-5">
              Información Personal
            </h2>
            <div className="flex flex-col gap-5">
              <div>
                <span className="text-[11px] font-bold tracking-wider text-[var(--color-dorado)] block mb-1">
                  TELÉFONO
                </span>
                {isEditing ? (
                  <input
                    type="text"
                    value={telefono}
                    onChange={(e) => setTelefono(e.target.value)}
                    className="bg-[#121414] border border-[#4d4638] text-[var(--color-blanco)] px-3 py-1.5 rounded-[8px] focus:outline-none focus:border-[var(--color-dorado)] text-sm font-medium w-full"
                  />
                ) : (
                  <span className="text-[var(--color-blanco)] text-sm font-medium">
                    {patient.telefono || "No especificado"}
                  </span>
                )}
              </div>

              <div>
                <span className="text-[11px] font-bold tracking-wider text-[var(--color-dorado)] block mb-1">
                  DIRECCIÓN
                </span>
                {isEditing ? (
                  <input
                    type="text"
                    value={direccion}
                    onChange={(e) => setDireccion(e.target.value)}
                    className="bg-[#121414] border border-[#4d4638] text-[var(--color-blanco)] px-3 py-1.5 rounded-[8px] focus:outline-none focus:border-[var(--color-dorado)] text-sm font-medium w-full"
                  />
                ) : (
                  <span className="text-[var(--color-blanco)] text-sm font-medium">
                    {patient.direccion || "No especificada"}
                  </span>
                )}
              </div>

              <div>
                <span className="text-[11px] font-bold tracking-wider text-[var(--color-dorado)] block mb-1">
                  COBERTURA MÉDICA
                </span>
                {isEditing ? (
                  <input
                    type="text"
                    value={obraSocial}
                    onChange={(e) => setObraSocial(e.target.value)}
                    className="bg-[#121414] border border-[#4d4638] text-[var(--color-blanco)] px-3 py-1.5 rounded-[8px] focus:outline-none focus:border-[var(--color-dorado)] text-sm font-medium w-full"
                  />
                ) : (
                  <span className="text-[var(--color-blanco)] text-sm font-medium">
                    {patient.obra_social || "No especificada"}
                  </span>
                )}
              </div>

              <div>
                <span className="text-[11px] font-bold tracking-wider text-[var(--color-dorado)] block mb-1">
                  MOTIVO DE CONSULTA
                </span>
                {isEditing ? (
                  <input
                    type="text"
                    value={motivoConsulta}
                    onChange={(e) => setMotivoConsulta(e.target.value)}
                    className="bg-[#121414] border border-[#4d4638] text-[var(--color-blanco)] px-3 py-1.5 rounded-[8px] focus:outline-none focus:border-[var(--color-dorado)] text-sm font-medium w-full"
                  />
                ) : (
                  <span className="text-[var(--color-blanco)] text-sm font-medium">
                    {clinicalHistory?.motivo_consulta || "No especificado"}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="bg-[var(--color-box)] rounded-[12px] border border-[#4d4638] p-6 shadow-md flex flex-col h-full">
            <h2 className="text-lg font-bold text-[var(--color-blanco)] border-b border-[#4d4638]/40 pb-3 mb-4">
              Estudios y Multimedia
            </h2>

            <div className="flex flex-col gap-2.5 mb-6 max-h-[220px] overflow-y-auto pr-1">
              {estudios.map((estudio) => (
                <div
                  key={estudio.id}
                  className="flex items-center justify-between p-3 rounded-[8px] bg-[#1a1c1c] border border-[#4d4638]/60 text-[var(--color-blanco)] text-sm hover:border-[var(--color-dorado)] transition-colors group"
                >
                  <span className="truncate pr-2 font-medium group-hover:text-[var(--color-dorado)] transition-colors">
                    {estudio.nombre_archivo}
                  </span>
                  <a
                    href={estudio.url_archivo}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center text-[var(--color-neutral-a60)] hover:text-[var(--color-dorado)] transition-colors"
                    title="Ver / Descargar"
                  >
                    <span className="material-symbols-outlined text-[20px]">
                      open_in_new
                    </span>
                  </a>
                </div>
              ))}

              {estudios.length === 0 && (
                <p className="text-[var(--color-neutral-a60)] text-sm text-center py-4">
                  No hay archivos cargados.
                </p>
              )}
            </div>

            <div
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              onClick={triggerFileInput}
              className={`border-2 border-dashed border-[#4d4638] hover:border-[var(--color-dorado)] rounded-[8px] p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-200 bg-transparent group ${
                isUploading ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                multiple
                disabled={isUploading}
                className="hidden"
              />

              <span className="material-symbols-outlined text-[36px] text-[var(--color-dorado)] mb-2.5 group-hover:scale-110 transition-transform duration-200">
                {isUploading ? "sync" : "cloud_upload"}
              </span>
              <p className="text-[var(--color-blanco)] text-sm font-semibold mb-0.5 group-hover:text-[var(--color-highlight)] transition-colors">
                {isUploading
                  ? "Subiendo archivos..."
                  : "Arrastra archivos aquí"}
              </p>
              <p className="text-[var(--color-neutral-a60)] text-[11px]">
                {isUploading ? "Por favor, espera" : "O haz clic para explorar"}
              </p>
            </div>
          </div>
        </div>
      </div>
      <NuevaEvolucionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={async (newText) => {
          try {
            const newEvolution = await patientService.createPatientEvolution(
              patientId,
              newText,
            );
            setEvoluciones((prev) => [newEvolution, ...prev]);
            setIsModalOpen(false);
            setShowToast(true);
          } catch (err) {
            console.error("Error saving evolution:", err);
            alert("No se pudo guardar la evolución en la base de datos.");
          }
        }}
      />

      <SuccessToast show={showToast} onClose={() => setShowToast(false)} />
    </div>
  );
}
