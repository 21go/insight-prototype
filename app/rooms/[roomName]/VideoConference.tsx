import {
  useRoomContext,
  useCreateLayoutContext,
  usePinnedTracks,
  useTracks,
} from '@livekit/components-react';
import {
  CarouselLayout,
  ConnectionStateToast,
  FocusLayoutContainer,
  GridLayout,
  LayoutContextProvider,
  RoomAudioRenderer,
  Chat,
  ControlBar,
} from '@livekit/components-react';
import {
  TrackReferenceOrPlaceholder,
  WidgetState,
  isEqualTrackRef,
  isTrackReference,
  ParticipantClickEvent,
  isWeb,
} from '@livekit/components-core';
import { RemoteTrackPublication, RoomEvent, Track } from 'livekit-client';
import type { MessageFormatter } from '@livekit/components-react';
import * as React from 'react';
import '@livekit/components-styles';
import { ParticipantTile } from '@/app/components/ParticipantTile';
import { FocusLayout } from '@/app/components/FocusLayout';
const STUDY_APP_URL = 'https://readily-helped-roughy.ngrok-free.app';

export interface VideoConferenceProps extends React.HTMLAttributes<HTMLDivElement> {
  chatMessageFormatter?: MessageFormatter;
  SettingsComponent?: React.ComponentType;
}

type PresenceInfo = {
  url: string;
  favicon: string;
  timestamp: number;
};

