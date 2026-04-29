import { createContext, useContext, useReducer, ReactNode } from 'react';
import { Stack } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { useSession } from '@/context/session';
import { SHA256 } from 'expo-crypto';

// ── Types ─────────────────────────────────────────────────────────────────────

export type EventDraft = {
  name: string;
  description: string;
  date: string;           // ISO '2026-06-28'
  time: string;           // 'HH:MM' e.g. '18:00'
  location_type: 'our_camp' | 'other';
  location_name: string;  // '' when our_camp
  max_capacity: string;   // raw string, parsed to int on submit
};

type Action =
  | { type: 'SET_FIELD'; field: keyof EventDraft; value: string }
  | { type: 'RESET' };

const initialState: EventDraft = {
  name: '',
  description: '',
  date: '',
  time: '',
  location_type: 'our_camp',
  location_name: '',
  max_capacity: '',
};

function reducer(state: EventDraft, action: Action): EventDraft {
  switch (action.type) {
    case 'SET_FIELD':
      return { ...state, [action.field]: action.value };
    case 'RESET':
      return initialState;
    default:
      return state;
  }
}

// ── Context ────────────────────────────────────────────────────────────────────

type EventContextType = {
  data: EventDraft;
  dispatch: (action: Action) => void;
  submit: (pinHash: string) => Promise<void>;
};

const EventContext = createContext<EventContextType | undefined>(undefined);

export function useEventDraft() {
  const ctx = useContext(EventContext);
  if (!ctx) throw new Error('useEventDraft called outside EventDraftProvider');
  return ctx;
}

// ── Provider ───────────────────────────────────────────────────────────────────

type Props = { children: ReactNode };

function EventDraftProvider({ children }: Props) {
  const { session } = useSession();
  const [data, dispatch] = useReducer(reducer, initialState);

  async function submit(pinHash: string) {
    if (!session) throw new Error('Not logged in');

    const capacity = data.max_capacity ? parseInt(data.max_capacity, 10) : null;

    await supabase.from('events').insert({
      name: data.name.trim(),
      date: data.date,
      time: data.time,
      location_type: data.location_type,
      location_name: data.location_type === 'other' ? data.location_name.trim() : null,
      host_camp_id: session.address,
      description: data.description.trim() || null,
      max_capacity: capacity,
    });

    dispatch({ type: 'RESET' });
  }

  return (
    <EventContext.Provider value={{ data, dispatch, submit }}>
      {children}
    </EventContext.Provider>
  );
}

// ── Layout ─────────────────────────────────────────────────────────────────────

export default function EventsLayout() {
  return (
    <EventDraftProvider>
      <Stack
        screenOptions={{
          headerShown: true,
          title: 'Add Event',
        }}
      >
        <Stack.Screen name="new" options={{ title: 'Event Details' }} />
        <Stack.Screen name="when" options={{ title: 'When & Where' }} />
        <Stack.Screen name="confirm" options={{ title: 'Confirm & Submit' }} />
      </Stack>
    </EventDraftProvider>
  );
}
