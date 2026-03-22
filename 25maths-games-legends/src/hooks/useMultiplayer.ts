import { useState, useEffect } from 'react';
import { supabase } from '../supabase';
import type { Room, UserProfile } from '../types';
import type { User } from '@supabase/supabase-js';
import { handleSupabaseError } from '../utils/errors';

export function useMultiplayer(user: User | null, profile: UserProfile | null) {
  const [activeRoom, setActiveRoom] = useState<Room | null>(null);

  const createRoom = async (type: 'team' | 'pk', missionId: number) => {
    if (!user || !profile) return;
    const roomData = {
      type,
      mission_id: missionId,
      status: 'waiting',
      players: {
        [user.id]: {
          name: profile.display_name,
          score: 0,
          isReady: false,
          charId: profile.selected_char_id,
        }
      },
      host_id: user.id,
    };
    const { data, error } = await supabase.from('gl_rooms').insert(roomData).select().single();
    if (error) { handleSupabaseError(error, 'create', 'gl_rooms'); return; }
    setActiveRoom({ ...data, id: data.id, hostId: data.host_id, missionId: data.mission_id } as Room);
  };

  const joinRoom = async (roomId: string) => {
    if (!user || !profile) return;
    const { data: room, error: getErr } = await supabase.from('gl_rooms').select('*').eq('id', roomId).single();
    if (getErr) { handleSupabaseError(getErr, 'get', 'gl_rooms'); return; }

    const players = { ...room.players, [user.id]: { name: profile.display_name, score: 0, isReady: false, charId: profile.selected_char_id } };
    const { error } = await supabase.from('gl_rooms').update({ players }).eq('id', roomId);
    if (error) { handleSupabaseError(error, 'update', 'gl_rooms'); return; }
    setActiveRoom({ ...room, players, id: room.id, hostId: room.host_id, missionId: room.mission_id } as Room);
  };

  const toggleReady = async () => {
    if (!user || !activeRoom) return;
    const players = { ...activeRoom.players };
    players[user.id].isReady = !players[user.id].isReady;
    const { error } = await supabase.from('gl_rooms').update({ players }).eq('id', activeRoom.id);
    if (error) handleSupabaseError(error, 'update', 'gl_rooms');
    setActiveRoom({ ...activeRoom, players });
  };

  const startGame = async () => {
    if (!activeRoom) return;
    const { error } = await supabase.from('gl_rooms').update({ status: 'playing' }).eq('id', activeRoom.id);
    if (error) handleSupabaseError(error, 'update', 'gl_rooms');
    setActiveRoom({ ...activeRoom, status: 'playing' });
  };

  const leaveRoom = () => setActiveRoom(null);

  // Subscribe to room changes
  useEffect(() => {
    if (!activeRoom) return;
    const channel = supabase
      .channel(`room-${activeRoom.id}`)
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'gl_rooms', filter: `id=eq.${activeRoom.id}` },
        (payload) => {
          const d = payload.new as any;
          setActiveRoom({ ...d, id: d.id, hostId: d.host_id, missionId: d.mission_id } as Room);
        }
      )
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [activeRoom?.id]);

  return { activeRoom, createRoom, joinRoom, toggleReady, startGame, leaveRoom };
}
