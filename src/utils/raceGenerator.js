import { ACTIVITY_CATEGORIES, RACE_ELEMENT_TEMPLATES } from '../data/activityDatabase';

// Seeded random for consistent but varied results
function seededRandom(seed) {
  let s = seed;
  return function () {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

function shuffleArray(arr, rng) {
  const shuffled = [...arr];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

function pickRandom(arr, rng) {
  return arr[Math.floor(rng() * arr.length)];
}

function pickMultiple(arr, count, rng) {
  return shuffleArray(arr, rng).slice(0, Math.min(count, arr.length));
}

// Map intensity preference to activity intensity
function matchesIntensity(activityIntensity, preferredLevel) {
  const mapping = {
    relaxed: ['low'],
    moderate: ['low', 'medium'],
    active: ['medium', 'high'],
    extreme: ['high'],
  };
  return (mapping[preferredLevel] || ['low', 'medium', 'high']).includes(activityIntensity);
}

// Duration planning (in minutes)
const DURATION_MAP = {
  '2hrs': { total: 120, legs: 3, activitiesPerLeg: 1 },
  '3hrs': { total: 180, legs: 4, activitiesPerLeg: 1 },
  'half-day': { total: 300, legs: 5, activitiesPerLeg: 2 },
  'full-day': { total: 480, legs: 7, activitiesPerLeg: 2 },
};

function generateRaceName(honoree, eventType) {
  const suffixes = [
    'Amazing Adventure',
    'Epic Race',
    'Grand Challenge',
    'Ultimate Quest',
    'Great Expedition',
  ];
  const suffix = suffixes[Math.floor(Math.random() * suffixes.length)];

  if (eventType === 'birthday') {
    return `${honoree}'s Birthday ${suffix}`;
  }
  if (eventType === 'anniversary') {
    return `${honoree}'s Anniversary ${suffix}`;
  }
  if (eventType === 'graduation') {
    return `${honoree}'s Graduation ${suffix}`;
  }
  if (eventType === 'retirement') {
    return `${honoree}'s Retirement ${suffix}`;
  }
  return `${honoree}'s ${suffix}`;
}

function generateLegName(legIndex, totalLegs) {
  if (legIndex === 0) return 'Starting Line';
  if (legIndex === totalLegs - 1) return 'The Final Leg';
  const legNames = [
    'First Leg', 'Second Leg', 'Third Leg', 'Fourth Leg',
    'Fifth Leg', 'Sixth Leg', 'Seventh Leg',
  ];
  return legNames[legIndex] || `Leg ${legIndex + 1}`;
}

export function generateRace(formData) {
  const {
    zipCode,
    honoree,
    eventType,
    activityLevel,
    duration,
    specialIdeas,
  } = formData;

  // Create a seed from the zip code for consistent but varied results
  const seed = zipCode.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0) * 137;
  const rng = seededRandom(seed);

  const durationConfig = DURATION_MAP[duration] || DURATION_MAP['3hrs'];
  const { legs: numLegs } = durationConfig;

  // Select activity categories based on intensity
  const allActivities = [];
  Object.entries(ACTIVITY_CATEGORIES).forEach(([catKey, cat]) => {
    cat.activities
      .filter((a) => matchesIntensity(a.intensity, activityLevel))
      .forEach((a) => allActivities.push({ ...a, category: catKey, categoryLabel: cat.label, categoryIcon: cat.icon }));
  });

  const selectedActivities = pickMultiple(allActivities, numLegs * 2, rng);

  // Build race legs
  const legs = [];
  const raceElements = RACE_ELEMENT_TEMPLATES;

  for (let i = 0; i < numLegs; i++) {
    const leg = {
      legNumber: i + 1,
      name: generateLegName(i, numLegs),
      elements: [],
      estimatedDuration: Math.floor(durationConfig.total / numLegs),
    };

    // Opening clue for each leg
    leg.elements.push({
      type: 'clue',
      ...raceElements.clue,
      selectedTemplate: pickRandom(raceElements.clue.templates, rng),
      order: 0,
    });

    // Add the primary activity
    if (selectedActivities[i]) {
      leg.elements.push({
        type: 'activity',
        ...selectedActivities[i],
        order: 1,
      });
    }

    // Race elements distribution across legs
    if (i === 0) {
      // First leg: Roadblock to kick things off
      leg.elements.push({
        type: 'roadblock',
        ...raceElements.roadblock,
        selectedChallenge: pickRandom(raceElements.roadblock.challenges, rng),
        order: 2,
      });
    } else if (i === 1) {
      // Second leg: Detour (choice of two paths)
      const detourPair = pickRandom(raceElements.detour.pairs, rng);
      leg.elements.push({
        type: 'detour',
        ...raceElements.detour,
        selectedPair: detourPair,
        order: 2,
      });
    } else if (i === numLegs - 1) {
      // Final leg: Roadblock + Fork for dramatic finish
      leg.elements.push({
        type: 'roadblock',
        ...raceElements.roadblock,
        selectedChallenge: pickRandom(raceElements.roadblock.challenges, rng),
        order: 2,
      });
      leg.elements.push({
        type: 'forkInTheRoad',
        ...raceElements.forkInTheRoad,
        selectedFork: pickRandom(raceElements.forkInTheRoad.forks, rng),
        order: 3,
      });
    } else if (i % 2 === 0) {
      // Even legs: Detour
      const detourPair = pickRandom(raceElements.detour.pairs, rng);
      leg.elements.push({
        type: 'detour',
        ...raceElements.detour,
        selectedPair: detourPair,
        order: 2,
      });
      // Optional speed bump on some even legs
      if (rng() > 0.5) {
        leg.elements.push({
          type: 'speedBump',
          ...raceElements.speedBump,
          selectedBump: pickRandom(raceElements.speedBump.bumps, rng),
          order: 3,
          optional: true,
        });
      }
    } else {
      // Odd legs: Fork in the road
      leg.elements.push({
        type: 'forkInTheRoad',
        ...raceElements.forkInTheRoad,
        selectedFork: pickRandom(raceElements.forkInTheRoad.forks, rng),
        order: 2,
      });
      // Sometimes add a speed bump
      if (rng() > 0.6) {
        leg.elements.push({
          type: 'speedBump',
          ...raceElements.speedBump,
          selectedBump: pickRandom(raceElements.speedBump.bumps, rng),
          order: 3,
          optional: true,
        });
      }
    }

    // Second activity for half-day and full-day events
    if (durationConfig.activitiesPerLeg >= 2 && selectedActivities[numLegs + i]) {
      leg.elements.push({
        type: 'activity',
        ...selectedActivities[numLegs + i],
        order: leg.elements.length,
      });
    }

    // Every leg ends with a Pit Stop
    leg.elements.push({
      type: 'pitStop',
      ...raceElements.pitStop,
      selectedCelebration: pickRandom(raceElements.pitStop.celebrations, rng),
      order: 99,
    });

    // Sort elements by order
    leg.elements.sort((a, b) => a.order - b.order);
    legs.push(leg);
  }

  // Build special ideas integration
  const specialNotes = specialIdeas
    ? `Special Request: "${specialIdeas}" — We've woven this into the race experience!`
    : null;

  return {
    raceName: generateRaceName(honoree, eventType),
    honoree,
    eventType,
    zipCode,
    activityLevel,
    totalDuration: durationConfig.total,
    totalLegs: numLegs,
    legs,
    specialNotes,
    generatedAt: new Date().toISOString(),
    raceTagline: generateTagline(eventType, honoree),
  };
}

function generateTagline(eventType, honoree) {
  const taglines = {
    birthday: [
      `"The world is waiting... and so is ${honoree}'s cake!" 🎂`,
      `"Race around the city for the ultimate birthday celebration!"`,
      `"${honoree}, the race of your life starts NOW!"`,
    ],
    anniversary: [
      `"Celebrate your journey together with one more adventure!"`,
      `"Love is a marathon, not a sprint — but today, we sprint!"`,
      `"${honoree}'s love story continues with an epic race!"`,
    ],
    graduation: [
      `"You've graduated — now prove you're ready for the real world!"`,
      `"The tassel was worth the hassle. Now race!"`,
      `"${honoree}, your diploma is at the finish line!"`,
    ],
    retirement: [
      `"You're done working — but the adventure is just beginning!"`,
      `"${honoree}'s retirement race: No alarm clocks required!"`,
      `"Trade the office for the open road!"`,
    ],
    other: [
      `"Every celebration deserves an epic adventure!"`,
      `"${honoree}, your amazing race awaits!"`,
    ],
  };
  const options = taglines[eventType] || taglines.other;
  return options[Math.floor(Math.random() * options.length)];
}
