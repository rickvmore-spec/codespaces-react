// Activity database organized by category
// In a production app, this would come from an API powered by location services
// For the prototype, we generate contextual activities based on user inputs

const ACTIVITY_CATEGORIES = {
  food: {
    label: 'Food & Dining',
    icon: '🍽️',
    activities: [
      { name: 'Local Food Tour', intensity: 'low', duration: 60, description: 'Explore the best local eateries and hidden gems in the area' },
      { name: 'Cooking Class Challenge', intensity: 'medium', duration: 90, description: 'Teams race to complete a dish under time pressure' },
      { name: 'Mystery Ingredient Cook-Off', intensity: 'medium', duration: 120, description: 'Each team gets a mystery basket and must create a dish' },
      { name: 'Street Food Scavenger Hunt', intensity: 'high', duration: 75, description: 'Navigate the city to find and sample specific street foods' },
      { name: 'Dessert Decorating Race', intensity: 'low', duration: 45, description: 'Speed-decorate cakes or pastries with a birthday twist' },
      { name: 'Food Truck Rally', intensity: 'medium', duration: 60, description: 'Race between food trucks collecting stamps and samples' },
    ],
  },
  outdoor: {
    label: 'Outdoor Adventures',
    icon: '🏔️',
    activities: [
      { name: 'City Park Orienteering', intensity: 'medium', duration: 60, description: 'Navigate through the park using only a map and compass' },
      { name: 'Urban Kayaking', intensity: 'high', duration: 90, description: 'Paddle through local waterways hitting checkpoint buoys' },
      { name: 'Geocache Treasure Hunt', intensity: 'medium', duration: 75, description: 'Use GPS to find hidden caches planted around the area' },
      { name: 'Bike Rally Challenge', intensity: 'high', duration: 90, description: 'Cycle between checkpoints completing challenges at each' },
      { name: 'Nature Photography Race', intensity: 'low', duration: 60, description: 'Find and photograph specific natural landmarks and wildlife' },
      { name: 'Hiking Checkpoint Challenge', intensity: 'high', duration: 120, description: 'Hit trail checkpoints and solve riddles at each one' },
    ],
  },
  cultural: {
    label: 'Arts & Culture',
    icon: '🎭',
    activities: [
      { name: 'Museum Scavenger Hunt', intensity: 'low', duration: 60, description: 'Race through exhibits to find specific artifacts and answer trivia' },
      { name: 'Street Art Photo Challenge', intensity: 'medium', duration: 75, description: 'Find and photograph murals and street art from a clue list' },
      { name: 'Historical Landmark Rally', intensity: 'medium', duration: 90, description: 'Visit historical sites and solve history-based puzzles' },
      { name: 'Live Performance Trivia', intensity: 'low', duration: 45, description: 'Attend a local show and answer trivia about the performance' },
      { name: 'Architecture Scavenger Hunt', intensity: 'medium', duration: 60, description: 'Identify buildings from close-up photos and architectural clues' },
      { name: 'Local Legend Quest', intensity: 'medium', duration: 90, description: 'Follow clues based on local folklore and legends' },
    ],
  },
  entertainment: {
    label: 'Entertainment & Games',
    icon: '🎮',
    activities: [
      { name: 'Escape Room Race', intensity: 'medium', duration: 60, description: 'Teams compete to escape themed rooms in the fastest time' },
      { name: 'Bowling Showdown', intensity: 'low', duration: 45, description: 'Bowl-off with trick shot challenges mixed in' },
      { name: 'Arcade Point Battle', intensity: 'low', duration: 30, description: 'Compete for the highest scores across classic arcade games' },
      { name: 'Karaoke Challenge', intensity: 'low', duration: 45, description: 'Perform assigned songs and get judged by the birthday crew' },
      { name: 'Mini Golf Tournament', intensity: 'low', duration: 60, description: 'Putt your way through with bonus challenges at select holes' },
      { name: 'Go-Kart Grand Prix', intensity: 'high', duration: 45, description: 'Multiple heat races with a championship final' },
    ],
  },
  wellness: {
    label: 'Wellness & Relaxation',
    icon: '🧘',
    activities: [
      { name: 'Yoga in the Park', intensity: 'low', duration: 45, description: 'Group yoga session at a scenic park location' },
      { name: 'Spa Relay Race', intensity: 'low', duration: 60, description: 'Teams rotate through spa stations completing relaxation challenges' },
      { name: 'Meditation Scavenger Hunt', intensity: 'low', duration: 45, description: 'Find peaceful spots and complete mindfulness exercises' },
      { name: 'Dance Fitness Challenge', intensity: 'high', duration: 60, description: 'Learn a choreographed routine and perform it' },
      { name: 'Sound Bath Experience', intensity: 'low', duration: 30, description: 'Relax with healing sounds between race legs' },
      { name: 'Beach/Pool Relay', intensity: 'medium', duration: 60, description: 'Water-based relay races with fun pool challenges' },
    ],
  },
  adventure: {
    label: 'Thrill & Adventure',
    icon: '⚡',
    activities: [
      { name: 'Indoor Rock Climbing Race', intensity: 'high', duration: 60, description: 'Scale walls competing for the best time' },
      { name: 'Laser Tag Battle', intensity: 'high', duration: 45, description: 'Team-based laser tag with Amazing Race twists' },
      { name: 'Trampoline Park Challenge', intensity: 'high', duration: 60, description: 'Compete in aerial obstacle courses and trick competitions' },
      { name: 'Zip Line Adventure', intensity: 'high', duration: 45, description: 'Soar between checkpoints on zip lines' },
      { name: 'Paintball Capture the Flag', intensity: 'high', duration: 90, description: 'Tactical team challenge to capture the route marker' },
      { name: 'Obstacle Course Race', intensity: 'high', duration: 60, description: 'Tackle a military-style course as a team' },
    ],
  },
};

