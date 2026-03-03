export type Skit = {
  narrative: string;
  scenes: [string, string, string, string];
};

export type CinematicStyle = {
  id: string;
  label: string;
  icon: string;
  description: string;
  visualKeywords: string[];
  moodKeywords: string[];
  subjects: string[];
  locations: string[];
  actions: string[];
  skits: Skit[];
  tags: string[];
};

export const STYLES: CinematicStyle[] = [
  {
    id: "70s-gritty",
    label: "70s Mean Streets",
    icon: "🎞️",
    description: "Scorsese's Little Italy. 16mm blown to 35mm, body-mounted Éclair NPR, raw grain, no permits.",
    visualKeywords: ["16mm blown up to 35mm grain", "Éclair NPR handheld", "available light only", "body-mounted POV camera", "whip pans and jump cuts", "slow motion at variable frame rates", "red neon bar glow on faces", "Kodak reversal stock color shift"],
    moodKeywords: ["paranoid", "desperate", "volatile", "drunken disorientation", "street-level tension", "Catholic guilt"],
    subjects: ["a small-time hustler", "a debt collector with a conscience", "a loose cannon in a Hawaiian shirt", "a bookie's runner", "a girl from the neighborhood"],
    locations: ["a Little Italy social club at midnight", "a cramped back-room card game", "a Mulberry Street tenement stairwell", "a neon-lit dive bar with a jukebox", "a rooftop above a feast-day procession"],
    actions: ["stumbles through a bar in slow motion to the Stones", "smashes a pool cue across a table", "counts cash under a bare red bulb", "drags a friend bleeding through a back alley", "stares down a debt he can't collect"],
    skits: [
      {
        narrative: "Man walks into a bar. Jukebox plays. Camera strapped to his chest. Room tilts.",
        scenes: [
          "Cinematic still frame, 16mm blown up to 35mm grain, body-mounted POV camera, a small-time hustler pushes open a dive bar door, red neon spills across his face, paranoid atmosphere",
          "Cinematic still frame, Éclair NPR handheld, a jukebox glowing amber in a dark bar corner, Kodak reversal stock color shift, drunken disorientation atmosphere",
          "Cinematic still frame, body-mounted POV camera, the room tilts and blurs, red neon bar glow on faces, whip pans and jump cuts, volatile atmosphere",
          "Cinematic still frame, 16mm grain, the hustler leans on the bar alone, available light only, bare red bulb overhead, Catholic guilt atmosphere"
        ],
      },
      {
        narrative: "Two guys argue over a card game. One flips the table. Nobody flinches.",
        scenes: [
          "Cinematic still frame, Éclair NPR handheld, two men hunched over cards in a cramped back-room, smoke curling under a bare bulb, street-level tension atmosphere",
          "Cinematic still frame, 16mm blown up to 35mm grain, close-up of a fist slamming the card table, chips scatter, desperate atmosphere",
          "Cinematic still frame, available light only, the table flips in slow motion, cards and cash in mid-air, volatile atmosphere",
          "Cinematic still frame, whip pans, the room freezes, nobody flinches, a man lights a cigarette, paranoid atmosphere"
        ],
      },
      {
        narrative: "Girl waits on a tenement stoop. He walks past. She doesn't call out. He doesn't look back.",
        scenes: [
          "Cinematic still frame, Kodak reversal stock, a girl in a summer dress sits on a Mulberry Street tenement stoop at dusk, Catholic guilt atmosphere",
          "Cinematic still frame, 16mm grain, a man in a Hawaiian shirt walks down the sidewalk, shallow depth of field, street-level tension atmosphere",
          "Cinematic still frame, Éclair NPR handheld, she watches him pass from behind, her hand on the railing, desperate atmosphere",
          "Cinematic still frame, slow motion, he disappears around a corner, red neon reflects on wet pavement, paranoid atmosphere"
        ],
      },
      {
        narrative: "Slow motion: pool hall fight. Cue snaps. Beer glass shatters. Someone laughs.",
        scenes: [
          "Cinematic still frame, slow motion at variable frame rates, a crowded pool hall under fluorescent lights, Éclair NPR handheld, volatile atmosphere",
          "Cinematic still frame, 16mm grain, a pool cue snaps across a table edge, splinters fly, desperate atmosphere",
          "Cinematic still frame, extreme close-up, a beer glass shatters on a tile floor, amber liquid mid-splash, drunken disorientation atmosphere",
          "Cinematic still frame, Kodak reversal stock color shift, a man laughs in the background, red neon bar glow on his face, street-level tension atmosphere"
        ],
      },
      {
        narrative: "Hustler counts bills in a back room. Bare bulb swings. His shadow moves before he does.",
        scenes: [
          "Cinematic still frame, available light only, a hustler sits at a wooden table counting cash, bare red bulb overhead, paranoid atmosphere",
          "Cinematic still frame, 16mm blown up to 35mm grain, extreme close-up of hands counting crumpled bills, street-level tension atmosphere",
          "Cinematic still frame, Éclair NPR handheld, the bare bulb swings slowly, shadows shift across peeling walls, Catholic guilt atmosphere",
          "Cinematic still frame, body-mounted POV camera, his shadow on the wall moves independently, the man freezes, drunken disorientation atmosphere"
        ],
      },
    ],
    tags: ["#meanstreets", "#scorsese", "#70scinema", "#16mm", "#littleitaly", "#microshort"],
  },
  {
    id: "90s-indie",
    label: "Paris, Texas",
    icon: "☕",
    description: "Wenders & Robby Müller. Arriflex 35BL, static wide shots, sun-bleached Kodak, Edward Hopper loneliness.",
    visualKeywords: ["static wide shot on tripod", "Arriflex 35BL on Kodak 5247", "sun-bleached dusty reds and burnt orange", "enormous low-horizon skies", "golden hour natural light only", "slow zoom with emotional weight", "neon-to-natural light shift", "two-way mirror reflection framing"],
    moodKeywords: ["patient stillness", "sun-scorched melancholy", "emotional restraint", "Hopper-like isolation", "quiet devastation", "the weight of silence"],
    subjects: ["a drifter in a red baseball cap", "a woman behind one-way glass", "a man who forgot how to speak", "a boy who barely knows his father", "a figure walking an empty highway"],
    locations: ["an endless Mojave Desert highway", "a neon-lit Houston peep show booth", "a sun-bleached Texas gas station", "a motel room with curtains drawn", "a parking lot at the edge of nowhere"],
    actions: ["walks toward the horizon and doesn't stop", "presses his hand against glass she can't see through", "sits in a pickup truck staring at nothing", "speaks into a telephone without looking up", "watches a Super 8 home movie of a life he lost"],
    skits: [
      {
        narrative: "Man walks out of the desert. Red cap. No water. Doesn't stop when he reaches the road.",
        scenes: [
          "Cinematic still frame, Arriflex 35BL on Kodak 5247, sun-bleached dusty reds, a lone figure in a red baseball cap walks across an endless Mojave Desert highway, patient stillness atmosphere",
          "Cinematic still frame, enormous low-horizon sky, golden hour natural light, the drifter's cracked boots on blistering asphalt, sun-scorched melancholy atmosphere",
          "Cinematic still frame, static wide shot on tripod, a highway stretches to vanishing point, the figure reaches the road and keeps walking, Hopper-like isolation atmosphere",
          "Cinematic still frame, slow zoom with emotional weight, his silhouette against the burning horizon, he doesn't look back, quiet devastation atmosphere"
        ],
      },
      {
        narrative: "Woman sits behind glass. Man on the other side. He can see her. She talks to the dark.",
        scenes: [
          "Cinematic still frame, neon-to-natural light shift, a neon-lit Houston peep show booth, a woman behind one-way glass, emotional restraint atmosphere",
          "Cinematic still frame, Arriflex 35BL, a man presses his hand against the glass, two-way mirror reflection framing, the weight of silence atmosphere",
          "Cinematic still frame, Kodak 5247, extreme close-up of her lips speaking into a telephone, she can't see who listens, quiet devastation atmosphere",
          "Cinematic still frame, static wide shot, both figures separated by glass, neon glow and darkness, sun-scorched melancholy atmosphere"
        ],
      },
      {
        narrative: "Father and son in a pickup. Neither speaks. Ry Cooder plays on the radio. Boy turns it off.",
        scenes: [
          "Cinematic still frame, Arriflex 35BL on Kodak 5247, a dusty pickup truck parked at a sun-bleached Texas gas station, patient stillness atmosphere",
          "Cinematic still frame, golden hour natural light, a man and a boy sit in the cab, enormous low-horizon sky through the windshield, Hopper-like isolation atmosphere",
          "Cinematic still frame, close-up of a hand reaching for the radio dial, dashboard lit by desert sun, the weight of silence atmosphere",
          "Cinematic still frame, static wide shot on tripod, the pickup sits motionless, dust settles, emotional restraint atmosphere"
        ],
      },
      {
        narrative: "Gas station attendant watches a man cross the highway on foot. Shakes his head. Goes inside.",
        scenes: [
          "Cinematic still frame, sun-bleached dusty reds and burnt orange, a gas station attendant leans in a doorway, enormous low-horizon sky, patient stillness atmosphere",
          "Cinematic still frame, Arriflex 35BL, a figure crosses an empty desert highway on foot, static wide shot, Hopper-like isolation atmosphere",
          "Cinematic still frame, Kodak 5247, the attendant shakes his head slowly, sun on weathered face, quiet devastation atmosphere",
          "Cinematic still frame, slow zoom with emotional weight, the attendant turns and walks inside, screen door swings shut, the weight of silence atmosphere"
        ],
      },
      {
        narrative: "Motel room. Curtains glow orange. A Super 8 projector clicks. Home movies of someone else's family.",
        scenes: [
          "Cinematic still frame, golden hour natural light, a motel room with curtains drawn glowing orange, a man who forgot how to speak sits on the bed, sun-scorched melancholy atmosphere",
          "Cinematic still frame, Arriflex 35BL on Kodak 5247, a Super 8 projector beam cuts through dust, clicking sound, displaced nostalgia atmosphere",
          "Cinematic still frame, two-way mirror reflection framing, home movies of a family picnic flicker on a motel wall, quiet devastation atmosphere",
          "Cinematic still frame, static wide shot on tripod, the man watches alone, projector light on his face, the weight of silence atmosphere"
        ],
      },
    ],
    tags: ["#paristexas", "#wenders", "#robbymüller", "#35mm", "#americandesert", "#microshort"],
  },
  {
    id: "tokyo-noir",
    label: "Tokyo Noir",
    icon: "🌃",
    description: "Neon reflections on wet asphalt. Blade Runner meets Lost in Translation.",
    visualKeywords: ["neon reflections", "rain-soaked streets", "shallow depth of field", "cyan and magenta palette", "anamorphic bokeh", "top-down drone shot"],
    moodKeywords: ["isolated", "hypnotic", "yearning", "electric", "nocturnal"],
    subjects: ["a lone figure in a trench coat", "a hacker", "a heartbroken singer", "a yakuza deserter", "a sleepless photographer"],
    locations: ["Shinjuku's neon alleys", "a capsule hotel", "a rooftop overlooking Shibuya", "an underground ramen bar", "a rain-blurred crosswalk"],
    actions: ["disappears into a crowd of umbrellas", "traces kanji on a foggy window", "receives a cryptic text message", "walks endlessly through neon corridors"],
    skits: [
      {
        narrative: "Man rides by on a motorcycle. Woman watches from a window. He looks into the stormy sky.",
        scenes: [
          "Cinematic still frame, anamorphic bokeh, a motorcycle roars through rain-soaked Shinjuku streets, neon reflections streak on wet asphalt, hypnotic atmosphere",
          "Cinematic still frame, shallow depth of field, a woman watches from a rain-blurred window, cyan and magenta neon on her face, yearning atmosphere",
          "Cinematic still frame, neon reflections, the rider stops at a crosswalk and looks up at stormy sky, electric atmosphere",
          "Cinematic still frame, top-down drone shot, the motorcycle disappears into neon corridors, rain-soaked streets glow cyan, nocturnal atmosphere"
        ],
      },
      {
        narrative: "Figure stands at a crosswalk. Hundreds pass. Signal changes. They don't move.",
        scenes: [
          "Cinematic still frame, top-down drone shot, Shibuya crosswalk at night, hundreds of umbrellas, a lone figure stands still, isolated atmosphere",
          "Cinematic still frame, shallow depth of field, the crowd blurs around a motionless figure in a trench coat, neon reflections, hypnotic atmosphere",
          "Cinematic still frame, anamorphic bokeh, the crosswalk signal changes from red to green, cyan and magenta palette, electric atmosphere",
          "Cinematic still frame, rain-soaked streets, the crowd has passed, the figure remains alone at the empty crosswalk, yearning atmosphere"
        ],
      },
      {
        narrative: "Hacker closes a laptop. Neon sign outside flickers. Same message on both screens.",
        scenes: [
          "Cinematic still frame, CRT monitor glow, a hacker's face lit by a laptop screen in a capsule hotel, nocturnal atmosphere",
          "Cinematic still frame, shallow depth of field, fingers close the laptop lid, the room goes dark, claustrophobic atmosphere",
          "Cinematic still frame, neon reflections, a neon sign outside the window flickers the same characters, cyan and magenta palette, electric atmosphere",
          "Cinematic still frame, anamorphic bokeh, the hacker stares at the flickering sign, rain-soaked glass between them, hypnotic atmosphere"
        ],
      },
      {
        narrative: "Singer hums into a dead microphone. The empty bar listens anyway.",
        scenes: [
          "Cinematic still frame, shallow depth of field, a heartbroken singer stands at a microphone in an underground ramen bar, neon reflections, yearning atmosphere",
          "Cinematic still frame, cyan and magenta palette, close-up of lips humming into a dead microphone, isolated atmosphere",
          "Cinematic still frame, anamorphic bokeh, the empty bar stretches behind her, neon signs reflect on polished surfaces, nocturnal atmosphere",
          "Cinematic still frame, rain-soaked streets visible through the door, the song echoes in the empty room, hypnotic atmosphere"
        ],
      },
      {
        narrative: "Photographer snaps a photo. Checks the screen. Someone in the frame wasn't there before.",
        scenes: [
          "Cinematic still frame, neon reflections on wet asphalt, a sleepless photographer raises a camera in Shinjuku's neon alleys, electric atmosphere",
          "Cinematic still frame, shallow depth of field, flash fires, the alley freezes in white light, nocturnal atmosphere",
          "Cinematic still frame, CRT-like glow, the camera screen shows the photo, a figure stands in the frame, isolated atmosphere",
          "Cinematic still frame, anamorphic bokeh, the photographer looks up, the alley is empty, cyan and magenta neon flickers, hypnotic atmosphere"
        ],
      },
    ],
    tags: ["#tokyonoir", "#neoncinema", "#cyberpunk", "#nightcity", "#japanfilm", "#microshort"],
  },
  {
    id: "prenzlauer-90s",
    label: "Prenzlauer Berg 90s",
    icon: "🏚️",
    description: "Painterly East Berlin. Solitary figures on empty cobblestones, faded Plattenbau, dusk streetlights.",
    visualKeywords: ["oil painting texture", "muted ochre and teal palette", "dusk sodium streetlights", "cobblestone foreground", "desaturated socialist-era architecture", "solitary figure from behind", "faded signage in Arabic and German"],
    moodKeywords: ["melancholic stillness", "urban solitude", "post-reunification limbo", "quiet defiance", "displaced nostalgia"],
    subjects: ["a woman in a floral dress", "a figure in a red vest", "a bicycle leaning against a wall", "a silhouette at a building entrance", "a kid staring at a shuttered kiosk"],
    locations: ["an empty Prenzlauer Berg intersection at dusk", "a crumbling Altbau facade with a protest banner", "a tiled sidewalk outside a Spätverkauf", "a cobblestone street under sodium lights", "a brutalist apartment block against grey sky"],
    actions: ["stands alone on cobblestones watching the empty street", "stares at a faded Coca-Cola sign in Arabic script", "looks up at a building where a bedsheet banner hangs", "waits at a doorway covered in flyers and posters", "walks away from the viewer into the blue dusk"],
    skits: [
      {
        narrative: "Woman in a floral dress stands on cobblestones. Street is empty. Streetlights hum. She doesn't move.",
        scenes: [
          "Cinematic still frame, oil painting texture, a woman in a floral dress stands at an empty Prenzlauer Berg intersection at dusk, cobblestone foreground, melancholic stillness atmosphere",
          "Cinematic still frame, dusk sodium streetlights, the street stretches empty in both directions, desaturated socialist-era architecture, urban solitude atmosphere",
          "Cinematic still frame, muted ochre and teal palette, close-up of her face lit by a flickering sodium lamp, quiet defiance atmosphere",
          "Cinematic still frame, solitary figure from behind, she stands motionless as dusk deepens, cobblestones glow orange, displaced nostalgia atmosphere"
        ],
      },
      {
        narrative: "Kid stares at a building entrance. Posters everywhere. A cinema still above the door. Nobody comes out.",
        scenes: [
          "Cinematic still frame, oil painting texture, a kid staring at a shuttered kiosk near a building entrance covered in flyers, post-reunification limbo atmosphere",
          "Cinematic still frame, desaturated socialist-era architecture, layers of peeling posters and concert flyers on a crumbling Altbau facade, urban solitude atmosphere",
          "Cinematic still frame, muted ochre and teal palette, a faded cinema still photograph above a dark doorway, displaced nostalgia atmosphere",
          "Cinematic still frame, cobblestone foreground, the kid waits, nobody comes out, dusk sodium streetlights flicker on, melancholic stillness atmosphere"
        ],
      },
      {
        narrative: "Bicycle leans against a stained wall. Arabic Coca-Cola sign. Traffic light changes. No cars.",
        scenes: [
          "Cinematic still frame, oil painting texture, a bicycle leaning against a stained wall on a tiled sidewalk outside a Spätverkauf, urban solitude atmosphere",
          "Cinematic still frame, faded signage in Arabic and German, a Coca-Cola sign in Arabic script glows faintly, displaced nostalgia atmosphere",
          "Cinematic still frame, muted ochre and teal palette, a traffic light changes from red to green, desaturated socialist-era architecture behind, post-reunification limbo atmosphere",
          "Cinematic still frame, cobblestone foreground, the empty street stretches under sodium lights, no cars pass, melancholic stillness atmosphere"
        ],
      },
      {
        narrative: "Figure looks up at a brutalist block. White banner unfurls: YUPPIES SCRAM OUT OF EAST BERLIN. Wind tugs it.",
        scenes: [
          "Cinematic still frame, desaturated socialist-era architecture, a figure in a red vest looks up at a brutalist apartment block against grey sky, quiet defiance atmosphere",
          "Cinematic still frame, oil painting texture, a white bedsheet banner unfurls from a balcony, bold black letters, post-reunification limbo atmosphere",
          "Cinematic still frame, muted ochre and teal palette, wind tugs the banner, the figure watches, cobblestone foreground, urban solitude atmosphere",
          "Cinematic still frame, solitary figure from behind, the banner flaps against concrete, dusk sodium streetlights illuminate the scene, displaced nostalgia atmosphere"
        ],
      },
      {
        narrative: "Two streetlights flicker on. Cobblestones glow orange. A woman walks away. You only see her back.",
        scenes: [
          "Cinematic still frame, dusk sodium streetlights, two streetlights flicker to life on an empty Prenzlauer Berg intersection, melancholic stillness atmosphere",
          "Cinematic still frame, cobblestone foreground, the stones begin to glow warm orange under new light, muted ochre and teal palette, post-reunification limbo atmosphere",
          "Cinematic still frame, oil painting texture, a woman in a floral dress begins to walk away, solitary figure from behind, quiet defiance atmosphere",
          "Cinematic still frame, desaturated socialist-era architecture, she disappears into the blue dusk, you only see her back, displaced nostalgia atmosphere"
        ],
      },
    ],
    tags: ["#berlin90s", "#prenzlauerberg", "#postwall", "#eastberlin", "#urbansolitude", "#microshort"],
  },
  {
    id: "postapocalyptic",
    label: "Post-Apocalyptic",
    icon: "🔥",
    description: "Fury Road. Dust, chrome, and survival at the edge of civilization.",
    visualKeywords: ["orange and teal grade", "wide desert panorama", "dust particles in light", "practical explosions", "extreme close-ups", "overexposed sky"],
    moodKeywords: ["savage", "primal", "relentless", "desperate hope", "feral"],
    subjects: ["a road warrior", "a scavenger child", "a war-painted warlord", "a mute drifter", "a fuel-hoarding hermit"],
    locations: ["an endless desert highway", "a wrecked tanker fortress", "a dried-out riverbed", "a rusted vehicle graveyard", "a sandstorm's eye"],
    actions: ["revs a war-rig engine and screams into dust", "trades bullets for water", "paints their face for the final ride", "watches the horizon burn"],
    skits: [
      {
        narrative: "Child finds a working radio in the wreckage. Music plays. They've never heard music before.",
        scenes: [
          "Cinematic still frame, dust particles in light, a scavenger child crouches in a rusted vehicle graveyard, orange and teal grade, feral atmosphere",
          "Cinematic still frame, extreme close-ups, small hands pull a radio from twisted metal, dust particles float, desperate hope atmosphere",
          "Cinematic still frame, wide desert panorama, the radio crackles to life, music fills the wreckage, the child freezes, primal atmosphere",
          "Cinematic still frame, overexposed sky, the child holds the radio to their ear, eyes wide, tears cut through dust on their face, desperate hope atmosphere"
        ],
      },
      {
        narrative: "Drifter pours the last water into the sand. Watches it vanish. Keeps walking.",
        scenes: [
          "Cinematic still frame, wide desert panorama, a mute drifter stands on an endless desert highway, overexposed sky, relentless atmosphere",
          "Cinematic still frame, extreme close-ups, a canteen tilts, the last water pours onto cracked earth, savage atmosphere",
          "Cinematic still frame, dust particles in light, the water darkens the sand and vanishes, orange and teal grade, desperate hope atmosphere",
          "Cinematic still frame, wide desert panorama, the drifter turns and keeps walking toward the horizon, feral atmosphere"
        ],
      },
      {
        narrative: "Warlord removes war paint in a broken mirror. Underneath, just a tired old man.",
        scenes: [
          "Cinematic still frame, orange and teal grade, a war-painted warlord sits in a wrecked tanker fortress, practical set lighting, savage atmosphere",
          "Cinematic still frame, extreme close-ups, cracked mirror reflects war paint and scars, dust particles in light, primal atmosphere",
          "Cinematic still frame, dust particles in light, fingers smear white paint off weathered skin, relentless atmosphere",
          "Cinematic still frame, overexposed sky through a gap in metal, the mirror shows just a tired old man, desperate hope atmosphere"
        ],
      },
      {
        narrative: "Two strangers trade a bullet for a can of peaches. Neither trusts the other. Both eat.",
        scenes: [
          "Cinematic still frame, wide desert panorama, two strangers face each other in a dried-out riverbed, orange and teal grade, feral atmosphere",
          "Cinematic still frame, extreme close-ups, a single bullet held between fingers, a dented can of peaches on the ground, savage atmosphere",
          "Cinematic still frame, dust particles in light, hands exchange bullet for can, neither looks away, relentless atmosphere",
          "Cinematic still frame, overexposed sky, both sit in the dust eating peaches, backs to each other, desperate hope atmosphere"
        ],
      },
      {
        narrative: "Hermit starts the engine. It roars. Fuel gauge reads empty. He drives anyway.",
        scenes: [
          "Cinematic still frame, orange and teal grade, a fuel-hoarding hermit sits in a rusted war-rig, practical set lighting, primal atmosphere",
          "Cinematic still frame, extreme close-ups, a hand turns the ignition key, knuckles white, savage atmosphere",
          "Cinematic still frame, dust particles in light, the fuel gauge needle sits on empty, engine roars, relentless atmosphere",
          "Cinematic still frame, wide desert panorama, the rig tears across the desert trailing dust, overexposed sky, feral atmosphere"
        ],
      },
    ],
    tags: ["#postapocalyptic", "#madmax", "#furyroad", "#desertcinema", "#survivalfilm", "#microshort"],
  },
  {
    id: "scifi-alien",
    label: "Sci-Fi Alien",
    icon: "👾",
    description: "Alien meets 2001. Claustrophobic corridors and cosmic dread.",
    visualKeywords: ["cold blue lighting", "steam and fog", "CRT monitor glow", "practical sets", "slow dolly push", "silhouette against airlock"],
    moodKeywords: ["dread", "claustrophobic", "eerie calm", "cosmic horror", "industrial isolation"],
    subjects: ["a lone crew member", "an android with a secret", "a biologist studying a specimen", "a navigator losing sanity", "a corporate officer"],
    locations: ["a derelict spacecraft corridor", "a cryo-chamber", "the bridge of a deep-space freighter", "an alien egg chamber", "an observation deck facing the void"],
    actions: ["hears something breathing in the vents", "watches a blip approach on radar", "opens a door that should have stayed sealed", "floats in zero gravity, alone"],
    skits: [
      {
        narrative: "Crew member eats alone in the mess hall. Fork scrapes plate. Something scrapes back from inside the wall.",
        scenes: [
          "Cinematic still frame, cold blue lighting, a lone crew member eats in the mess hall of a deep-space freighter, industrial isolation atmosphere",
          "Cinematic still frame, practical sets, extreme close-up of a fork scraping a metal plate, steam rises, eerie calm atmosphere",
          "Cinematic still frame, slow dolly push, the crew member freezes, something scrapes from inside the wall, dread atmosphere",
          "Cinematic still frame, silhouette against airlock, the crew member stands, staring at the wall, CRT monitor glow flickers, claustrophobic atmosphere"
        ],
      },
      {
        narrative: "Android reads a book. Turns to the last page. Tears it out. Eats it.",
        scenes: [
          "Cinematic still frame, CRT monitor glow, an android with a secret sits reading a book on the bridge, cold blue lighting, eerie calm atmosphere",
          "Cinematic still frame, slow dolly push, close-up of synthetic fingers turning to the last page, practical sets, industrial isolation atmosphere",
          "Cinematic still frame, cold blue lighting, the android tears the final page from the book, steam and fog curls behind, cosmic horror atmosphere",
          "Cinematic still frame, extreme close-up, the android places the page in its mouth and chews, CRT monitor glow reflects in its eyes, dread atmosphere"
        ],
      },
      {
        narrative: "Navigator stares at the star map. One star blinks. Stars don't blink.",
        scenes: [
          "Cinematic still frame, CRT monitor glow, a navigator losing sanity stares at a holographic star map on the bridge, eerie calm atmosphere",
          "Cinematic still frame, cold blue lighting, hundreds of stars projected across the room, slow dolly push toward the map, cosmic horror atmosphere",
          "Cinematic still frame, practical sets, one star blinks, the navigator's eyes widen, dread atmosphere",
          "Cinematic still frame, silhouette against airlock, the navigator stands alone, the blinking star reflected in the viewport, claustrophobic atmosphere"
        ],
      },
      {
        narrative: "Biologist opens specimen jar. Empty. Jar was full a minute ago.",
        scenes: [
          "Cinematic still frame, cold blue lighting, a biologist studying a specimen holds a sealed jar in a derelict spacecraft corridor, industrial isolation atmosphere",
          "Cinematic still frame, slow dolly push, gloved hands twist the lid, steam and fog escapes, eerie calm atmosphere",
          "Cinematic still frame, practical sets, the jar is empty, residue lines the glass, the biologist stares, dread atmosphere",
          "Cinematic still frame, CRT monitor glow, the biologist looks up slowly at the dark corridor, something drips from the ceiling, cosmic horror atmosphere"
        ],
      },
      {
        narrative: "Officer records a log. Plays it back. A second voice is on the tape.",
        scenes: [
          "Cinematic still frame, CRT monitor glow, a corporate officer speaks into a recorder on the bridge, cold blue lighting, industrial isolation atmosphere",
          "Cinematic still frame, extreme close-up, a finger presses the playback button, steam and fog in background, eerie calm atmosphere",
          "Cinematic still frame, slow dolly push, the officer listens, a second voice speaks on the recording, dread atmosphere",
          "Cinematic still frame, silhouette against airlock, the officer stands frozen, the recorder plays on, the second voice continues, cosmic horror atmosphere"
        ],
      },
    ],
    tags: ["#scifi", "#alienfilm", "#cosmichorror", "#spacecinema", "#retroscifi", "#microshort"],
  },
];

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function generatePrompt(style: CinematicStyle) {
  const visual = pick(style.visualKeywords);
  const mood = pick(style.moodKeywords);
  const subject = pick(style.subjects);
  const location = pick(style.locations);
  const action = pick(style.actions);
  const skit = pick(style.skits);

  const prompt = `${visual}. ${subject} in ${location} ${action}. The mood is ${mood}.`;

  const imagePrompt = `Cinematic still frame, ${visual}, ${subject} in ${location}, ${action}, ${mood} atmosphere, ultra high resolution, movie scene, dramatic lighting, film photography`;

  const socialDescription = `🎬 ${style.icon} ${style.label} | A micro short film moment.\n\n"${subject} in ${location}... ${action}."\n\nShot in ${visual} style. The air is thick with ${mood} energy.\n\n${style.tags.join(" ")}`;

  return { prompt, imagePrompt, socialDescription, tags: style.tags, style, skit };
}

export type GeneratedContent = ReturnType<typeof generatePrompt> & {
  id: string;
  imageUrl?: string;
  storyboardUrl?: string;
  sceneImages?: [string?, string?, string?, string?];
  createdAt: Date;
};
