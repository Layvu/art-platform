'use client';

import { CircleUserRound } from 'lucide-react';
import React from 'react';
import { useRouter } from 'next/navigation';

import { useAuthStore } from '@/services/store/auth/store';
import Link from 'next/link';
import { PAGES } from '@/config/public-pages.config';
export default function ProfileButton({ isActive, isRegistered }: { isActive: boolean, isRegistered: boolean }) {
  const router = useRouter();
  const logout = useAuthStore((state) => state.logout);
  const href = isRegistered ? PAGES.PROFILE : PAGES.LOGIN;
  const handleLogout = async () => {
      await logout();

      // Принудительно обновляем страницу, чтобы все компоненты перерисовались
      router.refresh();
  };

  // if (menuItem.name === 'Выход') {
  //     return (
  //         <button
  //             onClick={handleLogout}
  //             className={`${isActive ? 'text-red' : 'text-black'} hover:underline cursor-pointer`}
  //         >
  //             {menuItem.name}
  //         </button>
  //     );
  // }

    return (
      <Link href={href}>
        <div className='p-2 cursor-pointer'>
            <CircleUserRound strokeWidth={1.5} size={24} className={`${isActive && 'text-my-accent'}`} />
        </div>
     </Link>
    );
}
