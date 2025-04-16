import * as React from 'react';
import type { TrackReferenceOrPlaceholder } from '@livekit/components-core';
import { ParticipantTile } from './ParticipantTile';
import type { ParticipantClickEvent } from '@livekit/components-core';

/** @public */
export interface FocusLayoutContainerProps extends React.HTMLAttributes<HTMLDivElement> {}

/**
 * The `FocusLayoutContainer` is a layout component that expects two children:
 * A small side component: In a video conference, this is usually a carousel of participants
 * who are not in focus. And a larger main component to display the focused participant.
 * For example, with the `FocusLayout` component.
 *  @public
 */
/** @public */
export interface FocusLayoutProps extends React.HTMLAttributes<HTMLElement> {
  /** The track to display in the focus layout. */
  trackRef?: TrackReferenceOrPlaceholder;
  presenceData?: Record<string, any>;
  handleParticipantClick?: (event: ParticipantClickEvent) => void;

  onParticipantClick?: (evt: ParticipantClickEvent) => void;
}

/**
 * The `FocusLayout` component is just a light wrapper around the `ParticipantTile` to display a single participant.
 * @public
 */
export function FocusLayout({
  trackRef,
  handleParticipantClick,
  presenceData,
  ...htmlProps
}: FocusLayoutProps) {
  return (
    <ParticipantTile
      trackRef={trackRef}
      {...htmlProps}
      onParticipantClick={handleParticipantClick}
      presenceData={presenceData}
    />
  );
}
