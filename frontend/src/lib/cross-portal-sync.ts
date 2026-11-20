/**
 * LinqChain Real-Time Cross-Portal Event Synchronization Mesh
 * Utilizes standard BroadcastChannel across browser tabs/windows with
 * localStorage storage-event fallback for deterministic multi-window sync.
 */

export type CrossPortalEventType =
  | 'PO_ACKNOWLEDGED'
  | 'ASN_DISPATCHED'
  | 'DISRUPTION_REPORTED'
  | 'DISRUPTION_RESOLVED'
  | 'KANBAN_REPLENISH_TRIGGERED'
  | 'KANBAN_RESTOCKED'
  | 'INVENTORY_ADJUSTED'
  | 'USER_AUTH_UPDATED'
  | 'PING_TELEMETRY';

export interface CrossPortalEvent<T = any> {
  id: string;
  type: CrossPortalEventType;
  source_portal: 'OPERATOR' | 'SUPPLIER' | 'MANUFACTURER' | 'ADMIN';
  timestamp: string;
  payload: T;
}

const CHANNEL_NAME = 'linqchain_realtime_mesh';
const STORAGE_EVENT_KEY = 'linqchain_cross_portal_sync_event';

let broadcastChannel: BroadcastChannel | null = null;

function getBroadcastChannel(): BroadcastChannel | null {
  if (typeof window === 'undefined') return null;
  if (!broadcastChannel && typeof BroadcastChannel !== 'undefined') {
    try {
      broadcastChannel = new BroadcastChannel(CHANNEL_NAME);
    } catch (e) {
      console.warn('BroadcastChannel not supported in this environment, using localStorage fallback');
    }
  }
  return broadcastChannel;
}

/**
 * Broadcast an event across all active portal tabs and windows
 */
export function broadcastCrossPortalEvent<T>(
  type: CrossPortalEventType,
  source_portal: 'OPERATOR' | 'SUPPLIER' | 'MANUFACTURER' | 'ADMIN',
  payload: T
): CrossPortalEvent<T> {
  const event: CrossPortalEvent<T> = {
    id: `evt-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    type,
    source_portal,
    timestamp: new Date().toISOString(),
    payload,
  };

  const channel = getBroadcastChannel();
  if (channel) {
    try {
      channel.postMessage(event);
    } catch (e) {
      console.warn('BroadcastChannel postMessage failed:', e);
    }
  }

  // Also write to localStorage to trigger window.onstorage in other windows/tabs
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(STORAGE_EVENT_KEY, JSON.stringify(event));
    } catch (e) {
      console.warn('localStorage sync failed:', e);
    }
  }

  return event;
}

/**
 * Subscribe to cross-portal synchronization events
 */
export function subscribeToCrossPortalEvents(
  listener: (event: CrossPortalEvent) => void
): () => void {
  if (typeof window === 'undefined') return () => {};

  const channel = getBroadcastChannel();

  const handleChannelMessage = (msgEvent: MessageEvent) => {
    if (msgEvent.data && msgEvent.data.type) {
      listener(msgEvent.data as CrossPortalEvent);
    }
  };

  const handleStorageEvent = (e: StorageEvent) => {
    if (e.key === STORAGE_EVENT_KEY && e.newValue) {
      try {
        const parsed = JSON.parse(e.newValue);
        if (parsed && parsed.type) {
          listener(parsed as CrossPortalEvent);
        }
      } catch (err) {
        console.error('Error parsing cross portal event from storage:', err);
      }
    }
  };

  if (channel) {
    channel.addEventListener('message', handleChannelMessage);
  }
  window.addEventListener('storage', handleStorageEvent);

  return () => {
    if (channel) {
      channel.removeEventListener('message', handleChannelMessage);
    }
    window.removeEventListener('storage', handleStorageEvent);
  };
}