export function VideoConference({
  chatMessageFormatter,
  SettingsComponent,
  ...props
}: VideoConferenceProps) {
  const [widgetState, setWidgetState] = React.useState<WidgetState>({
    showChat: false,
    unreadMessages: 0,
    showSettings: false,
  });
  const [showScreenShareModal, setShowScreenShareModal] = React.useState(true);
  const [screenShareAllowed, setScreenShareAllowed] = React.useState<Set<string>>(new Set());

  const lastAutoFocusedScreenShareTrack = React.useRef<TrackReferenceOrPlaceholder | null>(null);
  const layoutContext = useCreateLayoutContext();
  const room = useRoomContext();
  const [presenceData, setPresenceData] = React.useState<Record<string, PresenceInfo>>({});

  const allTracks = useTracks(
    [
      { source: Track.Source.Camera, withPlaceholder: true },
      { source: Track.Source.ScreenShare, withPlaceholder: false },
    ],
    { updateOnlyOn: [RoomEvent.ActiveSpeakersChanged], onlySubscribed: false },
  );

  // Filter to hide screen share tracks unless participant has been clicked
  const tracks = allTracks.filter((track) => {
    if (!isTrackReference(track)) return false;

    if (track.source === Track.Source.ScreenShare) {
      return screenShareAllowed.has(track.participant.identity);
    }

    return true;
  });
  // const tracks = allTracks.filter((track) => {
  //   // Allow camera placeholders
  //   if (track.source === Track.Source.Camera) return true;

  //   // Only show screen shares if allowed
  //   if (track.source === Track.Source.ScreenShare && isTrackReference(track)) {
  //     return screenShareAllowed.has(track.participant.identity);
  //   }

  //   return false;
  // });

  React.useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const res = await fetch('/api/presence');
        if (!res.ok) {
          console.warn('Failed to fetch presence');
          return;
        }

        const data: Record<string, PresenceInfo> = await res.json();
        console.log('[VideoConference] Presence data:', data);
        setPresenceData(data);
      } catch (err) {
        console.error('Error fetching presence data:', err);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const screenShareTracks = tracks
    .filter(isTrackReference)
    .filter((track) => track.publication.source === Track.Source.ScreenShare);

  const focusTrack = usePinnedTracks(layoutContext)?.[0];
  const carouselTracks = tracks.filter((track) => !isEqualTrackRef(track, focusTrack));

  const widgetUpdate = (state: WidgetState) => {
    setWidgetState(state);
  };

  const handleStartScreenShare = async () => {
    try {
      await room.localParticipant.setScreenShareEnabled(true);
      setShowScreenShareModal(false);
      console.log('Screen share started');
    } catch (err) {
      console.error('User denied screen share or an error occurred:', err);
    }
  };

  React.useEffect(() => {
    // If screen share tracks are published, and no pin is set explicitly, auto set the screen share.
    if (
      screenShareTracks.some((track) => track.publication.isSubscribed) &&
      lastAutoFocusedScreenShareTrack.current === null
    ) {
      layoutContext.pin.dispatch?.({ msg: 'set_pin', trackReference: screenShareTracks[0] });
      lastAutoFocusedScreenShareTrack.current = screenShareTracks[0];
    } else if (
      lastAutoFocusedScreenShareTrack.current &&
      !screenShareTracks.some(
        (track) =>
          track.publication.trackSid ===
          lastAutoFocusedScreenShareTrack.current?.publication?.trackSid,
      )
    ) {
      layoutContext.pin.dispatch?.({ msg: 'clear_pin' });
      lastAutoFocusedScreenShareTrack.current = null;
    }
    if (focusTrack && !isTrackReference(focusTrack)) {
      const updatedFocusTrack = tracks.find(
        (tr) =>
          tr.participant.identity === focusTrack.participant.identity &&
          tr.source === focusTrack.source,
      );
      if (updatedFocusTrack !== focusTrack && isTrackReference(updatedFocusTrack)) {
        layoutContext.pin.dispatch?.({ msg: 'set_pin', trackReference: updatedFocusTrack });
      }
    }
  }, [
    screenShareTracks
      .map((ref) => `${ref.publication.trackSid}_${ref.publication.isSubscribed}`)
      .join(),
    focusTrack?.publication?.trackSid,
    tracks,
  ]);

  const clickTimeoutRef = React.useRef<{ [identity: string]: NodeJS.Timeout }>({});
  const lastClickTimeRef = React.useRef<{ [identity: string]: number }>({});
  const handleParticipantClick = (event: ParticipantClickEvent) => {
    const { participant, track } = event;
    const identity = participant.identity;
    const now = Date.now();

    const lastClick = lastClickTimeRef.current[identity] || 0;
    const timeSinceLastClick = now - lastClick;

    const isScreenShareTile = track?.source === Track.Source.ScreenShare;

    if (timeSinceLastClick < 300) {
      if (isScreenShareTile) {
        // 🔄 Toggle unsubscribe and hide tile
        if (track && track.isSubscribed && 'setSubscribed' in track) {
          (track as RemoteTrackPublication).setSubscribed(false);
          setScreenShareAllowed((prev) => {
            const updated = new Set(prev);
            updated.delete(identity);
            return updated;
          });
          console.log(`Unsubscribed and removed ${identity}'s screen share tile`);
        }
      } else {
        // 🎯 Subscribe and show screen share
        setScreenShareAllowed((prev) => new Set(prev).add(identity));

        participant.trackPublications.forEach((pub) => {
          if (
            pub.source === Track.Source.ScreenShare &&
            !pub.isSubscribed &&
            'setSubscribed' in pub
          ) {
            (pub as RemoteTrackPublication).setSubscribed(true);
            console.log(`Subscribed to ${identity}'s screen share`);
          }
        });
      }

      // 🧹 Clear click tracking
      if (clickTimeoutRef.current[identity]) {
        clearTimeout(clickTimeoutRef.current[identity]);
        delete clickTimeoutRef.current[identity];
      }
      lastClickTimeRef.current[identity] = 0;
    } else {
      // ⏱️ First click — set timer
      lastClickTimeRef.current[identity] = now;
      if (clickTimeoutRef.current[identity]) {
        clearTimeout(clickTimeoutRef.current[identity]);
      }
      clickTimeoutRef.current[identity] = setTimeout(() => {
        delete lastClickTimeRef.current[identity];
        delete clickTimeoutRef.current[identity];
      }, 300);
    }
  };

  return (
    <div className="lk-video-conference" {...props}>
      {isWeb() && (
        <LayoutContextProvider value={layoutContext} onWidgetChange={widgetUpdate}>
          {showScreenShareModal ? (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
              <div className="bg-white rounded-lg shadow-xl p-6 max-w-sm text-center">
                <h2 className="text-xl font-semibold mb-4">Screen Sharing Required</h2>
                <p className="text-gray-700 mb-6">
                  For this study, we require you to share your screen. Please click below and select
                  &quot;Entire Screen&quot; to begin.
                </p>
                <button
                  onClick={handleStartScreenShare}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2 px-4 rounded transition"
                >
                  Start Screen Share
                </button>
              </div>
            </div>
          ) : (
            <div className="lk-video-conference-inner">
              {!focusTrack ? (
                <div className="lk-grid-layout-wrapper">
                  <GridLayout tracks={tracks}>
                    <ParticipantTile
                      onParticipantClick={handleParticipantClick}
                      presenceData={presenceData}
                    />
                  </GridLayout>
                </div>
              ) : (
                <div className="lk-focus-layout-wrapper">
                  <FocusLayoutContainer>
                    <CarouselLayout tracks={carouselTracks}>
                      <ParticipantTile
                        onParticipantClick={handleParticipantClick}
                        presenceData={presenceData}
                      />
                    </CarouselLayout>
                    {focusTrack && (
                      <FocusLayout
                        trackRef={focusTrack}
                        onParticipantClick={handleParticipantClick}
                        presenceData={presenceData}
                      />
                    )}
                  </FocusLayoutContainer>
                </div>
              )}
              <ControlBar controls={{ chat: true, settings: !!SettingsComponent }} />
            </div>
          )}
          <Chat
            style={{ display: widgetState.showChat ? 'grid' : 'none' }}
            messageFormatter={chatMessageFormatter}
          />
          {SettingsComponent && (
            <div
              className="lk-settings-menu-modal"
              style={{ display: widgetState.showSettings ? 'block' : 'none' }}
            >
              <SettingsComponent />
            </div>
          )}
        </LayoutContextProvider>
      )}
      <RoomAudioRenderer />
      <ConnectionStateToast />
    </div>
  );
}
