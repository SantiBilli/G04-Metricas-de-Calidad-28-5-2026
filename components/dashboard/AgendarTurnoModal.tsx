"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { patientService } from "@/services/patientService";
import { PatientData, AppointmentData, AppointmentType } from "@/types";

interface AgendarTurnoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (appointment: AppointmentData) => Promise<void>;
  defaultFecha: string;
}

export default function AgendarTurnoModal({
  isOpen,
  onClose,
  onSave,
  defaultFecha,
}: AgendarTurnoModalProps) {
  const router = useRouter();
  const [pacienteNombre, setPacienteNombre] = useState("");
  const [tipo, setTipo] = useState<AppointmentType>("Consulta General");
  const [fechaInput, setFechaInput] = useState("");
  const [horaInput, setHoraInput] = useState("09:00");
  const [observacion, setObservacion] = useState("");

  const [dbPatients, setDbPatients] = useState<PatientData[]>([]);
  const [filteredPatients, setFilteredPatients] = useState<PatientData[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);

  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      setPacienteNombre("");
      setTipo("Consulta General");
      setFechaInput(defaultFecha);
      setHoraInput("09:00");
      setObservacion("");
      setFilteredPatients([]);
      setShowDropdown(false);
      setErrorMsg(null);
      setIsSubmitting(false);

      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
    }
  }, [isOpen, defaultFecha]);

  useEffect(() => {
    async function fetchAllPatients() {
      try {
        const result = await patientService.getPatients({
          page: 1,
          pageSize: 200,
          filter: "Todos",
        });
        setDbPatients(result.data);
      } catch (err) {
        console.error("Error fetching patients for autocomplete:", err);
      }
    }
    if (isOpen) {
      fetchAllPatients();
    }
  }, [isOpen]);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        onClose();
      }
    }
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  if (!isOpen) return null;

  const handleNombreChange = (val: string) => {
    setPacienteNombre(val);
    if (val.trim()) {
      const filtered = dbPatients.filter((p) =>
        p.nombre_completo.toLowerCase().includes(val.toLowerCase()),
      );
      setFilteredPatients(filtered);
      setShowDropdown(true);
    } else {
      setFilteredPatients([]);
      setShowDropdown(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pacienteNombre.trim()) {
      setErrorMsg("Por favor ingrese el nombre del paciente.");
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      await onSave({
        pacienteNombre: pacienteNombre.trim(),
        tipo,
        fecha: fechaInput,
        hora: horaInput,
        observacion: observacion.trim() || "Sin observaciones.",
      });
    } catch (err: any) {
      console.error("Error in AgendarTurnoModal save:", err);
      setErrorMsg(err.message || "Ocurrió un error al agendar el turno.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 select-none animate-in fade-in duration-200">
      <div className="absolute inset-0 cursor-default" onClick={onClose}></div>

      <div
        className="w-full max-w-[550px] bg-[#1a1c1c] border border-[#4d4638] rounded-[16px] p-6 shadow-[0_12px_40px_rgba(0,0,0,0.7)] z-10 flex flex-col gap-5 animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-[#4d4638]/40 pb-3">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-[var(--color-dorado)] text-[24px]">
              event_available
            </span>
            <h3 className="text-white text-lg font-bold tracking-wide">
              Agendar Nuevo Turno
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-[var(--color-neutral-a60)] hover:text-white transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col relative" ref={dropdownRef}>
            <label className="text-[10px] font-bold tracking-wider text-[var(--color-dorado)] mb-1.5 uppercase">
              Nombre Completo del Paciente
            </label>
            <div className="relative">
              <input
                type="text"
                ref={inputRef}
                placeholder="Ej. Carlos Gómez"
                required
                value={pacienteNombre}
                onChange={(e) => handleNombreChange(e.target.value)}
                onFocus={() => {
                  if (pacienteNombre.trim()) {
                    setShowDropdown(true);
                  }
                }}
                disabled={isSubmitting}
                className="w-full bg-[#121212] border border-[#4d4638]/60 rounded-[8px] px-3.5 py-2 pr-10 text-white text-sm focus:outline-none focus:border-[var(--color-highlight)] transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                autoComplete="off"
              />
              <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-neutral-a60)] text-[18px] pointer-events-none">
                search
              </span>
            </div>

            {showDropdown && filteredPatients.length > 0 && (
              <div className="absolute top-[100%] left-0 w-full bg-[#1a1c1c] border border-[#4d4638] rounded-[8px] mt-1 shadow-[0_8px_30px_rgba(0,0,0,0.6)] z-20 max-h-[180px] overflow-y-auto divide-y divide-[#4d4638]/30">
                {filteredPatients.map((patient) => (
                  <button
                    key={patient.id}
                    type="button"
                    onClick={() => {
                      setPacienteNombre(patient.nombre_completo);
                      setShowDropdown(false);
                    }}
                    className="w-full text-left px-4 py-2.5 text-sm text-[var(--color-blanco)] hover:bg-[#856627]/20 hover:text-[var(--color-highlight)] transition-colors flex items-center justify-between cursor-pointer"
                  >
                    <span className="font-semibold">
                      {patient.nombre_completo}
                    </span>
                    <span className="text-[10px] font-semibold tracking-wide px-3 py-0.5 rounded-full bg-[#121414] text-[var(--color-dorado)] border border-[#4d4638]/40">
                      {patient.estado || "Control Pendiente"}
                    </span>
                  </button>
                ))}
              </div>
            )}

            {showDropdown &&
              pacienteNombre.trim() !== "" &&
              filteredPatients.length === 0 && (
                <div className="absolute top-[100%] left-0 w-full bg-[#1a1c1c] border border-[#4d4638] rounded-[8px] mt-1 shadow-[0_8px_30px_rgba(0,0,0,0.6)] z-20 p-3 text-center">
                  <p className="text-[var(--color-neutral-a60)] text-xs font-semibold">
                    No se encontraron pacientes registrados.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setShowDropdown(false);
                      onClose();
                      router.push("/dashboard/pacientes/nuevo");
                    }}
                    className="mt-1 text-[var(--color-dorado)] hover:text-white text-xs font-bold underline transition-colors cursor-pointer"
                  >
                    Agregar nuevo paciente
                  </button>
                </div>
              )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col">
              <label className="text-[10px] font-bold tracking-wider text-[var(--color-dorado)] mb-1.5 uppercase">
                Tipo de Turno
              </label>
              <select
                value={tipo}
                onChange={(e) => setTipo(e.target.value as any)}
                disabled={isSubmitting}
                className="w-full bg-[#121212] border border-[#4d4638]/60 rounded-[8px] px-3 py-2 text-white text-sm focus:outline-none focus:border-[var(--color-highlight)] cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <option value="Consulta General">Consulta General</option>
                <option value="Preoperatorio">Preoperatorio</option>
                <option value="Cirugía Próxima">Cirugía Próxima</option>
                <option value="Postoperatorio">Postoperatorio</option>
              </select>
            </div>

            <div className="flex flex-col">
              <label className="text-[10px] font-bold tracking-wider text-[var(--color-dorado)] mb-1.5 uppercase">
                Horario (HH:MM)
              </label>
              <input
                type="time"
                required
                value={horaInput}
                onChange={(e) => setHoraInput(e.target.value)}
                disabled={isSubmitting}
                className="w-full bg-[#121212] border border-[#4d4638]/60 rounded-[8px] px-3.5 py-2 text-white text-sm focus:outline-none focus:border-[var(--color-highlight)] disabled:opacity-40 disabled:cursor-not-allowed"
              />
            </div>
          </div>

          <div className="flex flex-col">
            <label className="text-[10px] font-bold tracking-wider text-[var(--color-dorado)] mb-1.5 uppercase">
              Fecha
            </label>
            <input
              type="date"
              required
              value={fechaInput}
              onChange={(e) => setFechaInput(e.target.value)}
              disabled={isSubmitting}
              className="w-full bg-[#121212] border border-[#4d4638]/60 rounded-[8px] px-3.5 py-2 text-white text-sm focus:outline-none focus:border-[var(--color-highlight)] disabled:opacity-40 disabled:cursor-not-allowed"
            />
          </div>

          <div className="flex flex-col">
            <label className="text-[10px] font-bold tracking-wider text-[var(--color-dorado)] mb-1.5 uppercase">
              Observaciones / Notas
            </label>
            <textarea
              placeholder="Ej. Control de yeso nasal o primer consulta para presupuesto..."
              rows={3}
              value={observacion}
              onChange={(e) => setObservacion(e.target.value)}
              className="w-full bg-[#121212] border border-[#4d4638]/60 rounded-[8px] p-3 text-white text-sm focus:outline-none focus:border-[var(--color-highlight)] resize-none"
              disabled={isSubmitting}
            />
          </div>

          {errorMsg && (
            <div className="flex items-start gap-2.5 p-3 rounded-[8px] bg-red-950/40 border border-red-900/40 text-red-200 text-xs leading-relaxed animate-in fade-in duration-200 select-text">
              <span className="material-symbols-outlined text-[16px] text-red-400 shrink-0 mt-0.5 select-none">
                error
              </span>
              <span>{errorMsg}</span>
            </div>
          )}

          <div className="flex justify-end gap-3 mt-2 border-t border-[#4d4638]/40 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-5 py-2 rounded-[8px] border border-zinc-600 text-zinc-300 font-semibold hover:bg-[#2c2c2c]/40 active:scale-98 transition-all text-xs cursor-pointer bg-transparent disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center justify-center gap-1.5 px-5 py-2 rounded-[8px] bg-[linear-gradient(180deg,#FFE59C_15.87%,var(--color-dorado)_91.83%)] text-[var(--color-deepest)] font-bold hover:opacity-95 active:scale-98 transition-all border border-[var(--color-highlight)] text-xs cursor-pointer shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="material-symbols-outlined text-[16px] font-bold">
                {isSubmitting ? "sync" : "check"}
              </span>
              <span>{isSubmitting ? "Agendando..." : "Agendar Turno"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
