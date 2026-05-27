'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import AgendarTurnoModal from '@/components/dashboard/AgendarTurnoModal';
import { AppointmentData } from '@/types';
import { appointmentService } from '@/services/appointmentService';

const typeStyles: Record<string, string> = {
  'Consulta General': 'bg-[#856627]',
  Preoperatorio: 'bg-[#856627]',
  'Cirugía Próxima': 'bg-[#856627]',
  Postoperatorio: 'bg-[#856627]',
};

const weekDays = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
const months = [
  'Enero',
  'Febrero',
  'Marzo',
  'Abril',
  'Mayo',
  'Junio',
  'Julio',
  'Agosto',
  'Septiembre',
  'Octubre',
  'Noviembre',
  'Diciembre',
];

export default function CalendarioPage() {
  const [appointments, setAppointments] = useState<AppointmentData[]>([]);
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const dateParam = params.get('date');
      if (dateParam) {
        const [y, m, d] = dateParam.split('-').map(Number);
        if (y && m && d) {
          setCurrentDate(new Date(y, m - 1, 1));
          setSelectedDate(new Date(y, m - 1, d));
        }
      }
    }
  }, []);

  useEffect(() => {
    async function loadAppointments() {
      try {
        setIsLoading(true);
        const list = await appointmentService.getAppointments();
        setAppointments(list);
      } catch (err) {
        console.error('Error loading appointments:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadAppointments();
  }, []);

  const [isModalOpen, setIsModalOpen] = useState(false);

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  const formatDateString = (date: Date): string => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  };

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDayIndex = new Date(year, month, 1).getDay();
  const totalDays = new Date(year, month + 1, 0).getDate();
  const prevTotalDays = new Date(year, month, 0).getDate();

  const calendarDays: { day: number; isCurrentMonth: boolean; date: Date }[] = [];

  for (let i = firstDayIndex - 1; i >= 0; i--) {
    const prevDay = prevTotalDays - i;
    calendarDays.push({
      day: prevDay,
      isCurrentMonth: false,
      date: new Date(year, month - 1, prevDay),
    });
  }

  for (let i = 1; i <= totalDays; i++) {
    calendarDays.push({
      day: i,
      isCurrentMonth: true,
      date: new Date(year, month, i),
    });
  }

  const totalSlots = 42;
  const nextMonthPadding = totalSlots - calendarDays.length;
  for (let i = 1; i <= nextMonthPadding; i++) {
    calendarDays.push({
      day: i,
      isCurrentMonth: false,
      date: new Date(year, month + 1, i),
    });
  }

  const selectedDateStr = formatDateString(selectedDate);
  const dayAppointments = appointments
    .filter((app) => app.fecha === selectedDateStr)
    .sort((a, b) => a.hora.localeCompare(b.hora));

  const getAppointmentCountForDate = (date: Date): number => {
    const str = formatDateString(date);
    return appointments.filter((app) => app.fecha === str).length;
  };

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCreateAppointment = async (newAppInput: AppointmentData) => {
    try {
      const created = await appointmentService.createAppointment(newAppInput);
      setAppointments((prev) => [...prev, created]);
      setIsModalOpen(false);

      const [y, m, d] = newAppInput.fecha.split('-').map(Number);
      const newDateObj = new Date(y, m - 1, d);
      setSelectedDate(newDateObj);
      setCurrentDate(new Date(y, m - 1, 1));

      showToast(`Turno agendado con éxito para ${newAppInput.pacienteNombre}`);
    } catch (err) {
      console.error('Error creating appointment in database:', err);
      throw err;
    }
  };

  const handleDeleteAppointment = async (id: string, name: string) => {
    try {
      await appointmentService.deleteAppointment(id);
      setAppointments((prev) => prev.filter((app) => app.id !== id));
      showToast(`Turno de ${name} cancelado correctamente.`);
    } catch (err) {
      console.error('Error deleting appointment in database:', err);
      showToast('No se pudo cancelar el turno en la base de datos.');
    }
  };

  return (
    <div className="flex flex-col gap-6 w-full max-w-[1200px] mx-auto pb-10">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-wide">Agenda y Calendario</h1>
          <p className="text-[var(--color-neutral-a60)] text-sm mt-1">
            Administración visual de turnos médicos y cirugías del Dr. Garone.
          </p>
        </div>

        <button
          onClick={handleOpenModal}
          className="flex items-center justify-center gap-2 px-6 py-2.5 rounded-[8px] bg-[linear-gradient(180deg,#FFE59C_15.87%,var(--color-dorado)_91.83%)] text-[var(--color-deepest)] font-bold hover:opacity-95 active:scale-98 transition-all border border-[var(--color-highlight)] text-nav-bar cursor-pointer shadow-md">
          <span className="material-symbols-outlined text-[18px] font-bold">add</span>
          <span>Agendar Turno</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 bg-[var(--color-box)] rounded-[12px] border border-[#4d4638] p-6 shadow-lg flex flex-col h-fit">
          <div className="flex items-center justify-between border-b border-[#4d4638]/40 pb-4 mb-6">
            <h2 className="text-lg font-bold text-white flex items-center gap-2 select-none">
              <span className="material-symbols-outlined text-[var(--color-dorado)]">
                calendar_month
              </span>
              <span>
                {months[month]} de {year}
              </span>
            </h2>
            <div className="flex gap-2">
              <button
                onClick={handlePrevMonth}
                className="w-8 h-8 rounded-full border border-[#4d4638]/60 flex items-center justify-center text-[var(--color-dorado)] hover:bg-[#2c2c2c]/40 active:scale-95 transition-all cursor-pointer">
                <span className="material-symbols-outlined text-[18px]">chevron_left</span>
              </button>
              <button
                onClick={handleNextMonth}
                className="w-8 h-8 rounded-full border border-[#4d4638]/60 flex items-center justify-center text-[var(--color-dorado)] hover:bg-[#2c2c2c]/40 active:scale-95 transition-all cursor-pointer">
                <span className="material-symbols-outlined text-[18px]">chevron_right</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-7 text-center mb-2">
            {weekDays.map((day, idx) => (
              <span
                key={idx}
                className="text-[11px] font-bold tracking-wider text-[var(--color-dorado)] uppercase py-1">
                {day}
              </span>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1.5">
            {calendarDays.map((slot, index) => {
              const isSelected =
                selectedDate.getDate() === slot.date.getDate() &&
                selectedDate.getMonth() === slot.date.getMonth() &&
                selectedDate.getFullYear() === slot.date.getFullYear();

              const appCount = getAppointmentCountForDate(slot.date);
              const isToday =
                new Date().getDate() === slot.date.getDate() &&
                new Date().getMonth() === slot.date.getMonth() &&
                new Date().getFullYear() === slot.date.getFullYear();

              return (
                <button
                  key={index}
                  onClick={() => {
                    setSelectedDate(slot.date);
                    if (!slot.isCurrentMonth) {
                      setCurrentDate(new Date(slot.date.getFullYear(), slot.date.getMonth(), 1));
                    }
                  }}
                  className={`aspect-square relative rounded-[8px] flex flex-col items-center justify-center cursor-pointer transition-all border ${
                    isSelected
                      ? 'bg-[linear-gradient(180deg,#FFE59C_15.87%,var(--color-dorado)_91.83%)] text-[var(--color-deepest)] border-[var(--color-highlight)] font-bold shadow-md'
                      : slot.isCurrentMonth
                        ? 'bg-[#121414]/30 border-[#4d4638]/20 hover:border-[var(--color-dorado)] hover:bg-[#2c2c2c]/20 text-[var(--color-blanco)]'
                        : 'bg-transparent border-transparent text-[#5d5d5d] hover:text-white/60 hover:bg-[#2c2c2c]/10'
                  }`}>
                  <span className="text-sm font-semibold">{slot.day}</span>

                  {isToday && !isSelected && (
                    <div className="absolute inset-1 rounded-[6px] border border-[var(--color-dorado)]/40 pointer-events-none" />
                  )}

                  {appCount > 0 && (
                    <div className="absolute bottom-1.5 flex gap-0.5 justify-center w-full">
                      {Array.from({ length: Math.min(appCount, 3) }).map((_, dotIdx) => (
                        <div
                          key={dotIdx}
                          className={`w-1 h-1 rounded-full ${
                            isSelected ? 'bg-[var(--color-deepest)]' : 'bg-[var(--color-dorado)]'
                          }`}
                        />
                      ))}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        <div className="lg:col-span-5 flex flex-col gap-6">
          <div className="bg-[var(--color-box)] rounded-[12px] border border-[#4d4638] p-6 shadow-lg flex flex-col h-full min-h-[480px]">
            <div className="flex flex-col gap-1 border-b border-[#4d4638]/40 pb-4">
              <span className="text-xs text-[var(--color-dorado)] font-semibold uppercase tracking-wider">
                {selectedDate.toLocaleDateString('es-AR', { weekday: 'long' })}
              </span>
              <div className="flex items-center justify-between mt-0.5">
                <h3 className="text-lg font-bold text-white">
                  {selectedDate.getDate()} de {months[selectedDate.getMonth()]}
                </h3>
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-[#121414] text-[var(--color-dorado)] border border-[#4d4638]/40">
                  {dayAppointments.length} {dayAppointments.length === 1 ? 'turno' : 'turnos'}
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-4 mt-6 overflow-y-auto max-h-[440px] pr-1 flex-1">
              {isLoading ? (
                <div className="flex flex-col gap-4 animate-pulse">
                  <div className="p-4 rounded-[10px] bg-[#121414]/30 border border-[#4d4638]/20 flex flex-col gap-3">
                    <div className="h-4 bg-zinc-800 rounded w-1/3"></div>
                    <div className="h-4 bg-zinc-800 rounded w-2/3"></div>
                    <div className="h-3 bg-zinc-800 rounded w-full"></div>
                  </div>
                  <div className="p-4 rounded-[10px] bg-[#121414]/30 border border-[#4d4638]/20 flex flex-col gap-3">
                    <div className="h-4 bg-zinc-800 rounded w-1/4"></div>
                    <div className="h-4 bg-zinc-800 rounded w-1/2"></div>
                    <div className="h-3 bg-zinc-800 rounded w-5/6"></div>
                  </div>
                </div>
              ) : (
                <>
                  {dayAppointments.map((app) => (
                    <div
                      key={app.id}
                      className="flex flex-col gap-3 p-4 rounded-[10px] bg-[#121414]/50 border border-[#4d4638]/30 hover:border-[#4d4638]/60 transition-all group relative">
                      <button
                        onClick={() => handleDeleteAppointment(app.id || '', app.pacienteNombre)}
                        className="absolute top-3 right-3 text-[#5d5d5d] hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-[#2c2c2c]/40 rounded cursor-pointer"
                        title="Cancelar Turno">
                        <span className="material-symbols-outlined text-[16px]">delete</span>
                      </button>

                      <div className="flex items-center gap-2 flex-wrap">
                        <div className="flex items-center gap-1.5 text-xs text-[var(--color-dorado)] font-semibold">
                          <span className="material-symbols-outlined text-[14px]">schedule</span>
                          <span>{app.hora} hs</span>
                        </div>

                        <span
                          className={`inline-block px-3 py-1 rounded-full text-[11px] font-medium tracking-wide text-white ${
                            typeStyles[app.tipo]
                          }`}>
                          {app.tipo}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-[18px] text-[var(--color-neutral-a60)]">
                          account_circle
                        </span>
                        <span className="text-sm font-semibold text-white">
                          {app.pacienteNombre}
                        </span>
                      </div>

                      <p className="text-xs text-[var(--color-blanco)]/80 leading-relaxed pl-1.5 border-l border-[#4d4638]/40">
                        {app.observacion}
                      </p>
                    </div>
                  ))}

                  {dayAppointments.length === 0 && (
                    <div className="flex flex-col items-center justify-center text-center py-16 flex-1">
                      <span className="material-symbols-outlined text-[44px] text-[#5d5d5d] mb-3 animate-pulse">
                        calendar_today
                      </span>
                      <h4 className="text-zinc-300 text-sm font-semibold mb-1">Agenda despejada</h4>
                      <p className="text-[var(--color-neutral-a60)] text-xs max-w-[240px] mb-6">
                        No hay turnos registrados para esta fecha en el sistema.
                      </p>
                      <button
                        onClick={handleOpenModal}
                        className="px-4 py-2 rounded-[6px] border border-[var(--color-dorado)] text-[var(--color-dorado)] text-xs font-semibold hover:bg-[#2c2c2c]/40 active:scale-98 transition-all cursor-pointer bg-transparent">
                        Agendar Primer Turno
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      <AgendarTurnoModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleCreateAppointment}
        defaultFecha={selectedDateStr}
      />

      {toastMessage && (
        <div className="fixed bottom-6 right-6 bg-[#1a1c1c] border border-[#4d4638]/60 rounded-[12px] p-4 shadow-[0_12px_40px_rgba(0,0,0,0.6)] z-50 flex items-center justify-between gap-6 max-w-[480px] animate-in slide-in-from-bottom-5 fade-in duration-300 select-none">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-[10px] bg-[#2d2516]/60 border border-[var(--color-dorado)]/30 flex items-center justify-center text-[var(--color-dorado)] flex-shrink-0">
              <span className="material-symbols-outlined text-[20px] font-bold">check</span>
            </div>
            <div className="flex flex-col">
              <span className="text-white text-sm font-semibold">Operación Exitosa</span>
              <span className="text-[var(--color-neutral-a60)] text-xs mt-0.5">{toastMessage}</span>
            </div>
          </div>
          <button
            onClick={() => setToastMessage(null)}
            className="text-[var(--color-neutral-a60)] hover:text-white transition-colors flex items-center justify-center p-0.5 rounded cursor-pointer">
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>
      )}
    </div>
  );
}
