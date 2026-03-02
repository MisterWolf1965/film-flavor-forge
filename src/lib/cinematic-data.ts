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
    label: "70s Gritty",
    icon: "🎞️",
    description: "Taxi Driver meets Serpico. Grain, sweat, neon-lit decay.",
    visualKeywords: ["16mm film grain", "washed-out colors", "handheld camera", "dirty lens flare", "tungsten lighting", "high contrast shadows"],
    moodKeywords: ["paranoid", "desperate", "raw", "unhinged", "gritty realism"],
    subjects: ["a disgraced detective", "a street hustler", "a burned-out journalist", "a taxi driver", "a corrupt politician"],
    locations: ["a rain-soaked alley", "a decrepit motel room", "under a flickering subway light", "a smoky dive bar", "an abandoned parking garage"],
    actions: ["lights a cigarette and stares into the void", "counts crumpled bills under a bare bulb", "pushes through a crowd of faceless strangers", "wipes blood from their lip"],
    skits: [
      "Man waits at a phone booth. Phone rings. He doesn't answer.",
      "Detective sits in a parked car. Wipes the rearview mirror. Sees his own bloodshot eyes.",
      "A woman drops a bag of cash on a diner counter. Walks out. No one moves.",
      "Taxi idles at a red light. Driver stares at an empty backseat. Locks the doors.",
      "Man lights a match in a dark hallway. Sees a face. Blows it out.",
    ],
    tags: ["#70scinema", "#grittyfilm", "#neonnoir", "#analogfilm", "#cinematic", "#microshort"],
  },
  {
    id: "90s-jarmusch",
    label: "90s Jarmusch",
    icon: "☕",
    description: "Dead pans, long silences, beautiful boredom.",
    visualKeywords: ["black and white", "static wide shot", "natural light", "minimal composition", "long take", "35mm still frame"],
    moodKeywords: ["melancholic", "deadpan", "existential", "quietly absurd", "contemplative"],
    subjects: ["two strangers", "a lonely musician", "a night-shift worker", "a wandering poet", "a foreign tourist"],
    locations: ["a near-empty diner at 3AM", "a Memphis motel lobby", "a park bench in winter", "a laundromat", "a bus stop in the rain"],
    actions: ["share an awkward silence over coffee", "stares out a rain-streaked window", "reads a crumpled letter aloud to no one", "waits for something that never comes"],
    skits: [
      "Two strangers sit in a diner. One opens their mouth. Closes it. They both stare at the salt shaker.",
      "Man plays guitar on a fire escape. String breaks. He keeps strumming.",
      "Woman at a bus stop reads a postcard. Flips it. Blank. She smiles.",
      "Night-shift worker mops a floor. Reflection stares back. He waves at it.",
      "Poet writes a word on a napkin. Crumples it. Orders another coffee.",
    ],
    tags: ["#jarmusch", "#indiefilm", "#deadpan", "#blackandwhite", "#artcinema", "#microshort"],
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
