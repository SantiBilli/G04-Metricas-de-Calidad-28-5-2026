const mockPatients = [
  {
    id: 1,
    name: "Elena Pardo Sánchez",
    event: "Rinoplastia",
    time: "Mañana, 08:30 AM",
    status: "Cirugía Próxima",
  },
  {
    id: 2,
    name: "Elena Pardo Sánchez",
    event: "Rinoplastia",
    time: "Mañana, 08:30 AM",
    status: "Cirugía Próxima",
  },
  {
    id: 3,
    name: "Elena Pardo Sánchez",
    event: "Rinoplastia",
    time: "Mañana, 08:30 AM",
    status: "Cirugía Próxima",
  },
];

export default function PatientList() {
  return (
    <div className="flex flex-col gap-2 w-full">
      <div className="grid grid-cols-3 px-6 py-4 bg-[var(--color-box)] rounded-[12px] border border-[#4D4638]">
        <span className="font-semibold text-white">Paciente</span>
        <span className="font-semibold text-white">Próximo Evento</span>
        <span className="font-semibold text-white">Estado</span>
      </div>

      {mockPatients.map((patient) => (
        <div
          key={patient.id}
          className="grid grid-cols-3 items-center px-6 py-4 bg-[var(--color-box)] rounded-[12px] border border-[#4D4638]"
        >
          <span className="text-[var(--color-blanco)] font-medium">
            {patient.name}
          </span>

          <div className="flex flex-col">
            <span className="text-[var(--color-blanco)] font-medium">
              {patient.event}
            </span>
            <span className="text-[var(--color-neutral-a60)] text-sm">
              {patient.time}
            </span>
          </div>

          <div>
            <span className="inline-block px-4 py-1.5 rounded-full bg-[#5d4a1f] text-[var(--color-highlight)] text-sm font-semibold">
              {patient.status}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
