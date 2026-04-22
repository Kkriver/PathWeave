function splitValue(value) {
  return String(value || '')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)
}

function getTrackedStoryFieldValue(value) {
  if (value && typeof value === 'object' && 'value' in value) {
    return String(value.value || '').trim()
  }

  return String(value || '').trim()
}

function compactNarrative(value, maxLength = 220) {
  const text = String(value || '').trim()

  if (!text) {
    return ''
  }

  if (text.length <= maxLength) {
    return text
  }

  return `${text.slice(0, maxLength).trim()}...`
}

export function buildPathWeaveOutput(profile, selectedStories, shareConfig) {
  const selectedStoryIds = new Set(
    Array.isArray(shareConfig?.selectedStories) && shareConfig.selectedStories.length
      ? shareConfig.selectedStories
      : selectedStories.map((story) => story.id),
  )

  const visibleStories = selectedStories.filter((story) => {
    if (!story?.id || !selectedStoryIds.has(story.id)) {
      return false
    }

    return story.privacy !== 'Keep private for now'
  })

  const approvedTags = shareConfig.includeTags
    ? [...new Set(visibleStories.flatMap((story) => story.acceptedTags || []))]
    : []

  const pathways = {
    interests: splitValue(profile.interests),
    aspirations: splitValue(profile.aspirations),
    futureDirections: splitValue(profile.futurePathways),
  }

  const stories = visibleStories.map((story) => ({
    id: story.id,
    title: story.title,
    narrative: String(story.narrative || '').trim(),
    summary: compactNarrative(story.narrative, 150),
    location: story.location || '',
    involved: splitValue(getTrackedStoryFieldValue(story.involved) || profile.involvedPeople),
    benefited: splitValue(getTrackedStoryFieldValue(story.benefited) || profile.benefitedPeople),
    involvedSource: story.involved?.isInherited ? 'profile' : 'story',
    benefitedSource: story.benefited?.isInherited ? 'profile' : 'story',
    privacy: story.privacy,
    image: shareConfig.includeMedia ? story.image || '' : '',
    audio: shareConfig.includeMedia ? story.audio || '' : '',
    video: shareConfig.includeMedia ? story.video || '' : '',
    tags: shareConfig.includeTags ? story.acceptedTags || [] : [],
    contextSnapshot: story.contextSnapshot || profile.placeConnection || '',
    mediaLabel: shareConfig.includeMedia
      ? story.image
        ? 'Image'
        : story.audio
          ? 'Audio'
          : story.video
            ? 'Video'
            : ''
      : '',
  }))

  const media = stories
    .flatMap((story) => [
      story.image ? { type: 'Image', label: story.image, storyTitle: story.title } : null,
      story.audio ? { type: 'Audio', label: story.audio, storyTitle: story.title } : null,
      story.video ? { type: 'Video', label: story.video, storyTitle: story.title } : null,
    ])
    .filter(Boolean)

  return {
    name: profile.name || 'Your PathWeave',
    identityLine: profile.identityDescription || profile.identityLine || 'Narrative portfolio profile',
    placeConnection: profile.placeConnection || '',
    intro: String(profile.narrativeIntro || '').trim(),
    introSummary: compactNarrative(profile.narrativeIntro, 240),
    values: splitValue(profile.values),
    connections: {
      connectedWith: splitValue(profile.connectedWith),
      involved: splitValue(profile.involvedPeople),
      benefited: splitValue(profile.benefitedPeople),
      place: profile.placeConnection || '',
      community: profile.communityConnections || '',
      summary: compactNarrative(profile.communityConnections, 200),
    },
    pathways,
    pathwaysList: [...pathways.interests, ...pathways.aspirations, ...pathways.futureDirections],
    stories,
    media,
    tags: approvedTags,
    shareConfig: {
      selectedStories: [...selectedStoryIds],
      includeMedia: shareConfig.includeMedia,
      includeTags: shareConfig.includeTags,
    },
  }
}
