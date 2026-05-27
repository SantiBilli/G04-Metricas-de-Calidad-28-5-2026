'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import PrimaryButton from '@/components/PrimaryButton';
import { patientService } from '@/services/patientService';
import { PatientData } from '@/types';

const statusStyles: Record<
  'Control Pendiente' | 'Cirugía Próxima' | 'Postoperatorio' | 'Preoperatorio',
  string
> = {
  'Control Pendiente': 'bg-[#856627] text-white',
  'Cirugía Próxima': 'bg-[#856627] text-white',
  Preoperatorio: 'bg-[#856627] text-white',
  Postoperatorio: 'bg-[#856627] text-white',
};

const formatEventDate = (fechaStr: string, horaStr: string) => {
  const [y, m, d] = fechaStr.split('-').map(Number);
  const targetDate = new Date(y, m - 1, d);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const diffTime = targetDate.getTime() - today.getTime();
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

  let dayText = '';
  if (diffDays === 0) {
    dayText = 'Hoy';
  } else if (diffDays === 1) {
    dayText = 'Mañana';
  } else if (diffDays < 7) {
    const weekdays = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    dayText = weekdays[targetDate.getDay()];
  } else {
    const weekdays = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
    const months = [
      'Ene',
      'Feb',
      'Mar',
      'Abr',
      'May',
      'Jun',
      'Jul',
      'Ago',
      'Sep',
      'Oct',
      'Nov',
      'Dic',
    ];
    dayText = `${weekdays[targetDate.getDay()]} ${d} ${months[m - 1]}`;
  }

  let ampm = 'AM';
  let [hr, min] = horaStr.split(':').map(Number);
  if (hr >= 12) {
    ampm = 'PM';
    if (hr > 12) hr -= 12;
  }
  if (hr === 0) hr = 12;
  const hourText = `${String(hr).padStart(2, '0')}:${String(min).padStart(2, '0')} ${ampm}`;

  return `${dayText}, ${hourText}`;
};