const RACE_ELEMENT_TEMPLATES = {
  roadblock: {
    label: 'ROADBLOCK',
    icon: '🚧',
    tagline: '"Who\'s ready to go the distance?"',
    description: 'Only ONE team member can complete this challenge!',
    color: '#FF4136',
    challenges: [
      'Memorize and recite a custom birthday poem with zero mistakes',
      'Solve a jigsaw puzzle made from a photo of the guest of honor',
      'Complete a timed physical challenge (e.g., 20 pushups, 10 burpees)',
      'Eat a local delicacy or unusual food item without making a face',
      'Navigate blindfolded through an obstacle course guided by your partner',
      'Build a card tower at least 3 levels high',
      'Learn and perform a 30-second dance routine',
      'Identify 10 songs from just 2-second clips',
      'Stack 15 cups in a pyramid and unstack them under 60 seconds',
      'Transfer water between containers using only a sponge',
    ],
  },
  detour: {
    label: 'DETOUR',
    icon: '🔀',
    tagline: '"Choose your path wisely!"',
    description: 'Teams must choose between TWO different challenges.',
    color: '#FFDC00',
    pairs: [
      { optionA: { name: 'Brains', task: 'Solve a series of riddles and brain teasers' }, optionB: { name: 'Brawn', task: 'Complete a physical endurance challenge' } },
      { optionA: { name: 'Create', task: 'Build or craft something from provided materials' }, optionB: { name: 'Navigate', task: 'Follow a complex set of directions to a location' } },
      { optionA: { name: 'Taste', task: 'Identify mystery ingredients in a blindfold taste test' }, optionB: { name: 'Hustle', task: 'Collect items from multiple vendors in a market' } },
      { optionA: { name: 'Sing It', task: 'Perform a karaoke duet and score above 80%' }, optionB: { name: 'Sling It', task: 'Hit targets in a throwing/shooting accuracy challenge' } },
      { optionA: { name: 'Piece It', task: 'Assemble a complex puzzle or model' }, optionB: { name: 'Peace It', task: 'Teach a yoga pose sequence to a stranger' } },
      { optionA: { name: 'High Road', task: 'Complete an elevated challenge (climbing, zip line, etc.)' }, optionB: { name: 'Low Road', task: 'Complete an underground or water-based challenge' } },
    ],
  },
  speedBump: {
    label: 'SPEED BUMP',
    icon: '⏱️',
    tagline: '"A little setback before you can proceed!"',
    description: 'An extra mini-challenge that must be completed before continuing.',
    color: '#FF851B',
    bumps: [
      'Take a group selfie with a stranger wearing a specific color',
      'Find and bring back a specific item from a nearby store',
      'Do 25 jumping jacks while singing Happy Birthday',
      'Get 5 strangers to sign a birthday card',
      'Balance an egg on a spoon for 30 seconds',
      'Recite the alphabet backwards in under 30 seconds',
      'Do your best impression of the birthday person for 30 seconds',
      'Find someone with the same birthday month and take a photo together',
    ],
  },
  forkInTheRoad: {
    label: 'FORK IN THE ROAD',
    icon: '🍴',
    tagline: '"Two paths diverge... choose carefully!"',
    description: 'Pick one of two routes — each leads to a different experience!',
    color: '#B10DC9',
    forks: [
      { pathA: 'Scenic Route — longer but more relaxed with beautiful views', pathB: 'Express Route — shorter but more intense challenges' },
      { pathA: 'Foodie Trail — activities centered around local cuisine', pathB: 'Culture Trail — activities centered around arts and history' },
      { pathA: 'Solo Sprint — individual time trials at each stop', pathB: 'Team Relay — collaborative challenges requiring everyone' },
      { pathA: 'Mystery Path — unknown challenges revealed on arrival', pathB: 'Known Path — challenges are revealed upfront' },
    ],
  },
  clue: {
    label: 'CLUE',
    icon: '📬',
    tagline: '"Tear open the clue envelope!"',
    description: 'A clue that leads teams to their next destination.',
    color: '#0074D9',
    templates: [
      'Head to where {landmark} meets {street} — your next challenge awaits at the {adjective} {place}',
      'Find the place where locals go to {activity}. Look for the {color} {object} — your clue is hidden nearby',
      'Travel {direction} until you reach {landmark}. Ask for {name} and they will give you your next instructions',
      'Decode this: {cipher}. The answer is your next destination!',
      'Follow the {color} markers for 3 blocks. Your pit stop is where the markers end',
      'Take a photo in front of {landmark} and show it to the checkpoint host to receive your next clue',
    ],
  },
  pitStop: {
    label: 'PIT STOP',
    icon: '🏁',
    tagline: '"You are team number ___!"',
    description: 'The end of this leg! Check in with the host.',
    color: '#2ECC40',
    celebrations: [
      'Teams are greeted with a signature drink and celebration moment',
      'The host reveals the next leg\'s theme with a dramatic envelope opening',
      'Quick group photo with a themed backdrop before the next leg begins',
      'Teams receive a small commemorative token for completing this leg',
      'The fastest team gets a 2-minute head start on the next leg',
    ],
  },
};

// Location-aware activity suggestions based on common city features
const LOCATION_THEMES = {
  urban: {
    prefix: 'Downtown',
    venues: ['rooftop bars', 'food halls', 'museums', 'escape rooms', 'bowling alleys', 'arcades', 'theaters'],
    transport: ['walking', 'rideshare', 'subway', 'scooter'],
  },
  suburban: {
    prefix: 'Local',
    venues: ['parks', 'shopping centers', 'restaurants', 'recreation centers', 'movie theaters', 'mini golf courses'],
    transport: ['driving', 'biking', 'walking'],
  },
  coastal: {
    prefix: 'Beachside',
    venues: ['boardwalks', 'marinas', 'seafood shacks', 'surf shops', 'piers', 'beach parks'],
    transport: ['walking', 'biking', 'boat'],
  },
};

export { ACTIVITY_CATEGORIES, RACE_ELEMENT_TEMPLATES, LOCATION_THEMES };
