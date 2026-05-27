'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import PrimaryButton from './PrimaryButton';
import { authService } from '@/services/authService';
import { UserProfile } from '@/types';
import EditProfileModal from './dashboard/EditProfileModal';

export default function Header() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function loadProfile() {
      try {
        const session = await authService.getSession();
        if (session?.user) {
          const userProfile = await authService.getProfile(session.user.id);
          console.log(userProfile);
          setProfile(userProfile);
        }
      } catch (err) {
        console.error('Error loading header profile:', err);
      }
    }
    loadProfile();
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLogout = async () => {
    setIsOpen(false);
    try {
      await authService.signOut();
      router.push('/auth/login');
    } catch (err) {
      console.error('Error logging out:', err);
      router.push('/auth/login');
    }
  };

  return (
    <header className="flex items-center justify-between px-8 py-5 bg-transparent border-b border-[var(--color-neutral-a80)]">
      <div className="flex-1 w-full">
        <div className="relative flex items-center">
          <span className="material-symbols-outlined absolute left-4 text-[#5d5d5d] text-[20px]">
            search
          </span>
          <input
            type="text"
            placeholder="Buscar..."
            className="w-full bg-[#121212] border border-[var(--color-neutral-a80)] rounded-[8px] py-2.5 pl-12 pr-4 text-[var(--color-blanco)] placeholder-[#5d5d5d] focus:outline-none focus:border-[var(--color-highlight)] transition-all"
          />
        </div>
      </div>

      <div className="flex items-center gap-8 ml-4">
        <PrimaryButton icon="add" text="Agregar Paciente" href="/dashboard/pacientes/nuevo" />

        <div className="w-[1px] h-10 bg-[var(--color-neutral-a80)]"></div>

        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="flex items-center gap-4 cursor-pointer focus:outline-none group select-none">
            <div className="flex flex-col items-end">
              <span className="text-[var(--color-blanco)] font-medium text-[15px] leading-tight group-hover:text-[var(--color-dorado)] transition-colors">
                {profile ? `${profile.name} ${profile.surname}` : 'Cargando...'}
              </span>
              <span className="text-[var(--color-neutral-a60)] text-[13px] max-w-[150px] truncate">
                {profile
                  ? profile.email === 'garone@upbrands.agency'
                    ? 'Cirujano Plástico'
                    : profile.email
                  : 'Cargando...'}
              </span>
            </div>
            <div className="relative w-11 h-11 rounded-[8px] overflow-hidden border border-[var(--color-neutral-a80)] group-hover:border-[var(--color-dorado)] transition-all shadow-sm flex items-center justify-center bg-[#231f20]/60">
              {profile?.pfp_url ? (
                <Image
                  src={profile.pfp_url}
                  alt="Perfil Dr. Garone"
                  fill
                  className="object-cover"
                  unoptimized={profile.pfp_url.startsWith('blob:') || false}
                />
              ) : (
                <span className="material-symbols-outlined text-[var(--color-dorado)] text-[22px]">
                  person
                </span>
              )}
            </div>
          </button>

          {isOpen && (
            <div className="absolute right-0 mt-3 w-48 bg-[#1a1c1c] border border-[#4d4638]/40 rounded-[12px] shadow-[0_8px_24px_rgba(0,0,0,0.6)] z-50 py-2 animate-in fade-in slide-in-from-top-2 duration-150">
              <button
                onClick={() => {
                  setIsOpen(false);
                  setIsEditModalOpen(true);
                }}
                className="w-full flex items-center gap-2.5 px-4 py-2.5 text-white hover:bg-[#2c2c2c]/40 transition-colors text-sm font-medium text-left cursor-pointer border-b border-[#4d4638]/20 pb-2.5 mb-1">
                <span className="material-symbols-outlined text-[18px] text-[var(--color-dorado)]">
                  manage_accounts
                </span>
                <span>Editar Perfil</span>
              </button>

              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2.5 px-4 py-2.5 text-[var(--color-dorado)] hover:text-white hover:bg-[#2c2c2c]/40 transition-colors text-sm font-medium text-left cursor-pointer">
                <span className="material-symbols-outlined text-[18px]">logout</span>
                <span>Cerrar sesión</span>
              </button>
            </div>
          )}
        </div>
      </div>

      <EditProfileModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        profile={profile}
        onSaveSuccess={(updatedProfile) => setProfile(updatedProfile)}
      />
    </header>
  );
}