export default function PacientesPage() {
  const filters = [
    'Todos',
    'Control Pendiente',
    'Preoperatorio',
    'Cirugía Próxima',
    'Postoperatorio',
  ];

  const [patients, setPatients] = useState<PatientData[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(8);
  const [activeFilter, setActiveFilter] = useState('Todos');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPatients = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await patientService.getPatients({
        page,
        pageSize,
        filter: activeFilter,
      });
      setPatients(result.data);
      setTotalCount(result.count);
    } catch (err) {
      console.error('Error loading patients:', err);
      setError('Ocurrió un error al cargar la lista de pacientes. Por favor, intenta de nuevo.');
    } finally {
      setIsLoading(false);
    }
  }, [page, pageSize, activeFilter]);

  useEffect(() => {
    fetchPatients();
  }, [fetchPatients]);

  const router = useRouter();

  const getNextAppointment = (patient: PatientData) => {
    if (!patient.turnos || patient.turnos.length === 0) return null;

    const today = new Date();
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

    const future = patient.turnos.filter((t) => t.fecha >= todayStr);
    if (future.length === 0) return null;

    future.sort((a, b) => a.fecha.localeCompare(b.fecha) || a.hora.localeCompare(b.hora));
    return future[0];
  };

  const getLastAppointment = (patient: PatientData) => {
    if (!patient.turnos || patient.turnos.length === 0) return null;

    const today = new Date();
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

    const past = patient.turnos.filter((t) => t.fecha < todayStr);
    if (past.length === 0) return null;

    past.sort((a, b) => b.fecha.localeCompare(a.fecha) || b.hora.localeCompare(a.hora));
    return past[0];
  };

  const formatLastVisitDate = (fechaStr: string) => {
    const [y, m, d] = fechaStr.split('-').map(Number);
    const months = [
      'Ene',
      'Feb',
      'Mar',
      'Abr',
      'May',
      'Jun',
      'Jul',
      'Ago',
      'Sep',
      'Oct',
      'Nov',
      'Dic',
    ];
    return `${d} ${months[m - 1]} ${y}`;
  };

  const totalPages = Math.ceil(totalCount / pageSize);

  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);

      if (page > 3) {
        pages.push('...');
      }

      const start = Math.max(2, page - 1);
      const end = Math.min(totalPages - 1, page + 1);

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      if (page < totalPages - 2) {
        pages.push('...');
      }

      pages.push(totalPages);
    }

    return pages;
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-[2rem] font-bold text-[var(--color-highlight)]">Pacientes</h1>
        <PrimaryButton icon="add" text="Agregar Paciente" href="/dashboard/pacientes/nuevo" />
      </div>

      <div className="flex flex-wrap gap-4 mb-6">
        {filters.map((filter) => {
          const isActive = filter === activeFilter;
          return (
            <button
              key={filter}
              onClick={() => {
                setActiveFilter(filter);
                setPage(1);
              }}
              className={`px-5 py-1.5 rounded-full text-sm font-semibold transition-all border ${
                isActive
                  ? 'bg-[linear-gradient(180deg,#FFE59C_15.87%,var(--color-dorado)_91.83%)] border-[var(--color-highlight)] text-[var(--color-deepest)] cursor-default'
                  : 'bg-transparent border-[var(--color-dorado)] text-[var(--color-dorado)] hover:bg-[#2a2a2a] cursor-pointer'
              }`}>
              {filter}
            </button>
          );
        })}
      </div>

      {error && (
        <div className="mb-6 p-4 rounded-[12px] bg-red-950/20 border border-red-900/50 text-red-200 text-sm flex items-center gap-2">
          <span className="material-symbols-outlined text-[20px]">error</span>
          <span>{error}</span>
          <button
            onClick={fetchPatients}
            className="ml-auto text-xs underline hover:text-white transition-colors">
            Reintentar
          </button>
        </div>
      )}

      <div className="flex flex-col gap-2">
        <div className="grid grid-cols-4 px-6 py-4 bg-[var(--color-box)] rounded-[12px] border border-[#4D4638]">
          <span className="font-semibold text-white">Paciente</span>
          <span className="font-semibold text-white">Detalle</span>
          <span className="font-semibold text-white">Próximo Evento</span>
          <span className="font-semibold text-white">Estado</span>
        </div>

        {isLoading ? (
          Array.from({ length: pageSize }).map((_, idx) => (
            <div
              key={`skeleton-${idx}`}
              className="grid grid-cols-4 items-center px-6 py-5 bg-[var(--color-box)] rounded-[12px] border border-[#4D4638] animate-pulse">
              <div className="flex flex-col gap-2">
                <div className="h-4 bg-zinc-800 rounded w-3/4"></div>
                <div className="h-3 bg-zinc-800 rounded w-1/2"></div>
              </div>
              <div className="h-4 bg-zinc-800 rounded w-1/4"></div>
              <div className="h-4 bg-zinc-800 rounded w-1/4"></div>
              <div className="h-6 bg-zinc-800 rounded-full w-24"></div>
            </div>
          ))
        ) : patients.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-6 bg-[var(--color-box)] rounded-[12px] border border-[#4D4638]">
            <span className="material-symbols-outlined text-[48px] text-[var(--color-dorado)] mb-3">
              person_search
            </span>
            <p className="text-white font-medium mb-1 text-lg">No se encontraron pacientes</p>
            <p className="text-[var(--color-neutral-a60)] text-sm text-center max-w-md">
              {activeFilter === 'Todos'
                ? 'Comienza agregando un nuevo paciente utilizando el botón "Agregar Paciente".'
                : `Actualmente no hay ningún paciente registrado en la categoría de "${activeFilter}".`}
            </p>
          </div>
        ) : (
          patients.map((patient) => {
            const nextApp = getNextAppointment(patient);
            const lastApp = getLastAppointment(patient);

            return (
              <Link
                key={patient.id}
                href={`/dashboard/pacientes/${patient.id}`}
                className="grid grid-cols-4 items-center px-6 py-4 bg-[var(--color-box)] rounded-[12px] border border-[#4D4638] hover:border-[var(--color-dorado)] transition-all duration-200 cursor-pointer">
                <div className="flex flex-col">
                  <span className="text-[var(--color-blanco)] font-medium text-body-lg">
                    {patient.nombre_completo}
                  </span>
                </div>

                <div className="flex items-center">
                  {lastApp ? (
                    <span className="text-[var(--color-neutral-a60)] text-[14px]">
                      Últ. Visita: {formatLastVisitDate(lastApp.fecha)}
                    </span>
                  ) : (
                    <span className="text-[var(--color-neutral-a60)] font-medium">-</span>
                  )}
                </div>

                <div className="flex items-center">
                  {nextApp ? (
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        router.push(`/dashboard/calendario?date=${nextApp.fecha}`);
                      }}
                      className="text-[var(--color-neutral-a60)] text-[15px] font-medium hover:text-[var(--color-blanco)] transition-colors text-left">
                      {formatEventDate(nextApp.fecha, nextApp.hora)}
                    </button>
                  ) : (
                    <span className="text-[var(--color-neutral-a60)] font-medium">-</span>
                  )}
                </div>

                <div>
                  <span className="inline-block px-5 py-1.5 rounded-full text-[13px] font-medium tracking-wide bg-[#856627] text-white">
                    {patient.estado || 'Control Pendiente'}
                  </span>
                </div>
              </Link>
            );
          })
        )}
      </div>

      {!isLoading && totalCount > 0 && (
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-8 mb-4 text-[var(--color-neutral-a60)] font-medium">
          <div className="flex items-center gap-2 text-sm">
            <span>Mostrar</span>
            <div className="relative">
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setPage(1);
                }}
                className="appearance-none bg-[var(--color-box)] border border-[#4D4638] text-[var(--color-blanco)] pl-3 pr-8 py-1.5 rounded-[8px] focus:outline-none focus:border-[var(--color-dorado)] transition-colors cursor-pointer text-sm font-medium">
                <option value={8}>8</option>
                <option value={16}>16</option>
                <option value={32}>32</option>
              </select>
              <span className="material-symbols-outlined text-[16px] absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-[var(--color-dorado)]">
                keyboard_arrow_down
              </span>
            </div>
            <span>pacientes por página (Total: {totalCount})</span>
          </div>

          <div className="flex justify-center items-center gap-4">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="flex items-center gap-1 hover:text-white transition-colors disabled:opacity-40 disabled:hover:text-[var(--color-neutral-a60)] disabled:cursor-not-allowed">
              <span className="material-symbols-outlined text-[20px]">chevron_left</span> Atrás
            </button>

            <div className="flex items-center gap-2">
              {getPageNumbers().map((pageNum, idx) =>
                pageNum === '...' ? (
                  <span key={`dots-${idx}`} className="px-1 text-[var(--color-neutral-a60)]">
                    ...
                  </span>
                ) : (
                  <button
                    key={`page-${pageNum}`}
                    onClick={() => setPage(pageNum as number)}
                    className={`w-8 h-8 flex items-center justify-center rounded-[8px] transition-colors ${
                      page === pageNum
                        ? 'border border-[#4D4638] bg-[var(--color-box)] text-white font-semibold'
                        : 'hover:text-white hover:bg-[#2a2a2a]'
                    }`}>
                    {pageNum}
                  </button>
                )
              )}
            </div>

            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages || totalPages === 0}
              className="flex items-center gap-1 hover:text-white transition-colors disabled:opacity-40 disabled:hover:text-[var(--color-neutral-a60)] disabled:cursor-not-allowed">
              Siguiente <span className="material-symbols-outlined text-[20px]">chevron_right</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
