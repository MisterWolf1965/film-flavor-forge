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
  skits: string[];
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
      "Man walks into a bar. Jukebox plays. Camera strapped to his chest. Room tilts.",
      "Two guys argue over a card game. One flips the table. Nobody flinches.",
      "Girl waits on a tenement stoop. He walks past. She doesn't call out. He doesn't look back.",
      "Slow motion: pool hall fight. Cue snaps. Beer glass shatters. Someone laughs.",
      "Hustler counts bills in a back room. Bare bulb swings. His shadow moves before he does.",
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
      "Man walks out of the desert. Red cap. No water. Doesn't stop when he reaches the road.",
      "Woman sits behind glass. Man on the other side. He can see her. She talks to the dark.",
      "Father and son in a pickup. Neither speaks. Ry Cooder plays on the radio. Boy turns it off.",
      "Gas station attendant watches a man cross the highway on foot. Shakes his head. Goes inside.",
      "Motel room. Curtains glow orange. A Super 8 projector clicks. Home movies of someone else's family.",
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
      "Man rides by on a motorcycle. Woman watches from a window. He looks into the stormy sky.",
      "Figure stands at a crosswalk. Hundreds pass. Signal changes. They don't move.",
      "Hacker closes a laptop. Neon sign outside flickers. Same message on both screens.",
      "Singer hums into a dead microphone. The empty bar listens anyway.",
      "Photographer snaps a photo. Checks the screen. Someone in the frame wasn't there before.",
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
      "Woman in a floral dress stands on cobblestones. Street is empty. Streetlights hum. She doesn't move.",
      "Kid stares at a building entrance. Posters everywhere. A cinema still above the door. Nobody comes out.",
      "Bicycle leans against a stained wall. Arabic Coca-Cola sign. Traffic light changes. No cars.",
      "Figure looks up at a brutalist block. White banner unfurls: YUPPIES SCRAM OUT OF EAST BERLIN. Wind tugs it.",
      "Two streetlights flicker on. Cobblestones glow orange. A woman walks away. You only see her back.",
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
      "Child finds a working radio in the wreckage. Music plays. They've never heard music before.",
      "Drifter pours the last water into the sand. Watches it vanish. Keeps walking.",
      "Warlord removes war paint in a broken mirror. Underneath, just a tired old man.",
      "Two strangers trade a bullet for a can of peaches. Neither trusts the other. Both eat.",
      "Hermit starts the engine. It roars. Fuel gauge reads empty. He drives anyway.",
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
      "Crew member eats alone in the mess hall. Fork scrapes plate. Something scrapes back from inside the wall.",
      "Android reads a book. Turns to the last page. Tears it out. Eats it.",
      "Navigator stares at the star map. One star blinks. Stars don't blink.",
      "Biologist opens specimen jar. Empty. Jar was full a minute ago.",
      "Officer records a log. Plays it back. A second voice is on the tape.",
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
  createdAt: Date;
};
