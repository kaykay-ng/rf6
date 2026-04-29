import { Colors } from '@/constants/theme';
import { supabase } from '@/lib/supabase';
import { Stack } from 'expo-router';
import { createContext, ReactNode, useContext, useReducer } from 'react';

// ── Types ─────────────────────────────────────────────────────────────────────

export type EventDraft = {
  campId: string;         // camp.id (UUID)
  campAddress: string;    // camp.address (e.g. 'C5-3')
  name: string;
  description: string;
  dates: string[];        // ISO dates e.g. ['2026-06-28', '2026-06-29']
  time: string;           // 'HH:MM' e.g. '18:00'
  location_type: 'our_camp' | 'other';
  location_name: string;  // '' when our_camp
  max_capacity: string;   // raw string, parsed to int on submit
};

type Action =
  | { type: 'SET_FIELD'; field: Exclude<keyof EventDraft, 'dates'>; value: string }
  | { type: 'SET_DATES'; dates: string[] }
  | { type: 'RESET' };

const initialState: EventDraft = {
  campId: '',
  campAddress: '',
  name: '',
  description: '',
  dates: [],
  time: '',
  location_type: 'our_camp',
  location_name: '',
  max_capacity: '',
};

function reducer(state: EventDraft, action: Action): EventDraft {
  switch (action.type) {
    case 'SET_FIELD':
      return { ...state, [action.field]: action.value };
    case 'SET_DATES':
      return { ...state, dates: action.dates };
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
  submit: () => Promise<void>;
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
  const [data, dispatch] = useReducer(reducer, initialState);

  async function submit() {
    if (!data.campAddress) throw new Error('Camp not selected');
    if (data.dates.length === 0) throw new Error('At least one date required');

    const capacity = data.max_capacity ? parseInt(data.max_capacity, 10) : null;

    const events = data.dates.map((date) => ({
      name: data.name.trim(),
      date,
      time: data.time,
      location_type: data.location_type,
      location_name: data.location_type === 'other' ? data.location_name.trim() : null,
      host_camp_id: data.campAddress,
      description: data.description.trim() || null,
      max_capacity: capacity,
    }));

    const { error } = await supabase.from('events').insert(events);

    if (error) {
      console.error('Supabase insert error:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code,
      });
      throw new Error(error.message || 'Database error');
    }
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
          title: 'BOND',
          headerStyle: {
            backgroundColor: Colors.white,
          },
          headerTintColor: Colors.accent,
          headerTitleStyle: {
            fontFamily: 'Oswald_700Bold',
            fontSize: 16,
            color: Colors.text,
          },
        }}
      >
        <Stack.Screen name="select" options={{ title: 'SELECT YOUR CAMP' }} />
        <Stack.Screen name="pin" options={{ title: 'VERIFY CAMP PIN' }} />
        <Stack.Screen name="new" options={{ title: 'EVENT DETAILS' }} />
        <Stack.Screen name="when" options={{ title: 'WHEN & WHERE' }} />
        <Stack.Screen name="confirm" options={{ title: 'CONFIRM & SUBMIT' }} />
      </Stack>
    </EventDraftProvider>
  );
}
