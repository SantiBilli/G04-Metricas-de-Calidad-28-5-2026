"use client";

import React, { useState, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import PrimaryButton from "@/components/PrimaryButton";
import { patientService } from "@/services/patientService";

export default function NuevoPacientePage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [nombreCompleto, setNombreCompleto] = useState("");
  const [dni, setDni] = useState("");
  const [fechaNacimiento, setFechaNacimiento] = useState("");
  const [telefono, setTelefono] = useState("");
  const [direccion, setDireccion] = useState("");
  const [obraSocial, setObraSocial] = useState("OSDE 210");
  const [estado, setEstado] = useState<
    "Control Pendiente" | "Cirugía Próxima" | "Postoperatorio"
  >("Postoperatorio");
  const [motivoConsulta, setMotivoConsulta] = useState("");

  const [funcionVentilatoria, setFuncionVentilatoria] = useState(true);
  const [cottleResultado, setCottleResultado] = useState(true);
  const [cottleLado, setCottleLado] = useState("Izq.");
  const [acidoHialuronico, setAcidoHialuronico] = useState(false);
  const [traumatismo, setTraumatismo] = useState(false);
  const [tabaquismo, setTabaquismo] = useState(false);

  const [medicacion, setMedicacion] = useState("");
  const [alergias, setAlergias] = useState("");
  const [antecedentesMedicos, setAntecedentesMedicos] = useState("");
  const [antecedentesQuirurgicos, setAntecedentesQuirurgicos] = useState("");

  const [examenFisico, setExamenFisico] = useState("");
  const [cirugiaRealizada, setCirugiaRealizada] = useState("");
  const [evolucionText, setEvolucionText] = useState("");

  const [filesToUpload, setFilesToUpload] = useState<File[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const chosen = e.target.files;
    if (chosen) {
      const arr = Array.from(chosen);
      setFilesToUpload((prev) => [...prev, ...arr]);
    }
  };

  const handleFileDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files) {
      const arr = Array.from(e.dataTransfer.files);
      setFilesToUpload((prev) => [...prev, ...arr]);
    }
  };

  const removeFile = (idx: number) => {
    setFilesToUpload((prev) => prev.filter((_, i) => i !== idx));
  };

  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombreCompleto.trim()) {
      setErrorMsg("El Nombre Completo es obligatorio.");
      return;
    }

    setIsSaving(true);
    setErrorMsg("");

    try {
      const patientData = {
        nombre_completo: nombreCompleto.trim(),
        dni: dni.trim() || null,
        fecha_nacimiento: fechaNacimiento.trim() || null,
        telefono: telefono.trim() || null,
        direccion: direccion.trim() || null,
        obra_social: obraSocial,
        estado: estado,
      };

      const historyData = {
        motivo_consulta: motivoConsulta.trim() || null,
        funcion_ventilatoria: funcionVentilatoria,
        cottle_resultado: cottleResultado,
        cottle_lado: cottleResultado ? cottleLado : null,
        acido_hialuronico: acidoHialuronico,
        traumatismo: traumatismo,
        tabaquismo: tabaquismo,
        medicacion: medicacion.trim() || null,
        alergias: alergias.trim() || null,
        antecedentes_medicos: antecedentesMedicos.trim() || null,
        antecedentes_quirurgicos: antecedentesQuirurgicos.trim() || null,
        examen_fisico: examenFisico.trim() || null,
        cirugia_realizada: cirugiaRealizada.trim() || null,
      };

      await patientService.createPatient(
        patientData,
        historyData,
        filesToUpload,
        evolucionText,
      );
      router.push("/dashboard/pacientes");
    } catch (err: any) {
      console.error("Error saving patient:", err);
      setErrorMsg(err.message || "Ocurrió un error al guardar el paciente.");
      setIsSaving(false);
    }
  };

  const inputClass =
    "w-full bg-[#121212] border border-[#1a1a1a] rounded-[8px] px-4 py-2.5 text-[var(--color-blanco)] text-sm focus:outline-none focus:border-[var(--color-highlight)] transition-all";
  const labelClass =
    "block text-[11px] font-semibold text-[var(--color-neutral-a60)] uppercase tracking-wider mb-1.5";
  const sectionClass =
    "bg-[var(--color-box)] rounded-[12px] border border-[#4D4638] p-6 flex flex-col divide-y divide-[#4d4638]/30";
  const sectionTitleClass =
    "flex items-center gap-2 text-white font-semibold text-lg pb-4";

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col h-full gap-6 max-w-[1200px] mx-auto w-full pb-10"
    >
      <div className="flex justify-between items-center mb-2">
        <Link
          href="/dashboard/pacientes"
          className="flex items-center gap-2 text-[var(--color-dorado)] hover:text-white transition-colors font-medium"
        >
          <span className="material-symbols-outlined text-[18px]">
            chevron_left
          </span>
          Nueva Historia Clínica
        </Link>

        <div className="flex items-center gap-3">
          <PrimaryButton
            text="Cancelar"
            href="/dashboard/pacientes"
            variant="secondary"
            disabled={isSaving}
          />
          <PrimaryButton
            text={isSaving ? "Guardando..." : "Guardar Cambios"}
            type="submit"
            disabled={isSaving}
            icon={isSaving ? undefined : "save"}
          />
        </div>
      </div>

      {errorMsg && (
        <div className="flex items-start gap-2.5 p-3 rounded-[8px] bg-red-950/40 border border-red-900/40 backdrop-blur-sm text-red-200 text-xs leading-relaxed animate-in fade-in duration-200">
          <span className="material-symbols-outlined text-[16px] text-red-400 shrink-0 mt-0.5">
            error
          </span>
          <span>{errorMsg}</span>
        </div>
      )}

      <div className="flex flex-col gap-6">
        <section className={sectionClass}>
          <div className={sectionTitleClass}>
            <span className="material-symbols-outlined text-[var(--color-dorado)]">
              person
            </span>
            Información Personal
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 pt-6">
            <div className="md:col-span-2">
              <label className={labelClass}>Nombre Completo</label>
              <input
                type="text"
                placeholder="Ej. María López"
                className={inputClass}
                value={nombreCompleto}
                onChange={(e) => setNombreCompleto(e.target.value)}
                disabled={isSaving}
                required
              />
            </div>
            <div className="md:col-span-1">
              <label className={labelClass}>DNI / Identificación</label>
              <input
                type="text"
                placeholder="12.345.678"
                className={inputClass}
                value={dni}
                onChange={(e) => setDni(e.target.value)}
                disabled={isSaving}
              />
            </div>
            <div className="md:col-span-1">
              <label className={labelClass}>Fecha de Nacimiento</label>
              <input
                type="date"
                className={inputClass}
                value={fechaNacimiento}
                onChange={(e) => setFechaNacimiento(e.target.value)}
                disabled={isSaving}
              />
            </div>

            <div className="md:col-span-1">
              <label className={labelClass}>Teléfono</label>
              <input
                type="text"
                placeholder="+54 911"
                className={inputClass}
                value={telefono}
                onChange={(e) => setTelefono(e.target.value)}
                disabled={isSaving}
              />
            </div>
            <div className="md:col-span-1">
              <label className={labelClass}>Dirección</label>
              <input
                type="text"
                placeholder="Palermo, CABA"
                className={inputClass}
                value={direccion}
                onChange={(e) => setDireccion(e.target.value)}
                disabled={isSaving}
              />
            </div>
            <div className="md:col-span-1">
              <label className={labelClass}>Seguro / Obra Social</label>
              <div className="relative flex items-center">
                <select
                  className={`${inputClass} appearance-none pr-10 cursor-pointer`}
                  value={obraSocial}
                  onChange={(e) => setObraSocial(e.target.value)}
                  disabled={isSaving}
                >
                  <option>OSDE 210</option>
                  <option>Swiss Medical</option>
                  <option>Particular</option>
                </select>
                <span className="material-symbols-outlined absolute right-3 text-[var(--color-neutral-a60)] pointer-events-none text-[18px]">
                  keyboard_arrow_down
                </span>
              </div>
            </div>
            <div className="md:col-span-1">
              <label className={labelClass}>Estado</label>
              <div className="relative flex items-center">
                <select
                  className={`${inputClass} appearance-none pr-10 cursor-pointer text-zinc-300`}
                  value={estado}
                  onChange={(e) => setEstado(e.target.value as any)}
                  disabled={isSaving}
                >
                  <option
                    value="Control Pendiente"
                    className="bg-[#1a1c1c] text-zinc-300"
                  >
                    Control Pendiente
                  </option>
                  <option
                    value="Preoperatorio"
                    className="bg-[#1a1c1c] text-zinc-300"
                  >
                    Preoperatorio
                  </option>
                  <option
                    value="Cirugía Próxima"
                    className="bg-[#1a1c1c] text-zinc-300"
                  >
                    Cirugía Próxima
                  </option>
                  <option
                    value="Postoperatorio"
                    className="bg-[#1a1c1c] text-zinc-300"
                  >
                    Postoperatorio
                  </option>
                </select>
                <span className="material-symbols-outlined absolute right-3 text-[var(--color-neutral-a60)] pointer-events-none text-[18px]">
                  keyboard_arrow_down
                </span>
              </div>
            </div>

            <div className="md:col-span-4">
              <label className={labelClass}>Motivo de Consulta</label>
              <input
                type="text"
                placeholder="Ej. Rinoplastia Funcional"
                className={inputClass}
                value={motivoConsulta}
                onChange={(e) => setMotivoConsulta(e.target.value)}
                disabled={isSaving}
              />
            </div>
          </div>
        </section>

        <section className={sectionClass}>
          <div className={sectionTitleClass}>
            <span className="material-symbols-outlined text-[var(--color-dorado)]">
              checklist
            </span>
            Evaluación Clínica Específica
          </div>

          <div className="flex flex-col divide-y divide-[#4d4638]/30 pt-6">
            <div className="flex justify-between items-center py-4 first:pt-0 last:pb-0">
              <span className="text-white text-sm">
                Función Ventilatoria Nasal
              </span>
              <div className="flex bg-[#121212] rounded-md p-1 border border-[#1a1a1a]">
                <button
                  type="button"
                  onClick={() => setFuncionVentilatoria(true)}
                  disabled={isSaving}
                  className={`px-4 py-1 rounded-md text-xs font-semibold cursor-pointer transition-all ${funcionVentilatoria ? "bg-[var(--color-dorado)] text-black font-bold" : "text-[var(--color-neutral-a60)] hover:text-white"}`}
                >
                  Sí
                </button>
                <button
                  type="button"
                  onClick={() => setFuncionVentilatoria(false)}
                  disabled={isSaving}
                  className={`px-4 py-1 rounded-md text-xs font-semibold cursor-pointer transition-all ${!funcionVentilatoria ? "bg-[var(--color-dorado)] text-black font-bold" : "text-[var(--color-neutral-a60)] hover:text-white"}`}
                >
                  No
                </button>
              </div>
            </div>

            <div className="flex justify-between items-start py-4 last:pb-0">
              <span className="text-white text-sm mt-2 h-full flex justify-center items-center">
                Maniobra de Cottle
              </span>
              <div className="flex flex-col gap-2 items-end">
                <div className="flex bg-[#121212] rounded-md p-1 border border-[#1a1a1a]">
                  <button
                    type="button"
                    onClick={() => setCottleResultado(true)}
                    disabled={isSaving}
                    className={`px-4 py-1 rounded-md text-xs font-semibold cursor-pointer transition-all ${cottleResultado ? "bg-[var(--color-dorado)] text-black font-bold" : "text-[var(--color-neutral-a60)] hover:text-white"}`}
                  >
                    Sí
                  </button>
                  <button
                    type="button"
                    onClick={() => setCottleResultado(false)}
                    disabled={isSaving}
                    className={`px-4 py-1 rounded-md text-xs font-semibold cursor-pointer transition-all ${!cottleResultado ? "bg-[var(--color-dorado)] text-black font-bold" : "text-[var(--color-neutral-a60)] hover:text-white"}`}
                  >
                    No
                  </button>
                </div>
                <div
                  className={`flex bg-[#121212] rounded-md p-1 border border-[#1a1a1a] transition-all duration-300 ${cottleResultado ? "opacity-100" : "opacity-30 pointer-events-none"}`}
                >
                  <button
                    type="button"
                    onClick={() => setCottleLado("Izq.")}
                    disabled={isSaving || !cottleResultado}
                    className={`px-4 py-1 rounded-md text-xs font-semibold cursor-pointer transition-all ${cottleResultado && cottleLado === "Izq." ? "bg-[var(--color-dorado)] text-black font-bold" : "text-[var(--color-neutral-a60)] hover:text-white"}`}
                  >
                    Izq.
                  </button>
                  <button
                    type="button"
                    onClick={() => setCottleLado("Der.")}
                    disabled={isSaving || !cottleResultado}
                    className={`px-4 py-1 rounded-md text-xs font-semibold cursor-pointer transition-all ${cottleResultado && cottleLado === "Der." ? "bg-[var(--color-dorado)] text-black font-bold" : "text-[var(--color-neutral-a60)] hover:text-white"}`}
                  >
                    Der.
                  </button>
                </div>
              </div>
            </div>

            <div className="flex justify-between items-center py-4 last:pb-0">
              <span className="text-white text-sm">Ácido Hialurónico</span>
              <div className="flex bg-[#121212] rounded-md p-1 border border-[#1a1a1a]">
                <button
                  type="button"
                  onClick={() => setAcidoHialuronico(true)}
                  disabled={isSaving}
                  className={`px-4 py-1 rounded-md text-xs font-semibold cursor-pointer transition-all ${acidoHialuronico ? "bg-[var(--color-dorado)] text-black font-bold" : "text-[var(--color-neutral-a60)] hover:text-white"}`}
                >
                  Sí
                </button>
                <button
                  type="button"
                  onClick={() => setAcidoHialuronico(false)}
                  disabled={isSaving}
                  className={`px-4 py-1 rounded-md text-xs font-semibold cursor-pointer transition-all ${!acidoHialuronico ? "bg-[var(--color-dorado)] text-black font-bold" : "text-[var(--color-neutral-a60)] hover:text-white"}`}
                >
                  No
                </button>
              </div>
            </div>

            <div className="flex justify-between items-center py-4 last:pb-0">
              <span className="text-white text-sm">Traumatismo</span>
              <div className="flex bg-[#121212] rounded-md p-1 border border-[#1a1a1a]">
                <button
                  type="button"
                  onClick={() => setTraumatismo(true)}
                  disabled={isSaving}
                  className={`px-4 py-1 rounded-md text-xs font-semibold cursor-pointer transition-all ${traumatismo ? "bg-[var(--color-dorado)] text-black font-bold" : "text-[var(--color-neutral-a60)] hover:text-white"}`}
                >
                  Sí
                </button>
                <button
                  type="button"
                  onClick={() => setTraumatismo(false)}
                  disabled={isSaving}
                  className={`px-4 py-1 rounded-md text-xs font-semibold cursor-pointer transition-all ${!traumatismo ? "bg-[var(--color-dorado)] text-black font-bold" : "text-[var(--color-neutral-a60)] hover:text-white"}`}
                >
                  No
                </button>
              </div>
            </div>

            <div className="flex justify-between items-center py-4 last:pb-0">
              <span className="text-white text-sm">Tabaquismo</span>
              <div className="flex bg-[#121212] rounded-md p-1 border border-[#1a1a1a]">
                <button
                  type="button"
                  onClick={() => setTabaquismo(true)}
                  disabled={isSaving}
                  className={`px-4 py-1 rounded-md text-xs font-semibold cursor-pointer transition-all ${tabaquismo ? "bg-[var(--color-dorado)] text-black font-bold" : "text-[var(--color-neutral-a60)] hover:text-white"}`}
                >
                  Sí
                </button>
                <button
                  type="button"
                  onClick={() => setTabaquismo(false)}
                  disabled={isSaving}
                  className={`px-4 py-1 rounded-md text-xs font-semibold cursor-pointer transition-all ${!tabaquismo ? "bg-[var(--color-dorado)] text-black font-bold" : "text-[var(--color-neutral-a60)] hover:text-white"}`}
                >
                  No
                </button>
              </div>
            </div>
          </div>
        </section>

        <section className={sectionClass}>
          <div className={sectionTitleClass}>
            <span className="material-symbols-outlined text-[var(--color-dorado)]">
              history
            </span>
            Antecedentes
          </div>

          <div className="flex flex-col gap-6 pt-6">
            <div>
              <label className={labelClass}>Medicación</label>
              <textarea
                placeholder="Lorem ipsum dolor..."
                rows={3}
                className={inputClass}
                value={medicacion}
                onChange={(e) => setMedicacion(e.target.value)}
                disabled={isSaving}
              />
            </div>
            <div>
              <label className={labelClass}>Alergias Médicas</label>
              <textarea
                placeholder="Lorem ipsum dolor..."
                rows={3}
                className={inputClass}
                value={alergias}
                onChange={(e) => setAlergias(e.target.value)}
                disabled={isSaving}
              />
            </div>
            <div>
              <label className={labelClass}>Antecedentes Médicos</label>
              <textarea
                placeholder="Lorem ipsum dolor..."
                rows={3}
                className={inputClass}
                value={antecedentesMedicos}
                onChange={(e) => setAntecedentesMedicos(e.target.value)}
                disabled={isSaving}
              />
            </div>
            <div>
              <label className={labelClass}>Antecedentes Quirúrgicos</label>
              <textarea
                placeholder="Lorem ipsum dolor..."
                rows={3}
                className={inputClass}
                value={antecedentesQuirurgicos}
                onChange={(e) => setAntecedentesQuirurgicos(e.target.value)}
                disabled={isSaving}
              />
            </div>
          </div>
        </section>

        <section className={sectionClass}>
          <div className={sectionTitleClass}>
            <span className="material-symbols-outlined text-[var(--color-dorado)]">
              accessibility_new
            </span>
            Examen Físico
          </div>
          <div className="pt-6">
            <textarea
              placeholder="Lorem ipsum dolor..."
              rows={4}
              className={inputClass}
              value={examenFisico}
              onChange={(e) => setExamenFisico(e.target.value)}
              disabled={isSaving}
            />
          </div>
        </section>

        <section className={sectionClass}>
          <div className={sectionTitleClass}>
            <span className="material-symbols-outlined text-[var(--color-dorado)]">
              cloud_done
            </span>
            Cirugía Realizada
          </div>
          <div className="pt-6">
            <textarea
              placeholder="Lorem ipsum dolor..."
              rows={4}
              className={inputClass}
              value={cirugiaRealizada}
              onChange={(e) => setCirugiaRealizada(e.target.value)}
              disabled={isSaving}
            />
          </div>
        </section>

        <section className={sectionClass}>
          <div className={sectionTitleClass}>
            <span className="material-symbols-outlined text-[var(--color-dorado)]">
              auto_stories
            </span>
            Evolución
          </div>
          <div className="pt-6">
            <textarea
              placeholder="Lorem ipsum dolor..."
              rows={4}
              className={inputClass}
              value={evolucionText}
              onChange={(e) => setEvolucionText(e.target.value)}
              disabled={isSaving}
            />
          </div>
        </section>

        <section className={sectionClass}>
          <div className={sectionTitleClass}>
            <span className="material-symbols-outlined text-[var(--color-dorado)]">
              cloud_upload
            </span>
            Estudios e imágenes
          </div>

          <div className="flex flex-col gap-6 pt-6">
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleFileDrop}
              className={`flex flex-col items-center justify-center p-10 border border-dashed border-[#4D4638] rounded-[12px] bg-[#121212] transition-colors duration-200 ${isSaving ? "opacity-50 cursor-not-allowed" : "hover:border-[var(--color-dorado)]"}`}
            >
              <span className="material-symbols-outlined text-[var(--color-dorado)] text-4xl mb-2">
                cloud_upload
              </span>
              <h3 className="text-white font-semibold mb-1">Cargar Archivos</h3>
              <p className="text-[var(--color-neutral-a60)] text-sm mb-4 text-center max-w-sm">
                Arrastre y suelte sus archivos aquí o haga clic para explorar.
                Acepta JPG, PNG y PDF hasta 20MB.
              </p>

              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileSelect}
                multiple
                className="hidden"
                disabled={isSaving}
              />

              <button
                type="button"
                onClick={triggerFileSelect}
                disabled={isSaving}
                className="flex items-center gap-2 text-[var(--color-dorado)] text-sm font-semibold hover:text-white transition-colors cursor-pointer disabled:opacity-50 disabled:pointer-events-none"
              >
                <span className="material-symbols-outlined text-[18px]">
                  add_circle
                </span>
                Seleccionar archivos
              </button>
            </div>

            {filesToUpload.length > 0 && (
              <div className="flex flex-wrap gap-4 mt-2">
                {filesToUpload.map((file, idx) => (
                  <div
                    key={idx}
                    className="relative w-24 h-24 bg-[#121212] rounded-[8px] border border-[#4D4638]/50 flex flex-col items-center justify-center p-2 text-center group transition-all"
                  >
                    <span className="material-symbols-outlined text-[var(--color-dorado)] text-2xl mb-1">
                      {file.type.startsWith("image/") ? "image" : "description"}
                    </span>
                    <span className="text-[var(--color-neutral-a60)] text-[10px] truncate w-full px-1">
                      {file.name}
                    </span>

                    {!isSaving && (
                      <button
                        type="button"
                        onClick={() => removeFile(idx)}
                        className="absolute -top-1.5 -right-1.5 w-6 h-6 rounded-full bg-red-950/90 border border-red-800 flex items-center justify-center text-red-200 hover:text-white cursor-pointer shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <span className="material-symbols-outlined text-[14px]">
                          close
                        </span>
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </div>
    </form>
  );
}
